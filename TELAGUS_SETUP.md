# Telagus (CRM) setup

Verified leads are filed into Telagus through its inbound lead webhook. This
describes how that is wired, what has been checked, and what you still have to
do in the Netlify dashboard.

## The shape of it

```
browser                    Netlify function                Telagus
─────────                  ────────────────                ───────
form confirmed
  │
  ├─ Firestore write ─────────────────────────────────────────────▶ (durable record)
  │
  └─ POST /api/lead ──────▶ verify ID token with Google
      { idToken, ...lead }   │
                             ├─ phone in token == phone submitted?
                             │
                             └─ POST /api/webhooks/11/lead ────────▶ lead created
                                 X-Webhook-Secret: ••••
```

Both writes happen in the same window — after Firebase accepts the SMS code and
before the session is signed out — and both are best-effort. A visitor who
verified their number always reaches `/thank-you`, even if one or both stores
are down; failures are logged, not shown.

### Why there is a function at all

The webhook is authenticated by a shared secret in the `X-Webhook-Secret`
header. This site is a static SPA, so **any secret the browser holds is
readable in devtools** — publishing it would let anyone inject leads into the
CRM. The secret therefore lives only in a Netlify environment variable, and
`netlify/functions/lead.js` is the only thing that ever sends it.

That makes `/api/lead` the new front door, so it does not take the client's
word for anything. It requires the Firebase ID token from the verification
session that just completed, checks it with Google, and refuses the lead unless
the submitted number is the number Google says was verified. This is the same
rule `firestore.rules` enforces on the direct client write, expressed
server-side.

## What you need to set

In **Netlify → Site configuration → Environment variables**:

| Variable | Required | Notes |
|---|---|---|
| `TELAGUS_WEBHOOK_SECRET` | yes | The shared secret. **No `VITE_` prefix** — that prefix is what publishes a variable to the browser bundle. |
| `TELAGUS_WEBHOOK_URL` | no | Defaults to `https://api.telagus.com/api/webhooks/11/lead`. |
| `TELAGUS_LEAD_POSITION` | no | Pipeline position. Defaults to `Leads`. |
| `FIREBASE_API_KEY` | no | Falls back to `VITE_FIREBASE_API_KEY`, which is already set. Only set this to use a separately restricted key. |

`VITE_FIREBASE_*` are already configured (see `FIREBASE_SETUP.md`) and are
public by design — do not confuse the two groups.

## Payload mapping

| Form field | Telagus |
|---|---|
| First name | `contacts[0].first_name` |
| Last name | `contacts[0].last_name` |
| Work email | `contacts[0].email` |
| Verified mobile (E.164) | `contacts[0].phone_number` |
| Landing URL (first touch) | `lead.form_page` — `https://<domain><path+query>`, composed in the function so the CRM row is clickable. Opaque click ids (`fbclid`, `gclid`, `gbraid`, `wbraid`, `msclkid`, `dclid`, `ttclid`) are stripped: they are unreadable to the team and long enough to blow the cap alone (an fbclid runs ~150 chars). Telagus caps this field at **191 chars** and 422s the whole lead beyond it (seen live Sep 6 2026), so what remains is cut to 191 — the domain is never the part dropped. The full landing page, click ids included, is in `lead.message`. |
| Country selector | `contacts[0].country` (resolved from the ISO code **in the function**, so the CRM only ever sees a vocabulary this side controls) |
| Traffic source | `lead.lead_source` — the channel label the CRM list is filtered by (see below). |
| — | `lead.form: "Webinar Waitlist"`, `lead.lead_title`, `lead.form_page` (see above), `lead.message`, `lead.lead_position_id: ["Leads"]`, `lead.domain`, `lead.ip` |

### `lead_source` labels

One channel must produce one label, or filtering the CRM by channel silently
misses leads. `utm_source` is free text, so the same channel arrives spelled
several ways — `SOURCE_ALIASES` in `buildPayload()`'s module folds them onto a
canonical source before `SOURCE_LABELS` names it:

| Arrives as | Filed as |
|---|---|
| `fb`, `facebook`, `fb_ads`, `meta`, or an `fbclid` with no UTMs | `Facebook` |
| `ig`, `instagram`, `ig-ads` | `Instagram` |
| `adwords`, `gads`, `googleads`, or any `gclid` | `Google Ads` |
| `google` with an organic medium | `Google (organic)` |
| no campaign tag at all | `Website` |

Anything unrecognised comes through as `Campaign: <source>` rather than being
dropped — that is the cue to add it to the alias or label map. This mattered
live: a Meta campaign tagged `utm_source=fb` filed as `Campaign: fb` while
clicks on the same ad that carried only an `fbclid` filed as `Facebook`, so
Facebook leads appeared to be missing when they were under the other label
(reported 7 Sep 2026).

`companies` is omitted because the form collects no company details, and
`custom_fields` is omitted because every custom field on this account belongs
to a longer qualification form — sending invented values would put noise in the
CRM. Both are one edit away in `buildPayload()` when the form starts asking.

## What has been verified

Checked live against `https://api.telagus.com/api/webhooks/11/lead`:

- **The endpoint is live and the header is the auth mechanism.** No secret and
  a wrong secret both return `401`.
- **The secret is valid.** With the real secret and an empty body the endpoint
  returns `422 {"lead.lead_source": ["Lead source is required."]}` — a
  validation error rather than an auth error, which only a good secret reaches.
- **The payload mapping is accepted.** Posting the exact payload above with
  `lead_source` deliberately removed returned *only* the `lead_source` error —
  so every other field, including `lead_position_id: ["Leads"]` and the whole
  contact block, passed validation. Neither probe created a lead: `422` fails
  before anything is persisted.
- **`Leads` is a real pipeline position** on the account (`lead_positions.id 7`,
  `is_lead = 1`).
- **The secret is not in the bundle.** `dist/` contains no occurrence of the
  secret, `api.telagus.com`, or `X-Webhook-Secret`.

Not yet verified: **an actual end-to-end lead creation**, which requires either
a real SMS verification or a deliberate test post, and which writes a real
record someone may action. Do that once against a live deploy and delete the
test lead afterwards.

## Local development

`npm run dev` runs Vite only, so `/api/lead` does not exist and the CRM leg
fails with a logged `404` — the form still works. To exercise the function:

```bash
npx netlify dev            # serves the site and the function together
```

with `TELAGUS_WEBHOOK_SECRET` in a local `.env` (gitignored).

## GitHub Pages

The Pages deploy (`.github/workflows/deploy.yml`) is static hosting with no
functions, so `/api/lead` 404s there and leads reach Firestore only. Netlify is
the deploy that files leads into the CRM.

## Troubleshooting

The useful detail is in **Netlify → Functions → `lead` → logs**; the browser is
told only that the lead did not land. Errors returned to the client:

| Status | `error` | Meaning |
|---|---|---|
| 401 | `missing_token` / `unverified` | No ID token, or Google rejected it (expired, forged). |
| 403 | `phone_mismatch` | The submitted number is not the verified one. |
| 400 | `invalid_email` etc. | Failed the field checks that mirror `firestore.rules`. |
| 503 | `not_configured` | `TELAGUS_WEBHOOK_SECRET` or the Firebase key is unset on the site. |
| 502 | `upstream_rejected` | Telagus refused the payload — the response body is in the log. |
| 502 | `upstream_unreachable` | Telagus timed out (8s budget). |

If every lead returns `upstream_rejected` with a `401` status in the log, the
secret has been rotated: update `TELAGUS_WEBHOOK_SECRET` and redeploy.

A `422` names the field in the log body, e.g. `lead.form_page ... must not be
greater than 191 characters` — Telagus enforces per-field length caps it does
not document. Cap the value in `buildPayload()` and add a case to
`test/lead.test.mjs`.

If a `form_page` in the CRM looks truncated, check what was sacrificed before
changing the cap: `formPageUrl()` drops the click ids first and only then cuts,
so a shortened URL still carries the domain and the `utm_*` params. A row that
shows a bare path with no domain predates that fix (before 7 Sep 2026).
