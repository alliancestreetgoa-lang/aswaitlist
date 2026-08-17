/*
 * Google Ads conversion tracking.
 *
 * The global site tag itself lives in index.html — it loads gtag.js and calls
 * gtag('config', 'AW-16514892045'), which is what powers page views and
 * remarketing audiences. That part works on its own and this module does not
 * touch it.
 *
 * What the base tag does NOT do is tell Google Ads that a signup happened. A
 * conversion is a separate, explicit gtag('event', 'conversion', ...) call, and
 * without it the Conversions column stays at zero no matter how much the
 * campaign spends — which also means Smart Bidding has nothing to optimise
 * towards. That call is this module's whole job.
 *
 * WHY NOT TRACK A /thank-you PAGE VIEW INSTEAD?
 * Because it would not fire. Google Ads can be configured to count a conversion
 * on the load of a URL, but this is an SPA: goToThankYou() reaches /thank-you
 * via history.pushState (see routes.js), and pushState does not trigger a gtag
 * page view. The only visitors it would ever count are the ones who open
 * /thank-you cold from a confirmation email — i.e. precisely the people who did
 * not just convert. Firing from the submit handler instead ties the conversion
 * to a real, phone-verified submission and cannot be replayed by reloading or
 * re-sharing the URL.
 *
 * A NOTE ON "SECRETS": the conversion label is not one. Like the Firebase web
 * config in firebase.js, it ships in the client bundle by definition — anyone
 * can read it in devtools. It lives in .env only so the build isn't hard-coded
 * to one Google Ads account.
 */

// Must match the id configured in index.html. The two are deliberately written
// out rather than shared, because index.html has to run the tag before the
// bundle has loaded at all.
const CONVERSION_ID = 'AW-16514892045';

// The per-conversion-action half of the send_to value. Google Ads → Goals →
// Conversions → (your action) → Tag setup → "Install the tag yourself": it is
// the part after the slash, e.g. 'AbC-D_efGhIjKl'. See .env.example.
const CONVERSION_LABEL = import.meta.env.VITE_ADS_CONVERSION_LABEL;

// What one waitlist lead is declared to be worth, as configured on the Google
// Ads conversion action. 1.0 AED is Google's placeholder default, not a real
// estimate — it exists so the Conversion value column isn't empty. Raising it
// to an actual value per lead is what lets Smart Bidding optimise for revenue
// rather than raw lead count, so it is worth revisiting once there is enough
// data to know what a webinar registration is actually worth.
const CONVERSION_VALUE = 1.0;
const CONVERSION_CURRENCY = 'AED';

/**
 * Reports a completed waitlist signup to Google Ads.
 *
 * Safe to call unconditionally: it is a no-op when the label is unset (so a
 * fresh clone or a preview build doesn't fire junk conversions) and when gtag
 * is missing entirely (ad blockers remove it for a meaningful slice of paid
 * traffic). Every failure is swallowed — analytics must never be able to break
 * the redirect to /thank-you for a visitor who has already submitted.
 *
 * @returns {boolean} whether the event was actually handed to gtag.
 */
export function trackWaitlistConversion() {
  if (!CONVERSION_LABEL) {
    if (import.meta.env.DEV) {
      console.warn(
        '[ads] VITE_ADS_CONVERSION_LABEL is not set — no conversion was reported. '
        + 'See .env.example.',
      );
    }
    return false;
  }

  if (typeof window.gtag !== 'function') {
    if (import.meta.env.DEV) {
      console.warn('[ads] gtag is unavailable (blocked, or index.html tag removed).');
    }
    return false;
  }

  try {
    // No event_callback / redirect handshake here on purpose. goToThankYou()
    // is a pushState navigation, not a document unload, so the page is never
    // torn down and the beacon has all the time it needs to go out.
    window.gtag('event', 'conversion', {
      send_to: `${CONVERSION_ID}/${CONVERSION_LABEL}`,
      value: CONVERSION_VALUE,
      currency: CONVERSION_CURRENCY,
    });
    return true;
  } catch (err) {
    console.error('[ads]', err);
    return false;
  }
}
