import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload } from '../netlify/functions/lead.js';

// Telagus validates lead.form_page at 191 characters (observed live:
// 422 "The lead.form page must not be greater than 191 characters."). An ad
// landing URL — utm_* plus a ~90-char gclid — is longer than that, and every
// such lead was being rejected while Firestore, which has no such cap, kept it.
const lead = {
  firstName: 'Test', lastName: 'Lead', email: 't@example.com', phone: '+447700900123', country: 'GB',
};
const meta = { ip: null, domain: 'alliancestreet.co.uk', position: 'Leads' };

test('form_page never exceeds the 191-char limit Telagus enforces', () => {
  const landingPage = '/?utm_source=google&utm_medium=cpc&utm_campaign=webinar-uk-uae-structuring&utm_content=rsa-1&gclid='
    + 'Cj0KCQjw'.repeat(14);
  assert.ok(landingPage.length > 191, `fixture must exceed 191 (is ${landingPage.length})`);
  const attribution = { source: 'google-ads', landingPage, utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'webinar', utmContent: '', gclid: 'x', referrer: '' };
  const { lead: out } = buildPayload({ ...lead, attribution }, meta);
  assert.ok(out.form_page.length <= 191, `form_page is ${out.form_page.length} chars`);
  assert.ok(out.form_page.startsWith('/?utm_source=google'));
});

test('a short landing page passes through unchanged; missing one falls back to /', () => {
  const short = buildPayload({ ...lead, attribution: { source: 'instagram', landingPage: '/?utm_source=instagram' } }, meta);
  assert.equal(short.lead.form_page, '/?utm_source=instagram');
  const none = buildPayload({ ...lead, attribution: { source: 'direct', landingPage: '' } }, meta);
  assert.equal(none.lead.form_page, '/');
});
