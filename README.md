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

## Structure

```
src/
  App.jsx              landing sections, app shell, router state
  ThankYou.jsx         the /thank-you confirmation page
  LegalPages.jsx       privacy policy and terms
  routes.js            route table, path/hash resolution, navigation helpers
  submission.js        in-memory form -> Thank You handoff (never the URL)
  App.css              layout, responsive rules, card/glass treatments
  asc-tokens.css       webfont declarations and page-level defaults
  scrollAnimations.js  the full GSAP choreography (one scene per section)
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

The form navigates to `/thank-you` only after every step has validated. There is
no API, CRM, analytics or pixel in this build, so "submitted" currently means
"validated" — see the comment on `onConfirmCode` in `App.jsx` before wiring a real
endpoint in.

## Motion

Animation lives entirely in `src/scrollAnimations.js`, one function per
section. Every animation is user-driven — scroll- or pointer-triggered — with
no idle loops. `prefers-reduced-motion` is fully honoured: all motion is
skipped and every element lands on its final state.

## Status

Pre-launch. Known gaps:

- **Leads are not stored anywhere.** The number is genuinely verified (Firebase
  SMS OTP — see `FIREBASE_SETUP.md`), but on success the form only navigates to
  `/thank-you`. There is no backend, database or CRM, so nothing is persisted.
- **Firebase phone auth is blocked on billing.** Verified: it returns
  `auth/billing-not-enabled` on the free Spark plan, and that blocks console test
  numbers too — so the flow cannot be exercised at all until the project is on
  Blaze. Everything else is configured. See `FIREBASE_SETUP.md`.
- **`/thank-you` 404s on production until the next deploy** — the Netlify rewrite
  that serves it lives in `netlify.toml` and hasn't shipped yet.
- Privacy Policy and Terms are drafted but **await legal review** —
  every `[TO CONFIRM]` marker needs a real answer before launch.
