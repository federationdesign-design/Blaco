// Home page decision 3: every page hero fills the full width at every size,
// cropped to cover, with no side bars or letterboxing. Visits every page that
// has a hero at 360, 390, 1280 and 2800px.
// Usage: BASE_URL=http://localhost:4900 node agent/scripts/hero-checks.mjs
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:4900';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const index = JSON.parse(await readFile(join(repo, 'content', 'index.json'), 'utf8'));

const browser = await chromium.launch();
const failures = [];
const pagesWithHero = new Set();
let checked = 0;

for (const { url } of index) {
  for (const width of [360, 390, 1280, 2800]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
    const heroes = await page.evaluate(() =>
      [...document.querySelectorAll('img[data-img="hero"]')].map((img) => {
        const box = img.parentElement.getBoundingClientRect();
        const r = img.getBoundingClientRect();
        return {
          fit: getComputedStyle(img).objectFit,
          fitFrom: img.dataset.fitFrom ?? null,
          boxWidth: Math.round(box.width),
          covers: Math.abs(r.width - box.width) < 1 && Math.abs(r.height - box.height) < 1,
          viewport: innerWidth,
        };
      }),
    );
    for (const h of heroes) {
      pagesWithHero.add(url);
      checked++;
      if (h.fit !== 'cover' || !h.covers || h.boxWidth !== h.viewport || h.fitFrom !== null) {
        failures.push(`${url} at ${width}px: fit ${h.fit}, box ${h.boxWidth}px of ${h.viewport}px, covers ${h.covers}, fit-from ${h.fitFrom}`);
      }
    }
    await page.close();
  }
}
await browser.close();

console.log(`Pages with a hero: ${pagesWithHero.size}. Hero checks (page x width): ${checked}.`);
console.log(failures.length ? `FAILURES\n${failures.join('\n')}` : 'Every page hero fills the full width, cropped to cover, at 360, 390, 1280 and 2800px.');
process.exitCode = failures.length ? 1 : 0;
