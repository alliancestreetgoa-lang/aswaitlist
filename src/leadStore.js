import { loadFirebaseAuth } from './firebase';

/*
 * Persists a confirmed lead to Firestore.
 *
 * Loaded lazily for the same reason as the auth SDK (see firebase.js): the
 * Firestore chunk is only fetched at the moment a verified visitor completes
 * the form, never for readers or /thank-you visitors.
 *
 * The write MUST happen while the phone-verification session is still signed
 * in: the security rules only allow creates from an authenticated user, and
 * they pin the stored phone to auth.token.phone_number. Call this before
 * confirmVerificationCode's sign-out — which is why App.jsx passes the lead
 * into the confirm step rather than saving afterwards.
 */
export async function saveLead({ firstName, lastName, email, phone, attribution }) {
  // Reuses the already-initialised app; this only pulls the firestore chunk.
  await loadFirebaseAuth();
  const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  await addDoc(collection(db, 'waitlist'), {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone,
    // Where this lead came from (see attribution.js). Stored flat rather than
    // as a map so the console list view and exports can filter on `source`
    // directly. The rules cap each field; all are strings, '' when unknown.
    source: attribution?.source || 'direct',
    utmSource: attribution?.utmSource || '',
    utmMedium: attribution?.utmMedium || '',
    utmCampaign: attribution?.utmCampaign || '',
    utmContent: attribution?.utmContent || '',
    gclid: attribution?.gclid || '',
    referrer: attribution?.referrer || '',
    landingPage: attribution?.landingPage || '',
    // Server-stamped; the rules reject anything else.
    createdAt: serverTimestamp(),
  });
}
