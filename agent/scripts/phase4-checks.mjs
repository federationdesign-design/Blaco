// Phase 4 checks against a running build:
//  - GA4 does not load until analytics cookies are accepted, and not after Reject all
//  - /api/enquiry validates on the server, drops honeypot posts, fails cleanly
//    without Resend keys, and redirects plain (no JavaScript) form posts back
//  - sitemap.xml, robots.txt and /modern-slavery
// Usage: BASE_URL=http://localhost:3105 node agent/scripts/phase4-checks.mjs
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:3105';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

// ---------- consent and GA4 ----------
const browser = await chromium.launch();
const gaRequests = async (action) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const seen = [];
  page.on('request', (r) => {
    if (/googletagmanager\.com|google-analytics\.com/.test(r.url())) seen.push(r.url());
  });
  // Nothing may reach Google in the test either way.
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Accept all' }).waitFor();
  const before = seen.length;
  const scriptsBefore = await page.locator('script[src*="googletagmanager"]').count();
  if (action) await page.getByRole('button', { name: action }).click();
  await page.waitForTimeout(1500);
  const cookies = (await context.cookies()).map((c) => c.name);
  const stored = await page.evaluate(() => window.localStorage.getItem('blaco-cookie-consent'));
  const bannerGone = (await page.getByRole('button', { name: 'Accept all' }).count()) === 0;
  const result = { before, scriptsBefore, after: seen.length, cookies, stored, bannerGone };
  await context.close();
  return result;
};

const untouched = await gaRequests(null);
check('GA4: no request before a choice', untouched.before === 0 && untouched.after === 0 && untouched.scriptsBefore === 0);
const accepted = await gaRequests('Accept all');
check('GA4: loads after Accept all', accepted.before === 0 && accepted.after > 0, `${accepted.after} request(s) to googletagmanager after accepting`);
check('Consent: Accept all is stored and closes the banner', accepted.bannerGone && JSON.parse(accepted.stored).categories.analytics === true);
const rejected = await gaRequests('Reject all');
check('GA4: never loads after Reject all', rejected.after === 0 && !rejected.cookies.some((c) => c.startsWith('_ga')));
check('Consent: Reject all is stored and closes the banner', rejected.bannerGone && JSON.parse(rejected.stored).categories.analytics === false);

// Footer control reopens the preferences.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/`);
  await page.getByRole('button', { name: 'Reject all' }).click();
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  check('Consent: footer "Cookie settings" reopens preferences', await page.getByRole('button', { name: 'Save preferences' }).isVisible());
  await context.close();
}
await browser.close();

// ---------- enquiry route ----------
const post = (body, headers = { 'content-type': 'application/json' }) =>
  fetch(`${BASE}/api/enquiry`, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body), redirect: 'manual' });

{
  const res = await post({ form: 'full', page: '/contact-us', name: '', email: 'not-an-email', message: '' });
  const body = await res.json();
  check('Enquiry: server rejects missing and invalid fields', res.status === 400 && body.errors?.name && body.errors?.email && body.errors?.telephone && body.errors?.message, JSON.stringify(body.errors));
}
{
  const res = await post({ form: 'quick', page: '/', name: 'Bot', email: 'bot@example.com', message: 'spam', company: 'Acme' });
  const body = await res.json();
  check('Enquiry: honeypot posts are accepted silently and not sent', res.status === 200 && body.ok === true);
}
{
  const res = await post({ form: 'quick', page: '/', name: 'Test Guest', email: 'guest@example.com', message: 'Hello' });
  const body = await res.json();
  check('Enquiry: valid post without real Resend keys fails cleanly (no crash)', res.status === 500 && body.ok === false, `status ${res.status}`);
}
{
  const form = new URLSearchParams({ form: 'quick', page: '/our-cottages/swift', name: 'Test Guest', email: 'guest@example.com', message: 'Hello' });
  const res = await post(form.toString(), { 'content-type': 'application/x-www-form-urlencoded' });
  const location = res.headers.get('location') ?? '';
  check('Enquiry: plain form post redirects back to the page', res.status === 303 && location.includes('/our-cottages/swift?enquiry=') && location.endsWith('#enquiry'), location);
}
{
  const form = new URLSearchParams({ form: 'quick', page: 'https://evil.example/', name: 'x', email: 'x@example.com', message: 'x' });
  const res = await post(form.toString(), { 'content-type': 'application/x-www-form-urlencoded' });
  const location = new URL(res.headers.get('location') ?? '/', BASE);
  check('Enquiry: redirect never leaves the site', location.origin === new URL(BASE).origin);
}

// ---------- sitemap, robots, modern slavery ----------
{
  const index = JSON.parse(await readFile(join(repo, 'content', 'index.json'), 'utf8'));
  const res = await fetch(`${BASE}/sitemap.xml`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  check('sitemap.xml lists every page', res.status === 200 && locs.length === index.length, `${locs.length} URLs`);
  check('sitemap.xml has no redirected or old-domain URLs', !locs.some((l) => /^\/(category|sample-page|booking-test)/.test(l)) && !xml.includes('wp-content'));
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check('robots.txt allows crawling and points to the sitemap', /Allow: \//.test(robots) && robots.includes('Sitemap: https://blacohillcottages.co.uk/sitemap.xml'));
  const ms = await fetch(`${BASE}/modern-slavery`);
  const html = await ms.text();
  check('/modern-slavery returns the placeholder page', ms.status === 200 && html.includes('[MODERN_SLAVERY_TEXT]'));
  const home = await (await fetch(`${BASE}/`)).text();
  check('Footer links to /modern-slavery', home.includes('href="/modern-slavery"'));
}

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
process.exitCode = results.every((r) => r.pass) ? 0 : 1;
