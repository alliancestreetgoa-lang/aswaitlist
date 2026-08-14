import { loadFirebaseAuth, firebaseConfigStatus } from './firebase';

/*
 * Phone verification via Firebase Auth.
 *
 * Firebase requires a reCAPTCHA to issue an SMS — that is a hard requirement of
 * the provider, not a choice. We use the invisible variant, so for a legitimate
 * visitor it resolves silently on the click that requests the code; only
 * traffic Google scores as suspicious ever sees a challenge.
 *
 * The SDK is downloaded on the first send rather than at page load — see
 * firebase.js for why.
 *
 * There is no bypass switch. An earlier version of this form only *simulated*
 * the OTP, which meant an unverified number could reach the confirmed state —
 * exactly what the step exists to prevent. If Firebase is unconfigured the
 * verification fails loudly. To exercise the flow without sending real SMS, use
 * Firebase's own test numbers (Authentication → Sign-in method → Phone → "Phone
 * numbers for testing"); see FIREBASE_SETUP.md.
 */

export const RECAPTCHA_CONTAINER_ID = 'asc-recaptcha-container';

let verifier = null;
let verifierSlot = null;
let confirmation = null;

/**
 * Builds an E.164 number ('+447700900123'), which is the only format Firebase
 * accepts. Strips spaces and punctuation, and drops the national trunk '0' that
 * UK/NL/DE callers habitually type in front of the number.
 */
export function toE164(dialCode, nationalNumber) {
  const dial = String(dialCode).replace(/[^\d]/g, '');
  const national = String(nationalNumber).replace(/[^\d]/g, '').replace(/^0+/, '');
  return `+${dial}${national}`;
}

/** Rough sanity check before we spend an SMS on it. */
export function looksLikePhoneNumber(e164) {
  return /^\+[1-9]\d{7,14}$/.test(e164);
}

/**
 * Builds a verifier on a brand-new throwaway element.
 *
 * grecaptcha permanently marks whatever element it renders into. Neither
 * `verifier.clear()` nor wiping the host's innerHTML undoes that mark, so
 * pointing a second verifier at the same node throws "reCAPTCHA has already
 * been rendered in this element" — and a visitor whose first attempt failed
 * for any reason (wrong number, rate limit, dropped connection) could then
 * never retry without reloading the page. Giving every attempt its own child
 * element sidesteps the problem entirely: the host div is only ever a mount
 * point, never a render target.
 */
function createVerifier(auth, authModule) {
  const host = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!host) throw new Error('reCAPTCHA container is missing from the page.');
  const slot = document.createElement('div');
  host.appendChild(slot);
  verifierSlot = slot;
  verifier = new authModule.RecaptchaVerifier(auth, slot, { size: 'invisible' });
  return verifier;
}

/**
 * Tears the reCAPTCHA down. Runs when the form unmounts, after every send
 * (a verifier is single-use), and after a failed send. Removes the slot
 * element rather than emptying it — see createVerifier for why that matters.
 */
export function resetVerification({ keepConfirmation = false } = {}) {
  if (verifier) {
    try { verifier.clear(); } catch { /* already detached */ }
    verifier = null;
  }
  if (verifierSlot) {
    verifierSlot.remove();
    verifierSlot = null;
  }
  if (!keepConfirmation) confirmation = null;
}

/** Sends the six-digit code. Throws a friendly Error on failure. */
export async function sendVerificationCode(e164) {
  const status = firebaseConfigStatus();
  if (!status.configured) {
    throw new Error(
      import.meta.env.DEV
        ? `Phone verification isn’t configured yet — missing ${status.missing.join(', ')}. See FIREBASE_SETUP.md.`
        : 'Phone verification is temporarily unavailable. Please try again later.',
    );
  }
  if (!looksLikePhoneNumber(e164)) {
    throw new Error('That number doesn’t look right. Check the dialling code and try again.');
  }

  try {
    const { auth, authModule } = await loadFirebaseAuth();
    // Drop any verifier left over from a previous attempt before building one.
    resetVerification({ keepConfirmation: true });
    confirmation = await authModule.signInWithPhoneNumber(auth, e164, createVerifier(auth, authModule));
    // A verifier is single-use even on success — "Resend Code" needs a new one.
    resetVerification({ keepConfirmation: true });
    return confirmation;
  } catch (err) {
    // A failed attempt burns the verifier too; the next try needs a fresh one.
    resetVerification({ keepConfirmation: true });
    throw new Error(describeAuthError(err));
  }
}

/**
 * Confirms the code. Resolves only if Firebase accepts it — this is what makes
 * the number genuinely verified rather than merely typed.
 */
export async function confirmVerificationCode(code) {
  if (!confirmation) {
    throw new Error('Request a new code — the previous one is no longer valid.');
  }
  try {
    const credential = await confirmation.confirm(code);
    // Verification is all we wanted. The page has no signed-in features, so
    // leaving a live Firebase session behind would be a surprise to the visitor
    // and to anyone later reading the auth state. Best-effort, non-blocking.
    try {
      const { auth, authModule } = await loadFirebaseAuth();
      await authModule.signOut(auth);
    } catch { /* nothing depends on it */ }
    resetVerification();
    return credential;
  } catch (err) {
    throw new Error(describeAuthError(err));
  }
}

/** Turns a Firebase auth error code into something a visitor can act on. */
export function describeAuthError(err) {
  switch (err?.code) {
    case 'auth/invalid-phone-number':
      return 'That number doesn’t look right. Check the dialling code and try again.';
    case 'auth/missing-phone-number':
      return 'Enter your mobile number first.';
    case 'auth/invalid-verification-code':
      return 'That code doesn’t match. Check the six digits and try again.';
    case 'auth/code-expired':
      return 'That code has expired. Request a new one.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Wait a few minutes and try again.';
    case 'auth/quota-exceeded':
      return 'We can’t send codes right now. Please try again shortly.';
    case 'auth/captcha-check-failed':
      return 'The security check failed. Please try again.';
    // The reCAPTCHA token was refused by Firebase: expired, already spent, or
    // scored as automated traffic. Retrying as a normal visitor usually clears
    // it; scripted/headless clients will keep failing by design.
    case 'auth/invalid-app-credential':
      return import.meta.env.DEV
        ? 'Firebase rejected the reCAPTCHA token (auth/invalid-app-credential). Usually an expired/spent token, automated traffic, or reCAPTCHA config still propagating after a project change.'
        : 'The security check failed. Please try again.';
    // Firebase requires a billing account (Blaze) for phone auth — this fires
    // even for numbers registered as console test numbers, so a Spark-plan
    // project cannot exercise the flow at all.
    case 'auth/billing-not-enabled':
      return import.meta.env.DEV
        ? 'Firebase phone auth needs a billing account. Upgrade the project to the Blaze plan — see FIREBASE_SETUP.md.'
        : 'Phone verification is temporarily unavailable. Please try again later.';
    case 'auth/operation-not-allowed':
      // Two different causes share this code: the provider being off, and the
      // number's region not being on the SMS region allow-list. Naming only the
      // first sends you looking in the wrong place.
      return import.meta.env.DEV
        ? 'Phone sign-in rejected. Either the Phone provider is disabled (Authentication → Sign-in method) or this number’s region is not on the SMS region allow-list (Authentication → Settings → SMS region policy).'
        : 'Phone verification is temporarily unavailable. Please try again later.';
    case 'auth/unauthorized-domain':
      return import.meta.env.DEV
        ? 'This domain is not in Firebase’s authorised domains list. Add it under Authentication → Settings.'
        : 'Phone verification is temporarily unavailable. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.';
    default:
      // Never surface a raw SDK string to a visitor: they read as
      // "Firebase: Error (auth/billing-not-enabled)." — which is noise to them
      // and leaks the stack we run on. Keep the detail in dev and the console.
      if (import.meta.env.DEV) return err?.message || 'Something went wrong. Please try again.';
      if (err) console.error('[phone verification]', err);
      return 'Something went wrong. Please try again.';
  }
}
