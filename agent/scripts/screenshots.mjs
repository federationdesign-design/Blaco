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
const MEDIA = JSON.parse(await readFile(join(repo, 'content', 'media.json'), 'utf8'));

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
  ['modern-slavery', '/modern-slavery'],
];

// Page screenshots and layout checks run with a stored consent choice, so the
// cookie banner does not cover content. The banner has its own shots below.
const CONSENT = JSON.stringify({ version: 1, categories: { necessary: true, analytics: false, marketing: false }, timestamp: '2026-09-21T00:00:00.000Z' });

const browser = await chromium.launch();
const problems = [];

const open = async (width, url, height = 900, { consent = true } = {}) => {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width > 1000 ? 1 : 2 });
  if (consent) await context.addInitScript((value) => window.localStorage.setItem('blaco-cookie-consent', value), CONSENT);
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
  for (const width of [360, 390, 1280, 1920, 2800]) {
    const { page, context, status } = await open(width, url);
    if (status !== 200) problems.push(`${url} returned ${status}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${url}: horizontal overflow of ${overflow}px at ${width}px`);
    // No image may render more than 1.25x its original (Checkpoint 5 decision 1).
    if (width >= 1280) {
      const stretched = await page.evaluate((media) =>
        [...document.querySelectorAll('img[data-img]')]
          .map((img) => {
            const raw = img.getAttribute('src') || '';
            const src = raw.startsWith('/_next/image') ? decodeURIComponent(new URL(raw, location.href).searchParams.get('url')) : raw;
            const nat = media[src];
            const r = img.getBoundingClientRect();
            if (!nat || r.width < 1) return null;
            const fit = getComputedStyle(img).objectFit;
            const scale = fit === 'none' ? 1 : fit === 'cover' ? Math.max(r.width / nat.width, r.height / nat.height) : r.width / nat.width;
            // Checkpoint 5 decision 1: up to 1.25x is allowed (plus rounding).
            return scale > 1.255 ? `${img.dataset.img} ${src} x${scale.toFixed(2)}` : null;
          })
          .filter(Boolean),
      MEDIA);
      stretched.forEach((s) => problems.push(`${url}: image enlarged at ${width}px: ${s}`));
    }
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
  for (const width of [390, 1280, 2800]) {
    const { page, context } = await open(width, url, width === 390 ? 844 : width === 2800 ? 1600 : 900);
    await settle(page);
    await page.screenshot({ path: join(out, `${name}-${width}.jpg`), fullPage: true, type: 'jpeg', quality: width === 2800 ? 70 : 80 });
    await context.close();
  }
}

const shot = (page, name) => page.screenshot({ path: join(out, `${name}.jpg`), type: 'jpeg', quality: 80 });

// Touch targets inside the cookie banner.
const bannerTargets = async (page, width, label) => {
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-label="Cookie preferences"] a, [aria-label="Cookie preferences"] button, [aria-label="Cookie preferences"] label')]
      .filter((el) => !el.closest('p'))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ el, r }) => `${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`),
  );
  small.forEach((s) => problems.push(`cookie banner (${label}): touch target under 44px at ${width}px: ${s}`));
};

// Interaction states.
{
  const { page, context } = await open(390, '/', 844);
  await page.getByRole('button', { name: 'Menu' }).click();
  await shot(page, 'shell-390-menu-open');
  await context.close();
}

// Cookie banner: first visit, then preferences, at both widths.
for (const width of [390, 1280]) {
  const { page, context } = await open(width, '/', width === 390 ? 844 : 900, { consent: false });
  await page.getByRole('button', { name: 'Accept all' }).waitFor();
  await bannerTargets(page, width, 'first visit');
  await shot(page, `cookie-banner-${width}`);
  await page.getByRole('button', { name: 'Manage preferences' }).click();
  await bannerTargets(page, width, 'preferences');
  await shot(page, `cookie-preferences-${width}`);
  await context.close();
}

// Enquiry form states at 390px: validation errors, then a sent message
// (the send is stubbed here; the route itself is exercised in phase4-checks.mjs).
{
  const { page, context } = await open(390, '/booking-request-form', 844);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await shot(page, 'form-390-errors');
  await page.route('**/api/enquiry', (route) => route.fulfill({ json: { ok: true } }));
  await page.getByLabel('Name').fill('Test Guest');
  await page.getByLabel('Telephone').fill('07700 900123');
  await page.getByLabel('Email Address').fill('guest@example.com');
  await page.getByLabel('Message').fill('Do you have availability in October?');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('status').waitFor();
  await shot(page, 'form-390-sent');
  await page.unroute('**/api/enquiry');
  await page.route('**/api/enquiry', (route) => route.fulfill({ status: 502, json: { ok: false, message: 'send-failed' } }));
  await page.reload();
  await page.getByLabel('Name').fill('Test Guest');
  await page.getByLabel('Telephone').fill('07700 900123');
  await page.getByLabel('Email Address').fill('guest@example.com');
  await page.getByLabel('Message').fill('Do you have availability in October?');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('alert').waitFor();
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await shot(page, 'form-390-error');
  await context.close();
}

await browser.close();
const unique = [...new Set(problems)];
console.log(unique.length ? unique.join('\n') : 'No layout problems found.');
process.exitCode = unique.length ? 1 : 0;
