// Checkpoint 5 decision 2: checks the reading measure on text-heavy pages by
// counting the characters on every full line of body text (a paragraph's last
// line is left out, as it is usually short) at several widths. Only text
// blocks that fill the measure count; narrow columns are left out.
// Usage: BASE_URL=http://localhost:3108 node agent/scripts/measure-check.mjs
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3108';
const PAGES = ['/privacy-policy-2', '/disclaimer', '/cookies', '/accessibility-statement', '/modern-slavery', '/what-is-your-cancellation-policy', '/perfect-highly-recommended'];
const WIDTHS = [390, 768, 1280, 1920, 2800];

const browser = await chromium.launch();
const rows = [];
for (const width of WIDTHS) {
  const all = [];
  for (const url of PAGES) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const lines = await page.evaluate(() => {
      const out = [];
      for (const p of document.querySelectorAll('main p, main li')) {
        if (p.closest('form, figure') || p.hasAttribute('data-kicker')) continue;
        // Only text blocks that actually reach the measure (not narrow columns).
        const block = p.closest('[class*="prose"]') ?? p.parentElement;
        const limit = parseFloat(getComputedStyle(block).maxWidth);
        if (!limit || block.getBoundingClientRect().width < limit - 1) continue;
        // A <br> ends a line early, like the end of a paragraph, so the line
        // before it is not a full line either. Each run between breaks is
        // counted on its own.
        const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        const runs = [new Map()];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'BR') runs.push(new Map());
            continue;
          }
          const byTop = runs.at(-1);
          const text = node.textContent;
          for (let i = 0; i < text.length; i++) {
            const range = document.createRange();
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getClientRects()[0];
            if (!rect) continue;
            const top = Math.round(rect.top);
            byTop.set(top, (byTop.get(top) ?? 0) + 1);
          }
        }
        for (const byTop of runs) {
          const counts = [...byTop.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n);
          out.push(...counts.slice(0, -1)); // full lines only
        }
      }
      return out;
    });
    all.push(...lines);
    await page.close();
  }
  all.sort((a, b) => a - b);
  const avg = all.reduce((s, n) => s + n, 0) / all.length;
  rows.push({ width, lines: all.length, average: Math.round(avg), longest: all.at(-1) });
}
await browser.close();
console.log('width  full lines  average chars  longest');
for (const r of rows) console.log(String(r.width).padEnd(7), String(r.lines).padEnd(11), String(r.average).padEnd(14), r.longest);
