/*
 * First-touch traffic-source attribution.
 *
 * The question this module answers on every lead: "where did this person
 * FIRST come from?" — Instagram bio link, a Google Ads click, a YouTube
 * description, or somewhere untagged.
 *
 * How the answer is built, in order of trust:
 *   1. UTM parameters on the landing URL (utm_source=instagram&...) — the
 *      links we hand out on each channel carry these.
 *   2. Ad-click ids (gclid = Google Ads auto-tagging, fbclid = Meta) — these
 *      identify the platform even when someone forgets the UTMs.
 *   3. The referrer hostname — a plain click from instagram.com or
 *      youtube.com still names itself.
 *   4. Nothing → 'direct' (typed URL, DM'd link, bookmark).
 *
 * WHY localStorage: people rarely fill the form on the visit that brought
 * them. They land from an Instagram story, leave, and come back tomorrow by
 * typing the URL — at which point the query string and referrer are gone. So a
 * visit banks its evidence and a later, weaker visit leaves it alone.
 *
 * WHICH VISIT WINS — the strongest evidence, and the most recent at equal
 * strength (see STRENGTH below). A visit that carries a campaign tag we handed
 * out (utm_*, gclid, fbclid) is a deliberate click on a specific link, so it
 * replaces whatever was stored: someone who saw the Instagram post in June and
 * clicks the Facebook ad in September converted on Facebook, and the ad that
 * was paid for should get the credit. Weaker visits never displace a tagged
 * one: a bare referrer only says which site linked here, and an untagged
 * return says nothing at all, so neither can erase a campaign.
 *
 * This is deliberately NOT pure first-touch. It used to be, and the effect was
 * that the first tagged link a browser ever saw stuck permanently — every
 * later campaign link filed its leads under the original source, with the
 * original campaign name and landing page attached (reported 7 Sep 2026: a
 * Facebook link recorded as instagram/'test').
 *
 * Everything returned is a plain string (empty when unknown), never null —
 * the Firestore rules and the Telagus proxy both validate a fixed shape, and
 * "always the same keys" keeps those checks simple on both sides.
 */

const STORAGE_KEY = 'as_attribution_v1';

// Generous for real campaign names, small enough that a garbage URL can't
// bloat the lead. Mirrored by the Firestore rules and the proxy's validation.
const MAX_LEN = 200;

// Referrer hosts that identify a channel on their own. Checked by suffix so
// l.instagram.com, m.youtube.com, www.google.co.uk etc. all match.
const REFERRER_SOURCES = [
  ['instagram.com', 'instagram'],
  ['youtube.com', 'youtube'],
  ['youtu.be', 'youtube'],
  ['facebook.com', 'facebook'],
  ['t.co', 'twitter'],
  ['linkedin.com', 'linkedin'],
  ['google.', 'google'],
  ['bing.', 'bing'],
];

function clean(value) {
  return typeof value === 'string'
    ? value.trim().slice(0, MAX_LEN)
    : '';
}

function referrerSource(referrer) {
  let host;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return '';
  }
  // Never classify ourselves (SPA reloads) or a dev server as a source.
  if (host === window.location.hostname || host === 'localhost') return '';
  for (const [needle, source] of REFERRER_SOURCES) {
    if (host === needle || host.includes(needle)) return source;
  }
  return '';
}

/**
 * Boils the raw evidence down to one word the CRM can filter on.
 * gclid outranks utm_source because auto-tagging is machine-set while UTMs
 * are hand-typed — when both are present the click definitely came from
 * Google Ads whatever the UTM claims.
 */
function classify({ utmSource, utmMedium, gclid, fbclid, referrer }) {
  if (gclid) return 'google-ads';
  if (utmSource) {
    const s = utmSource.toLowerCase();
    // A tagged Google click that declares itself paid is Google Ads even
    // without a gclid (e.g. manual tagging with auto-tagging turned off).
    if (s === 'google' && /^(cpc|ppc|paid)/.test(utmMedium.toLowerCase())) return 'google-ads';
    return s;
  }
  if (fbclid) return 'facebook';
  const ref = referrerSource(referrer);
  if (ref) return ref;
  return 'direct';
}

/*
 * How much a visit's evidence is worth, for deciding whether it may replace
 * what is already stored. Higher wins; an equal score means the newer visit
 * wins, so re-clicking a channel's link refreshes its campaign and landing
 * page rather than being ignored.
 */
const STRENGTH = { tagged: 3, referrer: 2, direct: 1 };

function strengthOf({ utmSource, gclid, fbclid, referrer }) {
  if (utmSource || gclid || fbclid) return STRENGTH.tagged;
  if (referrerSource(referrer)) return STRENGTH.referrer;
  return STRENGTH.direct;
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(record) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private mode, cleared site data). The in-memory copy
    // below still covers a same-session submission.
  }
}

// Fallback when storage is unavailable: whatever this page load captured.
let sessionRecord = null;

/**
 * Reads the current URL + referrer and persists them as the visitor's
 * first-touch record. Call once, as early as possible on page load — before
 * the SPA router or anything else has a chance to touch the URL.
 */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const evidence = {
    utmSource: clean(params.get('utm_source')),
    utmMedium: clean(params.get('utm_medium')),
    utmCampaign: clean(params.get('utm_campaign')),
    utmContent: clean(params.get('utm_content')),
    gclid: clean(params.get('gclid')),
    fbclid: clean(params.get('fbclid')),
    referrer: clean(document.referrer),
  };

  const record = {
    source: classify(evidence),
    strength: strengthOf(evidence),
    utmSource: evidence.utmSource,
    utmMedium: evidence.utmMedium,
    utmCampaign: evidence.utmCampaign,
    utmContent: evidence.utmContent,
    gclid: evidence.gclid,
    referrer: evidence.referrer,
    landingPage: clean(window.location.pathname + window.location.search),
    firstSeenAt: new Date().toISOString(),
  };

  sessionRecord = record;

  const stored = read();
  // Records written before this field existed carry no strength; score them
  // from what they did store, so an old first-touch entry still ranks.
  const storedStrength = stored
    ? (stored.strength || strengthOf({
      utmSource: stored.utmSource,
      gclid: stored.gclid,
      fbclid: '',
      referrer: stored.referrer,
    }))
    : 0;
  if (record.strength >= storedStrength) write(record);
}

/**
 * The attribution fields to attach to a lead. Fixed shape, all strings.
 */
export function getAttribution() {
  const record = read() || sessionRecord;
  return {
    source: clean(record?.source) || 'direct',
    utmSource: clean(record?.utmSource),
    utmMedium: clean(record?.utmMedium),
    utmCampaign: clean(record?.utmCampaign),
    utmContent: clean(record?.utmContent),
    gclid: clean(record?.gclid),
    referrer: clean(record?.referrer),
    landingPage: clean(record?.landingPage),
  };
}
