// Home page decisions: checks the hero and the parallax strip.
//  - every hero slide covers the full width (no side bars or letterboxing)
//  - the heading, green line and dots sit in the same place over the photo
//  - the landscape strip is 1.5 times its previous height
//  - the parallax moves with scroll, in Chromium and WebKit (iPhone Safari's
//    engine), and does not move with reduced motion
// Usage: BASE_URL=http://localhost:4880 node agent/scripts/home-checks.mjs
import { chromium, webkit, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4880';
const CONSENT = JSON.stringify({ version: 1, categories: { necessary: true, analytics: false, marketing: false }, timestamp: '2026-09-21T00:00:00.000Z' });
const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

// Previous strip height: clamp(12rem, 50vw, 28rem), with the root size.
const oldStrip = (width, rem) => Math.min(Math.max(12 * rem, width * 0.5), 28 * rem);

const run = async (engine, label, options) => {
  const browser = await engine.launch();
  for (const width of [360, 390, 1280, 2800]) {
    const context = await browser.newContext({ viewport: { width, height: width > 1000 ? 900 : 780 }, ...options });
    await context.addInitScript((v) => window.localStorage.setItem('blaco-cookie-consent', v), CONSENT);
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // Hero: each slide's photo covers its slide, and each slide spans the width.
    const hero = await page.evaluate(async () => {
      const track = document.querySelector('main section ul');
      const out = [];
      for (let i = 0; i < track.children.length; i++) {
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = i * track.clientWidth;
        await new Promise((r) => setTimeout(r, 200));
        const li = track.children[i].getBoundingClientRect();
        const img = track.children[i].querySelector('img');
        const fit = getComputedStyle(img).objectFit;
        const r = img.getBoundingClientRect();
        out.push({ covers: fit === 'cover' && Math.abs(r.width - li.width) < 1 && Math.abs(r.height - li.height) < 1, slideWidth: Math.round(li.width), fit });
      }
      const section = document.querySelector('main section').getBoundingClientRect();
      const pos = (sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { left: Math.round(r.left - section.left), bottomGap: Math.round(section.bottom - r.bottom) };
      };
      return { slides: out, width: innerWidth, title: pos('main section h1'), line: pos('main section p'), dots: pos('main section button') };
    });
    const allCover = hero.slides.every((s) => s.covers && s.slideWidth === hero.width);
    check(`${label} ${width}px: all ${hero.slides.length} hero slides fill the full width`, allCover, hero.slides.map((s) => `${s.slideWidth}px ${s.fit}`).join(', '));
    check(
      `${label} ${width}px: heading, green line and dots over the photo`,
      hero.title.left >= 0 && hero.line.bottomGap > 0 && hero.dots.bottomGap >= 0 && hero.title.bottomGap > hero.line.bottomGap && hero.line.bottomGap > hero.dots.bottomGap,
      `heading ${hero.title.bottomGap}px, line ${hero.line.bottomGap}px, dots ${hero.dots.bottomGap}px above the hero's foot`,
    );

    // Strip height and parallax movement.
    const strip = await page.evaluate(async () => {
      const el = document.querySelector('main [class*="parallax"]');
      const layer = el.firstElementChild;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const top = el.getBoundingClientRect().top + scrollY;
      const at = async (y) => {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
        return new DOMMatrix(getComputedStyle(layer).transform).m42;
      };
      const a = await at(top - innerHeight * 0.8);
      const b = await at(top - innerHeight * 0.2);
      return { height: el.getBoundingClientRect().height, rem, a, b };
    });
    const expected = oldStrip(width, strip.rem) * 1.5;
    check(`${label} ${width}px: strip is 1.5x its previous height`, Math.abs(strip.height - expected) < 1, `${Math.round(strip.height)}px (was ${Math.round(expected / 1.5)}px)`);
    check(`${label} ${width}px: parallax moves with scroll`, Math.abs(strip.b - strip.a) > 5, `layer shift ${strip.a.toFixed(0)}px to ${strip.b.toFixed(0)}px`);
    await context.close();
  }

  // Reduced motion: no transform at all.
  const context = await browser.newContext({ viewport: { width: 390, height: 780 }, reducedMotion: 'reduce', ...options });
  await context.addInitScript((v) => window.localStorage.setItem('blaco-cookie-consent', v), CONSENT);
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  const still = await page.evaluate(async () => {
    const el = document.querySelector('main [class*="parallax"]');
    const layer = el.firstElementChild;
    const top = el.getBoundingClientRect().top + scrollY;
    const values = [];
    for (const f of [0.8, 0.2]) {
      scrollTo(0, top - innerHeight * f);
      await new Promise((r) => setTimeout(r, 250));
      values.push(getComputedStyle(layer).transform);
    }
    return { values, fills: Math.abs(layer.getBoundingClientRect().height - el.getBoundingClientRect().height) < 1 };
  });
  check(`${label}: reduced motion turns the parallax off`, still.values.every((v) => v === 'none') && still.fills, still.values.join(' / '));
  await context.close();
  await browser.close();
};

await run(chromium, 'Chromium', {});
const { viewport: _v, ...iphone } = devices['iPhone 13'];
await run(webkit, 'WebKit (iPhone)', { ...iphone, deviceScaleFactor: 1 });

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
process.exitCode = results.every((r) => r.pass) ? 0 : 1;
