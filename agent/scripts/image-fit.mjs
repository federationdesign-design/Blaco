// Liquid layout decision 5, as amended at Checkpoint 5. Renders every page at widths from 390px to 2800px
// and works out, for each image in each role, whether its original file has
// enough pixels for the box it fills. Writes:
//   content/image-fit.json              role|src -> viewport width from which the
//                                        image is shown at natural size instead of
//                                        being enlarged more than 1.25x (read by
//                                        app/lib/image-fit.ts)
//   agent/extract/image-fit-report.json every image that is undersized at 2800px,
//                                        with the size needed (for CHECKPOINT-5.md)
// Run against a build: BASE_URL=http://localhost:3106 node agent/scripts/image-fit.mjs
// Box sizes do not depend on the fit rules, so re-running on a fitted build
// gives the same result.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:3106';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const index = JSON.parse(await readFile(join(repo, 'content', 'index.json'), 'utf8'));
const media = JSON.parse(await readFile(join(repo, 'content', 'media.json'), 'utf8'));

// A fine grid, so an image fills its box for as long as the limit allows. Every
// width except 390 needs a matching rule in app/globals.css (checked below).
const WIDTHS = [390, 768, 1024, 1152, 1280, 1360, 1440, 1520, 1600, 1760, 1920, 2080, 2240, 2400, 2560, 2720, 2800];
const css = await readFile(join(repo, 'app', 'globals.css'), 'utf8');
const missing = WIDTHS.slice(1).filter((w) => !css.includes(`img[data-img][data-fit-from='${w}']`));
if (missing.length) throw new Error(`app/globals.css has no fit rule for: ${missing.join(', ')}`);
const FLOW = new Set(['figure', 'map']); // width follows the column; others crop to a box
// Checkpoint 5 decision 1: images may be enlarged up to 1.25x; beyond that they
// are shown at natural size. Anything over 1.02x at 2800px (sub-pixel rounding
// aside) is still listed as undersized so larger originals can be supplied.
const TOLERANCE = 1.25;
// Home page decision 1: hero slides always fill the full width; they get no
// fallback but are still reported so larger originals can be supplied.
const EXEMPT = new Set(['slider']);
const UNDERSIZED = 1.02;

const browser = await chromium.launch();
const seen = new Map(); // key -> { role, src, firstStretch, pages, at2800 }

for (const { url } of index) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('img[data-img]')].map((img) => {
        const role = img.getAttribute('data-img');
        const raw = img.getAttribute('src') || '';
        const src = raw.startsWith('/_next/image') ? decodeURIComponent(new URL(raw, location.href).searchParams.get('url')) : raw;
        const box = ['figure', 'map'].includes(role) ? img.parentElement.getBoundingClientRect() : img.getBoundingClientRect();
        return { role, src, w: box.width, h: box.height };
      }),
    );
    for (const b of boxes) {
      const nat = media[b.src];
      if (!nat || b.w < 1) continue;
      const h = FLOW.has(b.role) ? (b.w * nat.height) / nat.width : b.h;
      const scale = FLOW.has(b.role) ? b.w / nat.width : Math.max(b.w / nat.width, h / nat.height);
      const key = `${b.role}|${b.src}`;
      const entry = seen.get(key) ?? { role: b.role, src: b.src, natural: nat, firstStretch: null, pages: new Set(), at2800: null };
      entry.pages.add(url);
      if (scale > TOLERANCE && (entry.firstStretch === null || width < entry.firstStretch)) entry.firstStretch = width;
      if (width === 2800 && (!entry.at2800 || scale > entry.at2800.scale)) {
        entry.at2800 = { boxW: Math.round(b.w), boxH: Math.round(h), scale: Math.round(scale * 100) / 100 };
      }
      seen.set(key, entry);
    }
    await context.close();
  }
  process.stdout.write('.');
}
await browser.close();

// Record the last measured width that is within the limit; globals.css shows
// the image at natural size from 1px above it, so it fills its box at every
// measured width within the limit and never passes 1.25x between measurements.
const fit = {};
const report = [];
for (const [key, e] of seen) {
  const s = e.at2800?.scale ?? 1;
  if (e.firstStretch !== null && !EXEMPT.has(e.role)) {
    const i = WIDTHS.indexOf(e.firstStretch);
    fit[key] = i === 0 ? 0 : WIDTHS[i - 1];
  }
  if (e.firstStretch === null && s <= UNDERSIZED) continue;
  report.push({
    role: e.role,
    src: e.src,
    natural: `${e.natural.width} x ${e.natural.height}`,
    fitFrom: fit[key] ?? null,
    exempt: EXEMPT.has(e.role),
    boxAt2800: e.at2800 ? `${e.at2800.boxW} x ${e.at2800.boxH}` : null,
    enlargementAt2800: s,
    neededOriginal: `${Math.ceil(e.natural.width * s)} x ${Math.ceil(e.natural.height * s)}`,
    pages: [...e.pages].sort(),
  });
}
report.sort((a, b) => b.enlargementAt2800 - a.enlargementAt2800);
await writeFile(join(repo, 'content', 'image-fit.json'), JSON.stringify(Object.fromEntries(Object.entries(fit).sort()), null, 2) + '\n');
await writeFile(join(repo, 'agent', 'extract', 'image-fit-report.json'), JSON.stringify(report, null, 2));
console.log(`\nimage uses measured: ${seen.size}, undersized at 2800px: ${report.length}, shown at natural size somewhere: ${Object.keys(fit).length}`);
