// Screenshots of every template at 390px and 1280px, plus layout checks on
// every page: no horizontal overflow from 360px to 2800px, and touch targets
// of at least 44px in the header, footer and main content.
// Usage: npm run build && next start -p 3102, then BASE_URL=http://localhost:3102 npm run screenshots
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:3102';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(repo, 'agent', 'screenshots');
await mkdir(out, { recursive: true });

const index = JSON.parse(await readFile(join(repo, 'content', 'index.json'), 'utf8'));

// One representative page per template, plus pages Steve asked to see.
const SHOTS = [
  ['home', '/'],
  ['cottage', '/our-cottages/swift'],
  ['cottage-swallow', '/our-cottages/swallow'],
  ['listing', '/for-six-people'],
  ['faq-index', '/about/faq'],
  ['testimonial-index', '/about/testimonials'],
  ['post-faq', '/what-is-your-cancellation-policy'],
  ['post-testimonial', '/weekend-away-rebecca-p'],
  ['contact', '/contact-us'],
  ['enquiry-form', '/booking-request-form'],
  ['general', '/about'],
  ['general-gallery', '/about/games-room'],
  ['policy', '/privacy-policy-2'],
  ['accessibility', '/accessibility-statement'],
];

const browser = await chromium.launch();
const problems = [];

const open = async (width, url, height = 900) => {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width > 1000 ? 1 : 2 });
  const page = await context.newPage();
  const res = await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return { page, context, status: res?.status() };
};

// Load lazy images before a full-page capture.
const settle = async (page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
};

// Layout checks on every page.
for (const { url } of index) {
  for (const width of [360, 390, 1280, 2800]) {
    const { page, context, status } = await open(width, url);
    if (status !== 200) problems.push(`${url} returned ${status}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${url}: horizontal overflow of ${overflow}px at ${width}px`);
    if (width === 390 || width === 1280) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('a, button, summary, input, textarea')]
          .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
          .filter((el) => !el.closest('[class*="skipLink"], .prose, [class*="prose"], [aria-hidden="true"]'))
          .filter((el) => el.tagName !== 'INPUT' || el.type !== 'hidden')
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width < 44 || r.height < 44)
          .map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`),
      );
      small.forEach((s) => problems.push(`${url}: touch target under 44px at ${width}px: ${s}`));
    }
    await context.close();
  }
}

for (const [name, url] of SHOTS) {
  for (const width of [390, 1280]) {
    const { page, context } = await open(width, url, width === 390 ? 844 : 900);
    await settle(page);
    await page.screenshot({ path: join(out, `${name}-${width}.jpg`), fullPage: true, type: 'jpeg', quality: 80 });
    await context.close();
  }
}

// Interaction states.
{
  const { page, context } = await open(390, '/', 844);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.screenshot({ path: join(out, 'shell-390-menu-open.jpg'), type: 'jpeg', quality: 80 });
  await context.close();
}

await browser.close();
const unique = [...new Set(problems)];
console.log(unique.length ? unique.join('\n') : 'No layout problems found.');
process.exitCode = unique.length ? 1 : 0;
