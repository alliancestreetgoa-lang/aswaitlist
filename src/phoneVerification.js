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

function getVerifier(auth, authModule) {
  if (verifier) return verifier;
  verifier = new authModule.RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: 'invisible' });
  return verifier;
}

/**
 * Tears the reCAPTCHA down. Must run when the form unmounts, and again after a
 * failed send: a spent verifier cannot be reused, and leaving it attached makes
 * the next attempt fail with a confusing captcha error.
 */
export function resetVerification({ keepConfirmation = false } = {}) {
  if (verifier) {
    try { verifier.clear(); } catch { /* already detached */ }
    verifier = null;
  }
  const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (container) container.innerHTML = '';
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
    confirmation = await authModule.signInWithPhoneNumber(auth, e164, getVerifier(auth, authModule));
    return confirmation;
  } catch (err) {
    // A failed attempt burns the verifier; the next try needs a fresh one.
    resetVerification();
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
      return 'The security check failed. Reload the page and try again.';
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
