---
name: Alliance Street — Priority Access Webinar
description: Dark, red-accented waitlist landing page for a UAE company-structuring webinar
colors:
  ink-canvas: "#0A0A0A"
  bone: "#EDEAE3"
  bone-dim: "#9A9A9F"
  red-700: "#9E0A0E"
  red-600: "#C40D12"
  red-500: "#E4141A"
  red-400: "#F43A3F"
  red-300: "#FF6B6F"
  card-white: "#FFFFFF"
  card-ink: "#111113"
  card-body: "#4A4A52"
  card-muted: "#55555C"
  card-faint: "#7C7C84"
  card-label: "#3A3A42"
  card-border: "#E7E7EC"
  card-border-soft: "#EFEFF3"
  input-border: "#D8D8DE"
  hairline-dark: "rgba(255,255,255,0.11)"
typography:
  display:
    fontFamily: "Anton, 'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(40px, 4.2vw, 68px)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "0.005em"
  headline:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(34px, 3.4vw, 52px)"
    fontWeight: 700
    lineHeight: 1
  stat:
    fontFamily: "Anton, 'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(48px, 5vw, 76px)"
    fontWeight: 400
    lineHeight: 1
  stat-affix:
    fontFamily: "Anton, 'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(24px, 2.5vw, 38px)"
    fontWeight: 400
    lineHeight: 1.15
  label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "0.14em"
  body:
    fontFamily: "Barlow, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "10px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  pill: "999px"
spacing:
  section-y-desktop: "88px-104px"
  section-y-mobile: "44px-60px"
  section-x-desktop: "48px"
  section-x-mobile: "18px-24px"
  content-max: "1360px"
components:
  button-primary:
    backgroundColor: "{colors.red-500}"
    textColor: "#FFFFFF"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.red-400}"
  button-secondary-dark:
    backgroundColor: "rgba(255,255,255,0.055)"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
---

# Design System: Alliance Street — Priority Access Webinar

## Overview

**Creative North Star: "The Trading Floor at Night"**

The page reads as a near-black canvas — the same working-after-hours confidence as `alliancestreet.ae` — with a single hot-red accent that carries every point of emphasis: CTAs, active states, stat numerals, the recurring underline rule beneath headlines. Condensed, heavy, all-caps display type (Anton for hero-scale words, Barlow Condensed for section headlines and labels) does the shouting; everything else stays quiet. A fixed, barely-there fractal-noise grain sits over the whole canvas — enough to keep the black from feeling like a flat digital void, not enough to be decorative.

Against that dark field, white "paperwork" cards surface wherever the page asks the visitor to commit something real: the signup form, testimonials, stat callouts. These cards are deliberately un-dark — they read as physical documents being handed across a desk, not as generic UI panels — which is the visual argument for the brand's core promise: this is a serious operator who handles real paperwork, not a startup collecting emails.

Two surfaces are the exception, and both earn it by sitting over the hero's Dubai-skyline photograph or the dark canvas: the hero signup form and the Credibility section's cards are **liquid glass** — translucent white (72–86%) with a blur/saturate backdrop, a glass edge highlight, and a red glow. Glass is used where showing the world behind the surface is the point; everywhere else stays opaque paperwork.

This is explicitly not the generic SaaS look: no cream/beige surfaces, no pastel gradients, no oversized soft-rounded corners, no gradient-fill buttons. Red is scarce by design.

**Key Characteristics:**
- Near-black canvas (`#0A0A0A`) with a fixed fractal-noise grain overlay (opacity 0.035)
- One accent color (`#E4141A` red) carrying all emphasis; no secondary/tertiary brand colors
- White "paperwork" cards as the only light surfaces, always for commitment moments (forms, proof, numbers)
- Two liquid-glass exceptions (hero form, Credibility cards) where the photo/canvas behind should read through
- A Dubai-skyline photograph behind the hero only, under a directional scrim; every other section is bare canvas
- Condensed/display caps typography for anything that needs authority; humanist sans for reading
- Depth comes from red-tinted shadows, never neutral gray

## Colors

Two coexisting palettes by design: a dark palette for the page canvas and everything sitting directly on it, and a light palette confined entirely to white cards. They never mix within one surface.

### Primary
- **Signal Red** (`#E4141A`): the only accent in the system. CTAs, active step-bar segments, stat numerals, icon tints, the recurring underline rule, focus rings. Used at full strength for text/icons/buttons, and at low alpha (6–14%) for tinted backgrounds and shadows.
- Hover state: **Bright Red** (`#F43A3F`). Pressed/active: **Deep Red** (`#C40D12`). Rare tint-on-dark: **Ember Red** (`#9E0A0E`).

### Neutral (dark canvas)
- **Ink Canvas** (`#0A0A0A`): the page background, every section, the sticky header (at 92% opacity with backdrop-blur).
- **Bone** (`#EDEAE3`): primary heading/label text directly on the dark canvas.
- **Bone Dim** (`#9A9A9F`): body copy and secondary text on the dark canvas.
- **Hairline** (`rgba(255,255,255,0.11)`): section dividers and borders on the dark canvas — matches the parent site's `hr-line` token exactly, for brand continuity.

### Neutral (light cards)
- **Card White** (`#FFFFFF`): the only light surface — form card, testimonial cards, stat cards, cover-topic cards.
- **Card Ink** (`#111113`) / **Card Body** (`#4A4A52`) / **Card Muted** (`#55555C`) / **Card Faint** (`#7C7C84`) / **Card Label** (`#3A3A42`): the text ramp used exclusively inside white cards, darkest to lightest.
- **Card Border** (`#E7E7EC`) / **Card Border Soft** (`#EFEFF3`) / **Input Border** (`#D8D8DE`): hairlines and input strokes, light-card context only.

### Named Rules
**The One Accent Rule.** Red is the only brand color. If a second accent color feels necessary, the fix is spacing or type weight, not a new hue.

**The No-Mixed-Surface Rule.** Dark-canvas text colors (Bone / Bone Dim) never appear inside a white card, and light-card text colors never appear directly on the dark canvas. Each surface owns its own ramp.

## Typography

**Display Font:** Anton (with Barlow Condensed, Arial Narrow fallback)
**Headline/Label Font:** Barlow Condensed (with Arial Narrow fallback)
**Body Font:** Barlow (with Helvetica Neue, Arial fallback)

**Character:** Anton's ultra-condensed, no-lowercase-nuance heaviness carries the hero moment; Barlow Condensed's slightly softer condensed grotesk handles section headlines, buttons, and tracked labels so the page doesn't shout everywhere at once; Barlow (regular width, humanist) is reserved entirely for reading — body copy, form labels, FAQ answers.

### Hierarchy
- **Display** (400, `clamp(40px, 4.2vw, 68px)`, line-height 0.94, uppercase): hero H1 only. One per page. Sized to keep the entire hero (headline through the form's submit button) within a single viewport — see the one-screen rule in Layout.
- **Headline** (700, `clamp(34px, 3.4vw, 52px)`, line-height 1, uppercase): every section H2/H3 ("Why join the priority list", "What the webinar may cover"...). Exception: the final CTA heading ("Would You Rather Not Wait?") intentionally scales slightly larger — `clamp(34px, 3.6vw, 56px)` — as the page's last conversion moment; a confirmed one-off, not a new ramp step.
- **Title** (700, 26px, uppercase): sub-step headings inside the form (e.g. "Confirm your number").
- **Stat** (400, `clamp(48px, 5vw, 76px)`, line-height 1): the Strategy section's proof figures (200 / 20 / 17). Set in Card Ink, not red — the numeral carries the weight and red is reserved for its **Stat affix** (400, `clamp(24px, 2.5vw, 38px)`), the trailing `+`. A 17px muted label sits beneath. Each figure counts up on scroll. The hero's inline stat card is a different, denser thing: fixed 28px numerals in red inside a single row.
- **Body** (400–600, 16–19px, line-height 1.5–1.65, max ~65ch): paragraphs, FAQ answers, testimonial quotes.
- **Label** (700, 12–15px, letter-spacing 0.10em–0.22em, uppercase): eyebrow tags, form field labels, stat captions, footer column headers.

### Named Rules
**The All-Caps Authority Rule.** Anything meant to carry weight (headings, labels, buttons) is uppercase and condensed. Anything meant to be read comfortably (paragraphs) is sentence case and regular-width.

## Layout

Single-column content flow, sections centered in a `1360px` max-width container with `48px` horizontal padding on desktop (`18–24px` stepped down at the 760px/560px breakpoints). Vertical section rhythm is generous: `88–104px` top/bottom padding on desktop, compressing to `44–60px` on mobile. The hero is the deliberate exception — see below.

**The One-Screen Hero Rule.** On desktop (>1100px) the hero fills exactly one viewport: `min-height: calc(100vh - 80px)` (the sticky header's height), vertically centered, with tightened padding (`20px/24px`) and a compressed internal rhythm so the headline, body copy, trust checks, stat card, and the *entire* signup form through its submit button all sit above the fold. Nothing in the hero may grow without a compensating trim — the first screen is the conversion surface. Below 1100px the lock releases (`min-height: 0`) and the stacked layout scrolls normally, because one screen is not achievable there.

Multi-column moments use CSS Grid, always collapsing to a single stacked column under `1100px`: hero (1.05fr content / 0.95fr sticky form), why-join and credibility (3 equal columns → 2 → 1), webinar-coverage (2 columns → 1), host bio (0.8fr portrait / 1.2fr text), footer (1.4fr brand / 1fr / 1fr). The hero's form card is `position: sticky` on desktop and becomes static (in normal flow) below 1100px.

## Elevation & Depth

Two depth registers. **Opaque paperwork cards are flat**, lifted only by a brand-tinted shadow (`rgba(228,20,26,0.14–0.28)`) — depth reinforces brand color instead of competing with it. **Glass surfaces are genuinely dimensional**: they add a deep neutral shadow (`rgba(0,0,0,0.38–0.48)`) for real 3D separation from the photo/canvas behind them, an inset white edge highlight to read as a glass lip, and a red glow on top. The neutral shadow is what sells the volume; the red glow keeps it on brand.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 10px 30px rgba(228,20,26,.14)`): default resting shadow for opaque white cards.
- **Glass lift** (`inset 0 1px 0 rgba(255,255,255,.6–.65)`, `0 24px 48–60px rgba(0,0,0,.38–.45)`, plus a red glow): the hero form and Credibility cards.
- **Glass hover** (deepens to `0 34px 64px rgba(0,0,0,.48)` + `0 0 44px rgba(228,20,26,.4)`, with a 6px lift and 1.5% scale): Credibility cards only.
- **CTA glow** (`box-shadow: 0 8px 24px rgba(228,20,26,.28)` at rest, up to `0 0 30px rgba(228,20,26,.45)` on the hero-level CTA): primary red buttons only.

### Named Rules
**The Red Shadow Rule.** Opaque surfaces never take a neutral black/gray shadow — theirs is always red-tinted. Glass surfaces are the one exception: they pair a deep neutral shadow (for volume) with a red glow (for brand), never a neutral shadow alone.

## Shapes

Radius scale: `10px` (buttons, inputs) → `12px` (primary/secondary CTA buttons, verification code input) → `16px` (hero stat card) → `18px` (content cards — why/cover/testimonial/stat) → `22px` (form card, host portrait) → `999px` (pill CTAs, chips, badge, avatar circles). Borders are always 1px hairlines — `rgba(255,255,255,0.11)` directly on the dark canvas, `#E7E7EC`/`#D8D8DE` inside white cards — never a heavier decorative border.

## Components

### Buttons
- **Shape:** `10–12px` radius for rectangular CTAs, `999px` for pill CTAs (final section, header "Book a Call").
- **Primary:** solid `#E4141A` fill, white uppercase Barlow Condensed 700 label, red-tinted glow shadow. Hover shifts fill to `#F43A3F` and deepens the glow.
- **Secondary (dark canvas):** translucent white fill (`rgba(255,255,255,0.055)`), `rgba(255,255,255,0.2)` border, bone-colored label — used for "I'll Wait for the Webinar" and "Learn More About Alliance Street". Hover: border/text shift to red.
- **Secondary (inside white card):** white fill, `#D8D8DE` border, dark label — the "Back to details" step-back button and the WhatsApp verify button (dark-fill variant) inside the form.

### Cards
- **Corner Style:** `18px` (content cards), `22px` (form card, portrait frame).
- **Background:** always `#FFFFFF` — the system's only light surface.
- **Shadow Strategy:** see Elevation & Depth — red-tinted, never neutral.
- **Border:** 1px `#E7E7EC` hairline.
- **Internal Padding:** `24–28px` typical, `34–36px` for the form card.

### Inputs / Fields
- **Style:** white fill, `#D8D8DE` 1px border, `10px` radius, `44px` height (`60px` for the large OTP code field).
- **Focus:** border shifts to `#E4141A` with a `3px` red glow ring (`box-shadow: 0 0 0 3px rgba(228,20,26,.14)`).
- **Placeholder:** `#9A9AA2`.

### Navigation
Sticky header, `rgba(10,10,10,.92)` fill with `14px` backdrop-blur, `1px` hairline bottom border (`rgba(255,255,255,0.11)`). Logo + wordmark left, one text link + one primary CTA button right. No dropdown/mega-menu — the whole page is one scroll-anchored flow.

### FAQ Accordion (signature component)
Borderless rows separated by hairline top-borders, question in Barlow (600, 19px) with a chevron icon, answer reveals below in `#55555C`/`#9A9A9F`. Only one row open at a time; the last FAQ starts pre-opened as a hint. No card chrome — it inherits the dark canvas directly.

## Do's and Don'ts

### Do:
- **Do** keep red as the only accent — no second brand hue, ever.
- **Do** tint every shadow with red instead of neutral black/gray.
- **Do** keep dark-canvas text (Bone/Bone Dim) and light-card text (Card Ink/Body/Muted) strictly separated by surface.
- **Do** use uppercase condensed type for anything meant to command attention; sentence-case Barlow for anything meant to be read.
- **Do** collapse every multi-column grid to a single stacked column below `1100px`, and disable the form card's `position: sticky` at that same breakpoint.

### Don't:
- **Don't** introduce a cream/beige/pastel surface anywhere — surfaces are the `#0A0A0A` canvas, an opaque white card, or translucent white glass; never a tinted mid-tone.
- **Don't** reach for glass decoratively — it is earned only where the photo or canvas behind the surface should read through (hero form, Credibility cards). Everywhere else stays opaque.
- **Don't** let anything grow the desktop hero past one viewport without trimming something else (see the One-Screen Hero Rule).
- **Don't** use a gradient fill on any button or heading — solid red only.
- **Don't** add a second accent color, even for "informational" or "success" states — reuse red or a bone/gray tint instead.
- **Don't** give a card a heavier-than-1px border or a side-stripe accent border.
- **Don't** round corners past `22px` (or `999px` for true pills) — nothing in this system is that soft.
