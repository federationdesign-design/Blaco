// URL parity (brief 8.6): every URL in the live sitemap must return a page in
// the new build, or redirect permanently where DECISIONS.md says so.
// Usage: BASE_URL=http://localhost:3103 node agent/scripts/url-parity.mjs
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:3103';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const urls = JSON.parse(await readFile(join(repo, 'agent', 'extract', 'urls.json'), 'utf8'));

const REDIRECTS = {
  '/category/faq': '/about/faq',
  '/category/faq/page/2': '/about/faq',
  '/category/testimonial': '/about/testimonials',
  '/category/uncategorized': '/about/faq',
  '/sample-page': '/',
  '/booking-test': '/',
  '/our-cottages/chaffinch': '/our-cottages/chaffinch-2',
};

const checks = [...urls.map((u) => u.url), ...Object.keys(REDIRECTS)].filter((u, i, a) => a.indexOf(u) === i);
const failures = [];
let pages = 0;
let redirects = 0;

for (const url of checks) {
  const res = await fetch(`${BASE}${url}`, { redirect: 'manual' });
  const expected = REDIRECTS[url];
  if (expected) {
    const location = res.headers.get('location');
    if (res.status !== 308 || new URL(location, BASE).pathname !== expected) failures.push(`${url}: expected 308 to ${expected}, got ${res.status} ${location}`);
    else redirects++;
  } else if (res.status !== 200) {
    failures.push(`${url}: ${res.status}`);
  } else {
    pages++;
  }
}

console.log(`URLs checked: ${checks.length}. Pages returning 200: ${pages}. Permanent redirects as decided: ${redirects}.`);
console.log(failures.length ? `FAILURES\n${failures.join('\n')}` : 'All URLs pass.');
process.exitCode = failures.length ? 1 : 0;
