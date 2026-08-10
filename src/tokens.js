// Shared design tokens. The visual system these belong to is documented in
// DESIGN.md — change them there too if you change them here.

// Zoom scheduler — drives every booking CTA (header, hero confirmation,
// and the closing 'Book a Consultation' section).
export const BOOKING_URL =
  'https://scheduler.zoom.us/d/8stansn-/free-zero-tax-business--discovery-call';

// Main Alliance Street site — the footer "Website" link and the host
// section's "Learn More" button.
export const SITE_URL = 'https://www.alliancestreet.ae/';

// Stallone Shaikh's personal LinkedIn, used in the host bio. The footer
// keeps the company page (/company/79507309/) — person vs. brand.
export const LINKEDIN_PROFILE_URL =
  'https://www.linkedin.com/in/stallone-shaikh-033a38118';

// Vite only rewrites asset paths it can see (CSS url(), imports). Plain
// strings in JSX and inline styles need the base prefix applied by hand,
// or they 404 when the site is served from a subpath (GitHub Pages).
export const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

// Brand
export const RED = '#E4141A';
export const RED_HOVER = '#F43A3F';

// alliancestreet.ae background palette (dark canvas)
export const BG = '#0A0A0A';
export const BONE = '#EDEAE3';
export const BONE_DIM = '#9A9A9F';
export const LINE = 'rgba(255,255,255,0.11)';

// white "paperwork" card palette (form, testimonials, stat cards)
export const WHITE = '#FFFFFF';
export const CARD_INK = '#111113';
export const CARD_MUTED = '#55555C';
export const CARD_FAINT = '#7C7C84';
export const CARD_LABEL = '#3A3A42';
export const CARD_BORDER = '#E7E7EC';
export const INPUT_BORDER = '#D8D8DE';

// dark-glass form palette (hero signup card sits over the skyline photo)
export const GLASS_FIELD = 'rgba(18,18,20,0.88)';
export const GLASS_FIELD_BORDER = 'rgba(255,255,255,0.22)';
export const GLASS_DIVIDER = 'rgba(255,255,255,0.16)';
export const GLASS_DIM = '#CFCFD4'; // dim text that still clears AA over the photo
export const GLASS_PANEL = 'rgba(18,18,20,0.60)';

// alternating section tone: sections run black -> white -> black -> ...
export const LIGHT_BG = '#FFFFFF';
