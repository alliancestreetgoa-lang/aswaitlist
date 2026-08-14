/*
 * Routing.
 *
 * The legal pages use hash routes ('#/privacy', '#/terms') because this build
 * ships to two hosts with different rules: Netlify serves from the domain root
 * and can rewrite, GitHub Pages serves from '/aswaitlist/' and 404s any path it
 * has no file for. A hash needs no server cooperation, so it works on both.
 *
 * The Thank You page is the exception that has to be a real, clean URL: it is
 * the address people land on from a confirmation email, paste to a colleague,
 * and fire a conversion on. So it is reachable BOTH ways:
 *
 *   /thank-you    canonical — dev, `vite preview`, and Netlify (see the
 *                 rewrite in netlify.toml). This is what the form navigates to.
 *   #/thank-you   fallback — GitHub Pages, where an unknown path can't be
 *                 served at all. Chosen automatically from BASE_URL.
 *
 * Both render the identical page, so a link written either way always works.
 */

// '/' on Netlify and in dev; '/aswaitlist/' on GitHub Pages (see vite.config.js).
const BASE = import.meta.env.BASE_URL;

// Only a root deploy can serve a clean path — the dev server and `vite preview`
// fall back to index.html for unknown paths, and netlify.toml rewrites this one.
const CLEAN_PATHS_WORK = BASE === '/';

const THANK_YOU_PATH = `${BASE}thank-you`;

export const ROUTES = { HOME: 'home', PRIVACY: 'privacy', TERMS: 'terms', THANK_YOU: 'thank-you' };

export function readRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/privacy')) return ROUTES.PRIVACY;
  if (hash.startsWith('#/terms')) return ROUTES.TERMS;
  if (hash.startsWith('#/thank-you')) return ROUTES.THANK_YOU;

  // Trailing slashes are stripped so '/thank-you/' matches too.
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === THANK_YOU_PATH.replace(/\/+$/, '')) return ROUTES.THANK_YOU;

  return ROUTES.HOME;
}

/** The href a link should use to reach the Thank You page on this host. */
export const thankYouHref = CLEAN_PATHS_WORK ? THANK_YOU_PATH : '#/thank-you';

/** Where the logo goes from any sub-page: back to the landing page. */
export const homeHref = BASE;

/*
 * Hash routes are relative to whatever path the browser is currently on, and
 * the path is half of the route on the Thank You page. A bare '#/privacy' from
 * '/thank-you' produces '/thank-you#/privacy' — which renders correctly, but
 * leaves the pathname behind, so a later '#top' resolves back to the Thank You
 * page instead of the landing page. Both helpers below pin the path explicitly
 * whenever we are not already on the landing page, and stay with the cheap
 * in-page hash change when we are.
 */
function onLandingPath() {
  return window.location.pathname.replace(/\/+$/, '') === BASE.replace(/\/+$/, '');
}

/** href for a hash route ('#/privacy'), correct from any current path. */
export function hashHref(hash) {
  return onLandingPath() ? hash : `${BASE}${hash}`;
}

/** href for "back to the landing page", correct from any current path. */
export function landingHref() {
  return onLandingPath() ? '#top' : BASE;
}

/**
 * Sends the visitor to the Thank You page. Called only after a submission has
 * actually succeeded — see onConfirmCode in App.jsx.
 */
export function goToThankYou() {
  if (!CLEAN_PATHS_WORK) {
    // Assigning the hash fires 'hashchange' on its own.
    window.location.hash = '#/thank-you';
    return;
  }
  window.history.pushState({}, '', THANK_YOU_PATH);
  // pushState never fires popstate, so the router has to be told by hand.
  window.dispatchEvent(new PopStateEvent('popstate'));
}
