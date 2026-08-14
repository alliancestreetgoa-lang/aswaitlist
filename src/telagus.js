/*
 * Files a confirmed lead into Telagus (the CRM), via our own proxy.
 *
 * The browser never sees the Telagus endpoint or its shared secret — it posts
 * to /api/lead, and the Netlify function behind that path adds the secret and
 * forwards the lead. See netlify/functions/lead.js for why the secret cannot
 * live on this side.
 *
 * What this side does have to send is the Firebase ID token from the
 * verification session that just finished. That is what proves to the proxy
 * that a real SMS was received on this number; without it the endpoint would
 * accept anything posted at it.
 *
 * Like the Firestore write, this is best-effort by design: it runs inside the
 * same beforeSignOut window and its failure must never cost a verified visitor
 * their confirmation. Callers catch and log.
 */

const ENDPOINT = '/api/lead';

// Longer than the proxy's own upstream budget, so a slow CRM surfaces as the
// proxy's 502 rather than as an ambiguous abort here. Still short enough that
// a dead endpoint can't hold the visitor on "Verifying…" indefinitely.
const TIMEOUT_MS = 12000;

export async function sendLeadToTelagus({ firstName, lastName, email, phone, country }, user) {
  if (!user) throw new Error('Telagus: no verified session to authenticate the lead with.');

  // Fetched fresh from the live session — the proxy checks it with Google and
  // pins the lead's phone number to whatever the token says was verified.
  const idToken = await user.getIdToken();

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      country,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    // The proxy returns a short machine-readable reason; the useful detail is
    // in the Netlify function log. Surface enough here to tell "we were
    // refused" apart from "the CRM was down".
    const reason = await res.json().then((b) => b?.error).catch(() => null);
    throw new Error(`Telagus proxy responded ${res.status}${reason ? ` (${reason})` : ''}`);
  }
}