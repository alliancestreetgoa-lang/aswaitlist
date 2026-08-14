/*
 * In-memory handoff between the waitlist form and the /thank-you page.
 *
 * The old step-3 panel showed the confirmed email and number back to the
 * visitor as reassurance. That panel is now the Thank You page, so the same
 * two values travel here instead.
 *
 * Deliberately NOT the URL: an email address and a phone number in a query
 * string would end up in server logs, referrer headers and browser history.
 * Deliberately NOT storage: this is one page-hop inside a single SPA session,
 * so module state is the smallest thing that works. A direct visit to
 * /thank-you (from the confirmation email, say) simply reads null and the
 * page renders its generic copy — that path is the common one, not an edge
 * case, so it must look complete on its own.
 */

let pending = null;

export function setSubmission(data) {
  pending = data;
}

/**
 * Reads the handoff and clears it, so a later re-render or a back-then-forward
 * navigation doesn't resurrect stale details.
 */
export function consumeSubmission() {
  const value = pending;
  pending = null;
  return value;
}
