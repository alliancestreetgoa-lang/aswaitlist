# Alliance Street — Priority Access Webinar

Waitlist landing page for Alliance Street Group's next live webinar on UAE
company structures, international tax, banking, and relocation.

Visitors join a priority list via a three-step form (contact details → SMS
verification → confirmation), with a "book a consultation" escape hatch for
anyone who doesn't want to wait.

## Stack

- **React 19** + **Vite 8**
- **Firebase Auth** for phone (SMS) verification, code-split and loaded on demand
- **GSAP 3** (ScrollTrigger + SplitText) for the scroll choreography
- **lucide-react** for icons
- Self-hosted webfonts (Anton, Barlow, Barlow Condensed)
- No CSS framework — inline styles + one stylesheet, driven by tokens in
  `src/App.jsx` and documented in `DESIGN.md`

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint
```

## Project context

- **`PRODUCT.md`** — who this is for, what it's trying to achieve, and the
  strategic design principles behind it.
- **`DESIGN.md`** — the visual system: palette, type ramp, spacing, component
  behaviour, and the named rules the design holds itself to.
- **`FIREBASE_SETUP.md`** — phone (SMS) verification.
- **`TELAGUS_SETUP.md`** — where verified leads go, and the one environment
  variable the CRM integration needs.

## Structure

```
src/
  App.jsx              landing sections, app shell, router state
  ThankYou.jsx         the /thank-you confirmation page
  LegalPages.jsx       privacy policy and terms
  routes.js            route table, path/hash resolution, navigation helpers
  submission.js        in-memory form -> Thank You handoff (never the URL)
  firebase.js          lazy Firebase bootstrap (config is public by design)
  phoneVerification.js SMS send/confirm, reCAPTCHA lifecycle, error copy
  leadStore.js         the Firestore write
  telagus.js           the CRM write, via our own /api/lead proxy
  App.css              layout, responsive rules, card/glass treatments
  asc-tokens.css       webfont declarations and page-level defaults
  scrollAnimations.js  the full GSAP choreography (one scene per section)
netlify/functions/
  lead.js              the only server we run: holds the Telagus webhook
                       secret, and only forwards leads whose phone number
                       Google confirms was verified
public/
  fonts/               self-hosted woff2 (latin subset)
  images/              logo, hero photograph, founder portrait
```

## Routes

| Route | Reached by | Notes |
|---|---|---|
| `/` | default | the waitlist landing page |
| `/thank-you` | a successful form submission, or directly | canonical clean path; Netlify rewrites it to the app shell |
| `#/thank-you` | GitHub Pages | fallback, since Pages can't serve an unknown path |
| `#/privacy`, `#/terms` | footer links | hash-only; no server rewrite needed |

The form navigates to `/thank-you` only after every step has validated. A
submission that gets there is genuinely verified: Firebase has accepted an SMS
code for that number. On success the lead is written to Firestore and filed into
Telagus (CRM) — see `onConfirmCode` in `App.jsx`. There is no analytics or pixel
in this build.

## Motion

Animation lives entirely in `src/scrollAnimations.js`, one function per
section. Every animation is user-driven — scroll- or pointer-triggered — with
no idle loops. `prefers-reduced-motion` is fully honoured: all motion is
skipped and every element lands on its final state.

## Status

Pre-launch. Known gaps:

- **`TELAGUS_WEBHOOK_SECRET` must be set on Netlify** or the CRM leg returns
  503 and leads reach Firestore only. The secret is deliberately not in git and
  not in the bundle — see `TELAGUS_SETUP.md`.
- **No lead has been created in Telagus end to end yet.** The endpoint, the
  secret and the full payload mapping are verified against the live API, but
  the last step needs a real verification against a deploy — which is blocked
  by the billing item below.
- **Firebase phone auth is blocked on billing.** Verified: it returns
  `auth/billing-not-enabled` on the free Spark plan, and that blocks console test
  numbers too — so the flow cannot be exercised at all until the project is on
  Blaze. Everything else is configured. See `FIREBASE_SETUP.md`.
- **`/thank-you` 404s on production until the next deploy** — the Netlify rewrite
  that serves it lives in `netlify.toml` and hasn't shipped yet.
- Privacy Policy and Terms are drafted but **await legal review** —
  every `[TO CONFIRM]` marker needs a real answer before launch.
