// Text column check (agent/DECISIONS.md, "Text column: 90% of the page
// width"): on every text-heavy page the text column must be 90% of the page
// width, centred, with 5% either side. Measures the rendered column, not the
// CSS: the widest text block (heading, paragraph or list) in the content
// sections, or the header and answer on a detail page, against the viewport.
// Exits non-zero if a column is off by more than 0.1% or 1px off centre.
// Usage: BASE_URL=http://localhost:3108 node agent/scripts/column-check.mjs
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3108';
const PAGES = ['/privacy-policy-2', '/disclaimer', '/cookies', '/accessibility-statement', '/modern-slavery', '/what-is-your-cancellation-policy', '/perfect-highly-recommended'];
const WIDTHS = [390, 768, 1280, 1920, 2800];

const browser = await chromium.launch();
const failures = [];
console.log('width  page                                column px  % of page  left/right gap %');
for (const width of WIDTHS) {
  for (const url of PAGES) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.goto(`${BASE}${url}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const blocks = document.querySelectorAll(
        'main [data-kind="content"] :is(h1, h2, h3, p, ul, ol, hr), main article[data-template="post"] > *:not(script)',
      );
      let left = Infinity;
      let right = -Infinity;
      for (const el of blocks) {
        const rect = el.getBoundingClientRect();
        if (!rect.width) continue;
        left = Math.min(left, rect.left);
        right = Math.max(right, rect.right);
      }
      // clientWidth is the page width without any scrollbar.
      return { left, right, page: document.documentElement.clientWidth };
    });
    const column = r.right - r.left;
    const pct = (column / r.page) * 100;
    const leftPct = (r.left / r.page) * 100;
    const rightPct = ((r.page - r.right) / r.page) * 100;
    console.log(
      String(width).padEnd(6),
      url.slice(0, 35).padEnd(36),
      column.toFixed(1).padStart(9),
      `${pct.toFixed(2)}%`.padStart(10),
      `${leftPct.toFixed(2)}% / ${rightPct.toFixed(2)}%`.padStart(18),
    );
    if (Math.abs(pct - 90) > 0.1) failures.push(`${url} at ${width}px: column is ${pct.toFixed(2)}% of the page`);
    if (Math.abs(r.left - (r.page - r.right)) > 1) failures.push(`${url} at ${width}px: not centred (${r.left.toFixed(1)}px / ${(r.page - r.right).toFixed(1)}px)`);
    await page.close();
  }
}
await browser.close();
console.log(failures.length ? `FAILURES\n${failures.join('\n')}` : 'Every text column is 90% of the page and centred.');
process.exitCode = failures.length ? 1 : 0;
