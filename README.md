# Alliance Street — Priority Access Webinar

Waitlist landing page for Alliance Street Group's next live webinar on UAE
company structures, international tax, banking, and relocation.

Visitors join a priority list via a three-step form (contact details →
WhatsApp verification → confirmation), with a "book a consultation" escape
hatch for anyone who doesn't want to wait.

## Stack

- **React 19** + **Vite 8**
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
  App.jsx              all sections + the design tokens they consume
  App.css              layout, responsive rules, card/glass treatments
  asc-tokens.css       webfont declarations and page-level defaults
  scrollAnimations.js  the full GSAP choreography (one scene per section)
public/
  fonts/               self-hosted woff2 (latin subset)
  images/              logo, hero photograph, founder portrait
```

## Motion

Animation lives entirely in `src/scrollAnimations.js`, one function per
section. Every animation is user-driven — scroll- or pointer-triggered — with
no idle loops. `prefers-reduced-motion` is fully honoured: all motion is
skipped and every element lands on its final state.

## Status

Pre-launch. Known gaps:

- The WhatsApp OTP step is a **UI simulation** — no backend is wired up, so
  any six-digit code is accepted.
- The "Countries served", "Industries supported", and "Reviews and ratings"
  cards are explicitly labelled placeholders pending real content.
- "Book a Call" links point at `alliancestreet.ae` rather than a booking flow.
