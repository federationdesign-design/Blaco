// Liquid layout, decision 5. Renders every page at widths from 390px to 2800px
// and works out, for each image in each role, whether its original file has
// enough pixels for the box it fills. Writes:
//   content/image-fit.json              role|src -> viewport width from which the
//                                        image is shown at natural size instead of
//                                        being enlarged (read by app/lib/image-fit.ts)
//   agent/extract/image-fit-report.json the images that are too small at 2800px,
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

const WIDTHS = [390, 768, 1024, 1280, 1440, 1600, 1920, 2240, 2560, 2800];
const FLOW = new Set(['figure', 'map']); // width follows the column; others crop to a box
const TOLERANCE = 1.02; // ignore sub-pixel rounding

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

// Show at natural size from the last measured width that still fitted, so the
// image is never enlarged between measurements.
const fit = {};
const report = [];
for (const [key, e] of seen) {
  if (e.firstStretch === null) continue;
  const i = WIDTHS.indexOf(e.firstStretch);
  fit[key] = i === 0 ? 0 : WIDTHS[i - 1];
  const s = e.at2800?.scale ?? 1;
  report.push({
    role: e.role,
    src: e.src,
    natural: `${e.natural.width} x ${e.natural.height}`,
    fitFrom: fit[key],
    boxAt2800: e.at2800 ? `${e.at2800.boxW} x ${e.at2800.boxH}` : null,
    enlargementAt2800: s,
    neededOriginal: `${Math.ceil(e.natural.width * s)} x ${Math.ceil(e.natural.height * s)}`,
    pages: [...e.pages].sort(),
  });
}
report.sort((a, b) => b.enlargementAt2800 - a.enlargementAt2800);
await writeFile(join(repo, 'content', 'image-fit.json'), JSON.stringify(Object.fromEntries(Object.entries(fit).sort()), null, 2) + '\n');
await writeFile(join(repo, 'agent', 'extract', 'image-fit-report.json'), JSON.stringify(report, null, 2));
console.log(`\nimage uses measured: ${seen.size}, too small somewhere up to 2800px: ${report.length}`);
