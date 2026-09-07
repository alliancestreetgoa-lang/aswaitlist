import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/*
 * attribution.js reads window/document/localStorage at call time, so a small
 * stub of each is enough to exercise it under node:test — no DOM needed.
 */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  clear: () => store.clear(),
};
globalThis.window = { location: { search: '', pathname: '/', hostname: 'alliancestreet.co.uk' } };
globalThis.document = { referrer: '' };

const { captureAttribution, getAttribution } = await import('../src/attribution.js');

/** Simulates one page load on a given landing URL (+ optional referrer). */
function visit(search, referrer = '') {
  window.location.search = search;
  document.referrer = referrer;
  captureAttribution();
}

beforeEach(() => {
  store.clear();
  window.location.search = '';
  document.referrer = '';
});

test('a tagged link records its own source', () => {
  visit('?utm_source=facebook&utm_medium=social&utm_campaign=webinar');
  assert.equal(getAttribution().source, 'facebook');
});

// The reported bug: a test visit on the Instagram link left a stored record,
// and the later Facebook link was then filed under 'instagram' with the old
// campaign ('test') and landing page still attached.
test('a later tagged link overrides an earlier tagged visit', () => {
  visit('?utm_source=instagram&utm_medium=social&utm_campaign=test');
  visit('?utm_source=facebook&utm_medium=social&utm_campaign=webinar');
  const a = getAttribution();
  assert.equal(a.source, 'facebook');
  assert.equal(a.utmCampaign, 'webinar');
  assert.equal(a.landingPage, '/?utm_source=facebook&utm_medium=social&utm_campaign=webinar');
});

test('every generated source link records itself, whichever ran before', () => {
  const links = {
    instagram: '?utm_source=instagram&utm_medium=social&utm_campaign=webinar',
    facebook: '?utm_source=facebook&utm_medium=social&utm_campaign=webinar',
    youtube: '?utm_source=youtube&utm_medium=social&utm_campaign=webinar',
    linkedin: '?utm_source=linkedin&utm_medium=social&utm_campaign=webinar',
    'google-ads': '?utm_source=google&utm_medium=cpc&utm_campaign=webinar',
  };
  for (const [expected, search] of Object.entries(links)) {
    store.clear();
    visit('?utm_source=instagram&utm_medium=social&utm_campaign=test'); // stale first touch
    visit(search);
    assert.equal(getAttribution().source, expected, `${search} should classify as ${expected}`);
  }
});

test('a gclid click wins over a stored organic source', () => {
  visit('?utm_source=instagram&utm_medium=social');
  visit('?gclid=Cj0KCQjwABCDEF');
  assert.equal(getAttribution().source, 'google-ads');
});

// The reason the record is persisted at all: someone lands from a campaign,
// leaves, and comes back by typing the URL. That untagged return must not
// erase the campaign that actually brought them.
test('an untagged return visit never overwrites a known source', () => {
  visit('?utm_source=instagram&utm_medium=social&utm_campaign=webinar');
  visit('');
  const a = getAttribution();
  assert.equal(a.source, 'instagram');
  assert.equal(a.utmCampaign, 'webinar');
});

test('a stored direct is still upgraded by a later real source', () => {
  visit('');
  assert.equal(getAttribution().source, 'direct');
  visit('?utm_source=facebook&utm_medium=social');
  assert.equal(getAttribution().source, 'facebook');
});

// A bare referrer is weaker evidence than a link we tagged ourselves: it says
// which site linked here, not which campaign. It must not displace one.
test('a bare referrer does not displace a tagged campaign, but does beat direct', () => {
  visit('?utm_source=facebook&utm_medium=social&utm_campaign=webinar');
  visit('', 'https://www.instagram.com/');
  assert.equal(getAttribution().source, 'facebook');

  store.clear();
  visit('');
  visit('', 'https://www.instagram.com/');
  assert.equal(getAttribution().source, 'instagram');
});

// Browsers that visited before this change hold a record with no `strength`.
// It must be scored from what it did store, not treated as worth nothing.
test('a legacy stored record is scored, not silently overwritten', () => {
  store.set('as_attribution_v1', JSON.stringify({
    source: 'instagram', utmSource: 'instagram', utmMedium: 'social',
    utmCampaign: 'webinar', utmContent: '', gclid: '', referrer: '',
    landingPage: '/?utm_source=instagram&utm_medium=social&utm_campaign=webinar',
    firstSeenAt: '2026-08-01T00:00:00.000Z',
  }));
  visit(''); // untagged return: weaker, must not erase the campaign
  assert.equal(getAttribution().source, 'instagram');
  assert.equal(getAttribution().utmCampaign, 'webinar');

  visit('?utm_source=facebook&utm_medium=social&utm_campaign=webinar'); // tagged: wins
  assert.equal(getAttribution().source, 'facebook');
});
