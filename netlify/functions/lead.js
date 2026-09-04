/*
 * Telagus lead webhook proxy.
 *
 * WHY THIS EXISTS AT ALL
 *
 * The Telagus webhook is authenticated by a shared secret in the
 * X-Webhook-Secret header. That secret can never travel to the browser: this
 * is a static SPA, so anything the client holds is readable in devtools, and a
 * leaked secret means anyone on the internet can inject leads straight into the
 * CRM. So the browser posts to this function, and the function — running on
 * Netlify with the secret in an environment variable — is the only thing that
 * ever talks to Telagus.
 *
 * That moves the problem rather than solving it, though: this endpoint is now
 * the open door. So it does not accept a lead on the client's say-so. It
 * requires the Firebase ID token from the phone-verification session that just
 * completed, checks that token with Google, and pins the submitted number to
 * the one Google says was verified. It is the same rule the Firestore security
 * rules enforce on the direct client write (see firestore.rules), expressed
 * server-side — a lead reaches the CRM only if someone genuinely received an
 * SMS on that number.
 *
 * Required environment variables (Netlify → Site configuration → Environment):
 *   TELAGUS_WEBHOOK_SECRET   the shared secret, sent as X-Webhook-Secret
 *   TELAGUS_WEBHOOK_URL      optional; defaults to the production endpoint
 *   TELAGUS_LEAD_POSITION    optional; pipeline position, defaults to 'Leads'
 *   FIREBASE_API_KEY         optional; falls back to VITE_FIREBASE_API_KEY,
 *                            which the site already sets for the client build
 */

const DEFAULT_ENDPOINT = 'https://api.telagus.com/api/webhooks/11/lead';

// Google's token endpoint. accounts:lookup validates the signature, the
// issuer and the expiry for us, and hands back the verified phone number —
// which is the whole reason we call it rather than decoding the JWT ourselves.
const IDENTITY_TOOLKIT = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';

// A request body is a handful of short strings, a small attribution block and
// a token. Anything substantially larger is not a lead, so it is rejected
// before it is parsed.
const MAX_BODY_BYTES = 12288;

// Upstream calls are bounded so a hanging dependency can't pin the function
// open for its full timeout — the visitor is waiting on this.
const UPSTREAM_TIMEOUT_MS = 8000;

/*
 * The country selector's ISO codes, resolved here rather than trusting a
 * display string from the client: the CRM should only ever see values from a
 * vocabulary this side controls. Keep in step with COUNTRIES in src/App.jsx.
 */
const COUNTRY_NAMES = {
  GB: 'United Kingdom',
  IE: 'Ireland',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  ES: 'Spain',
  IT: 'Italy',
  CH: 'Switzerland',
  AE: 'United Arab Emirates',
  US: 'United States',
  ZA: 'South Africa',
  IN: 'India',
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Nothing here is cacheable and none of it should be stored by a proxy.
      'Cache-Control': 'no-store',
    },
  });
}

function str(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max
    ? value.trim()
    : null;
}

/*
 * The attribution block is best-effort context, never a reason to refuse a
 * verified lead: unknown fields are dropped, oversized values truncated, and
 * a missing/malformed block collapses to 'direct'. Mirrors src/attribution.js.
 */
const ATTR_FIELDS = ['source', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'gclid', 'referrer', 'landingPage'];
const ATTR_MAX_LEN = 200;

function cleanAttribution(raw) {
  const attr = {};
  for (const key of ATTR_FIELDS) {
    const value = raw?.[key];
    attr[key] = typeof value === 'string' ? value.trim().slice(0, ATTR_MAX_LEN) : '';
  }
  if (!attr.source) attr.source = 'direct';
  return attr;
}

/*
 * lead_source labels for the sources the campaign actually runs, so the CRM
 * list view reads cleanly. Anything else (a new utm_source someone invents on
 * the fly) still comes through, prefixed so it is obviously campaign-tagged.
 */
const SOURCE_LABELS = {
  'google-ads': 'Google Ads',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  google: 'Google (organic)',
  bing: 'Bing (organic)',
  direct: 'Website',
};

function leadSourceLabel(source) {
  return SOURCE_LABELS[source] || `Campaign: ${source}`;
}

/*
 * form_page is sent as an absolute URL so the CRM row is clickable — the team
 * should not have to join `domain` and a bare path in their head.
 *
 * leads.form_page is varchar(191) upstream, so a composed URL that would
 * overflow drops back to the path, which always fits. Scheme is fixed https:
 * the site is HTTPS-only in every deploy that has this function.
 */
const MAX_FORM_PAGE = 191;

function formPageUrl(landingPage, domain) {
  // The client posts this value, so it is not necessarily a clean path. Now
  // that the field reads as a link in the CRM, an absolute URL from the client
  // is reduced to its path — nobody on the team should be handed an off-site
  // link that a submitter chose.
  let raw = landingPage || '';
  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw, 'https://placeholder.invalid');
      raw = parsed.pathname + parsed.search;
    } catch {
      raw = '';
    }
  }
  const path = raw
    ? (raw.startsWith('/') ? raw : `/${raw}`)
    : '/';
  if (!domain) return path.slice(0, MAX_FORM_PAGE);
  const absolute = `https://${domain}${path}`;
  return absolute.length <= MAX_FORM_PAGE ? absolute : path.slice(0, MAX_FORM_PAGE);
}

/**
 * Confirms the ID token with Google and returns the phone number the session
 * was actually verified against. Throws if the token is missing, expired,
 * forged, or belongs to a session that never verified a number.
 */
async function verifiedPhoneNumber(idToken, apiKey) {
  const res = await fetch(`${IDENTITY_TOOLKIT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`identity toolkit responded ${res.status}`);
  const data = await res.json();
  const phone = data?.users?.[0]?.phoneNumber;
  if (!phone) throw new Error('token carries no verified phone number');
  return phone;
}

/**
 * Maps a verified lead onto the Telagus webhook payload.
 *
 * Only the two blocks we have real data for are sent. `companies` is omitted
 * entirely because the form collects no company details, and `custom_fields`
 * is left off because every custom field in this Telagus account belongs to a
 * longer qualification form — inventing values for them would put noise in the
 * CRM. Add them here when the form starts asking for them.
 */
function buildPayload({ firstName, lastName, email, phone, country, attribution }, { ip, domain, position }) {
  const countryName = COUNTRY_NAMES[country] || null;

  // The message carries the full attribution trail: lead_source is one word
  // for filtering, but campaign/medium/referrer detail belongs where the team
  // reads the lead. Only lines with real values are added.
  const attributionLines = [
    ['Traffic source', attribution.source],
    ['UTM campaign', attribution.utmCampaign],
    ['UTM medium', attribution.utmMedium],
    ['UTM content', attribution.utmContent],
    ['Referrer', attribution.referrer],
    ['Landing page', attribution.landingPage],
    ['gclid', attribution.gclid],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  return {
    lead: {
      lead_source: leadSourceLabel(attribution.source),
      lead_title: 'Priority Access Webinar — waitlist',
      form: 'Webinar Waitlist',
      form_page: formPageUrl(attribution.landingPage, domain),
      message:
        'Joined the priority list for the next Alliance Street webinar on UAE company '
        + 'structures, international tax, banking and relocation. Mobile number verified by SMS.'
        + (attributionLines ? `\n\n${attributionLines}` : ''),
      lead_position_id: [position],
      ...(domain ? { domain } : {}),
      ...(ip ? { ip } : {}),
    },
    contacts: [
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        is_primary_contact: 1,
        ...(countryName ? { country: countryName } : {}),
      },
    ],
  };
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  const secret = process.env.TELAGUS_WEBHOOK_SECRET;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!secret || !apiKey) {
    // A misconfigured site is our problem, not the visitor's — log it loudly
    // and tell the client only that the lead did not land.
    console.error('[telagus] missing config:', {
      secret: Boolean(secret),
      firebaseApiKey: Boolean(apiKey),
    });
    return json(503, { error: 'not_configured' });
  }

  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' });
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const idToken = typeof body?.idToken === 'string' ? body.idToken : null;
  if (!idToken) return json(401, { error: 'missing_token' });

  // Field limits mirror firestore.rules, so the same lead is either accepted
  // by both stores or rejected by both.
  const firstName = str(body.firstName, 100);
  const lastName = str(body.lastName, 100);
  const email = str(body.email, 254);
  const phone = str(body.phone, 20);
  const country = typeof body.country === 'string' ? body.country.toUpperCase() : null;
  const attribution = cleanAttribution(body.attribution);

  if (!firstName || !lastName) return json(400, { error: 'invalid_name' });
  if (!email || !EMAIL_RE.test(email)) return json(400, { error: 'invalid_email' });
  if (!phone || !E164_RE.test(phone)) return json(400, { error: 'invalid_phone' });

  let verifiedPhone;
  try {
    verifiedPhone = await verifiedPhoneNumber(idToken, apiKey);
  } catch (err) {
    console.warn('[telagus] token rejected:', err.message);
    return json(401, { error: 'unverified' });
  }

  // The submitted number must be the one Google verified. Without this check
  // a valid token from any verified visitor would be enough to file a lead
  // against someone else's number.
  if (verifiedPhone !== phone) {
    console.warn('[telagus] phone/token mismatch');
    return json(403, { error: 'phone_mismatch' });
  }

  const payload = buildPayload(
    { firstName, lastName, email, phone, country, attribution },
    {
      ip: context?.ip || req.headers.get('x-nf-client-connection-ip') || null,
      domain: (() => {
        try { return new URL(req.url).hostname; } catch { return null; }
      })(),
      position: process.env.TELAGUS_LEAD_POSITION || 'Leads',
    },
  );

  let upstream;
  try {
    upstream = await fetch(process.env.TELAGUS_WEBHOOK_URL || DEFAULT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    console.error('[telagus] request failed:', err.message);
    return json(502, { error: 'upstream_unreachable' });
  }

  if (!upstream.ok) {
    // The response body is the only way to diagnose a rejected mapping, so it
    // goes to the function log — never back to the browser, which has no use
    // for it and should not learn how the CRM is wired.
    const detail = await upstream.text().catch(() => '');
    console.error('[telagus] rejected the lead:', upstream.status, detail.slice(0, 500));
    return json(502, { error: 'upstream_rejected', status: upstream.status });
  }

  return json(200, { ok: true });
};

// Netlify Functions 2.0 routing: this replaces a netlify.toml redirect and
// keeps the public path next to the code that serves it.
export const config = { path: '/api/lead' };
