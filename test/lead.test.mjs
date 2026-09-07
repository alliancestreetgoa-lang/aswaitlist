import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload } from '../netlify/functions/lead.js';

// Telagus validates lead.form_page at 191 characters (observed live:
// 422 "The lead.form page must not be greater than 191 characters."). An ad
// landing URL — utm_* plus a ~90-char gclid — is longer than that, and every
// such lead was being rejected while Firestore, which has no such cap, kept it.
// form_page is sent as an absolute URL when that fits, else the bare path.
const lead = {
  firstName: 'Test', lastName: 'Lead', email: 't@example.com', phone: '+447700900123', country: 'GB',
};
const meta = { ip: null, domain: 'alliancestreet.co.uk', position: 'Leads' };
const formPage = (attribution, m = meta) => buildPayload({ ...lead, attribution }, m).lead.form_page;

test('form_page never exceeds the 191-char limit Telagus enforces', () => {
  const landingPage = '/?utm_source=google&utm_medium=cpc&utm_campaign=webinar-uk-uae-structuring&utm_content=rsa-1&gclid='
    + 'Cj0KCQjw'.repeat(14);
  assert.ok(landingPage.length > 191, `fixture must exceed 191 (is ${landingPage.length})`);
  const out = formPage({ source: 'google-ads', landingPage });
  assert.ok(out.length <= 191, `form_page is ${out.length} chars`);
  // Too long for an absolute URL, so it drops back to the path.
  assert.ok(out.startsWith('/?utm_source=google'));
});

test('a landing path that fits is sent as an absolute URL on the site domain', () => {
  assert.equal(formPage({ source: 'instagram', landingPage: '/?utm_source=instagram' }),
    'https://alliancestreet.co.uk/?utm_source=instagram');
  assert.equal(formPage({ source: 'direct', landingPage: '' }), 'https://alliancestreet.co.uk/');
});

test('an absolute URL that would just overflow falls back to the path, not a cut URL', () => {
  const landingPage = '/?' + 'a=b&'.repeat(42); // 170 chars: fits bare, overflows with the domain
  assert.ok(landingPage.length <= 191 && ('https://alliancestreet.co.uk' + landingPage).length > 191);
  assert.equal(formPage({ source: 'direct', landingPage }), landingPage);
});

test('a client-supplied absolute URL is reduced to its path before composing', () => {
  assert.equal(formPage({ source: 'direct', landingPage: 'https://evil.example/phish?x=1' }),
    'https://alliancestreet.co.uk/phish?x=1');
});

test('without a request domain the bare path is sent', () => {
  assert.equal(formPage({ source: 'direct', landingPage: '/?utm_source=youtube' }, { ...meta, domain: null }),
    '/?utm_source=youtube');
});
