import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload } from '../netlify/functions/lead.js';

// Telagus validates lead.form_page at 191 characters (observed live:
// 422 "The lead.form page must not be greater than 191 characters."), so the
// composed URL has to be capped somewhere. Where matters: an ad landing URL
// exceeds the cap on its click id alone — an fbclid runs ~150 chars — and
// cutting the domain to fit produced the bare '/?fbclid=…' rows reported in
// the CRM on 7 Sep 2026. Click ids are dropped first; the domain stays.
const lead = {
  firstName: 'Test', lastName: 'Lead', email: 't@example.com', phone: '+447700900123', country: 'GB',
};
const meta = { ip: null, domain: 'alliancestreet.co.uk', position: 'Leads' };
const payload = (attribution, m = meta) => buildPayload({ ...lead, attribution }, m).lead;
const formPage = (attribution, m = meta) => payload(attribution, m).form_page;

test('the reported fbclid landing URL keeps its domain and utm params', () => {
  const landingPage = '/?fbclid=IwcGRvZgVleHRuA2FlbQEwAGFkaWQBqzeabfuCD3NydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAAB'
    + 'Hmq4N27Tyb8neYtpMdH5AkSd2xWGt31eJiThyl0ugHZ4k97tiU7ga_r-_sVI_aem_da5urAXcAC4LzznQAysIKA'
    + '&utm_medium=paid&utm_source=fb';
  // 228 chars once the domain is prepended — the case that used to lose it.
  assert.ok(`https://alliancestreet.co.uk${landingPage}`.length > 191);
  assert.equal(formPage({ source: 'facebook', landingPage }),
    'https://alliancestreet.co.uk/?utm_medium=paid&utm_source=fb');
});

test('a gclid is dropped from form_page but still reaches the CRM in the message', () => {
  const gclid = 'Cj0KCQjw'.repeat(11);
  const landingPage = `/?utm_source=google&utm_medium=cpc&utm_campaign=webinar-uk-uae-structuring&gclid=${gclid}`;
  const { form_page: formPageValue, message } = payload({
    source: 'google-ads', gclid, landingPage, utmCampaign: 'webinar-uk-uae-structuring',
  });
  assert.equal(formPageValue,
    'https://alliancestreet.co.uk/?utm_source=google&utm_medium=cpc&utm_campaign=webinar-uk-uae-structuring');
  assert.ok(message.includes(gclid), 'the gclid belongs in the message body');
  assert.ok(message.includes(landingPage), 'the untrimmed landing page belongs in the message body');
});

test('a URL still too long after the click ids go is cut, but keeps the domain', () => {
  const landingPage = `/?utm_campaign=${'a'.repeat(180)}`;
  const out = formPage({ source: 'instagram', landingPage });
  assert.equal(out.length, 191);
  assert.ok(out.startsWith('https://alliancestreet.co.uk/?utm_campaign=aaa'));
});

test('a URL carrying only a click id ends as a clean path, with no dangling ?', () => {
  assert.equal(formPage({ source: 'facebook', landingPage: '/?fbclid=abc123' }),
    'https://alliancestreet.co.uk/');
});

test('a landing path that fits is sent as an absolute URL on the site domain', () => {
  assert.equal(formPage({ source: 'instagram', landingPage: '/?utm_source=instagram' }),
    'https://alliancestreet.co.uk/?utm_source=instagram');
  assert.equal(formPage({ source: 'direct', landingPage: '' }), 'https://alliancestreet.co.uk/');
});

test('a client-supplied absolute URL is reduced to its path before composing', () => {
  assert.equal(formPage({ source: 'direct', landingPage: 'https://evil.example/phish?x=1' }),
    'https://alliancestreet.co.uk/phish?x=1');
});

test('without a request domain the bare path is sent', () => {
  assert.equal(formPage({ source: 'direct', landingPage: '/?utm_source=youtube' }, { ...meta, domain: null }),
    '/?utm_source=youtube');
});

// lead_source is what the CRM list is filtered by, so one channel must produce
// one label. A Meta campaign tagged utm_source=fb was filing as 'Campaign: fb'
// while an fbclid-only click on the same ad filed as 'Facebook', which is why
// Facebook leads looked absent (reported 7 Sep 2026).
const leadSource = (source) => payload({ source, landingPage: '/' }).lead_source;

test('every spelling of a Meta campaign files under one label', () => {
  for (const source of ['fb', 'facebook', 'fb_ads', 'meta', 'FB']) {
    assert.equal(leadSource(source), 'Facebook', `${source} should file as Facebook`);
  }
  for (const source of ['ig', 'instagram', 'ig-ads']) {
    assert.equal(leadSource(source), 'Instagram', `${source} should file as Instagram`);
  }
});

test('the Google Ads short forms fold onto the paid label, not organic Google', () => {
  for (const source of ['google-ads', 'adwords', 'googleads', 'gads']) {
    assert.equal(leadSource(source), 'Google Ads');
  }
  // Organic Google stays its own label — folding it into Ads would overstate
  // what the campaign paid for.
  assert.equal(leadSource('google'), 'Google (organic)');
});

test('an unrecognised source still comes through, spelled as the campaign wrote it', () => {
  assert.equal(leadSource('newsletter'), 'Campaign: newsletter');
  assert.equal(leadSource('Partner_Site'), 'Campaign: Partner_Site');
  assert.equal(leadSource('direct'), 'Website');
});