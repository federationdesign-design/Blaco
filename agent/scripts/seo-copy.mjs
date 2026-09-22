// Writes agent/seo-copy.csv: one row per page, with the URL, the current
// title, the H1 and the opening of the page's body text. It is a worksheet for
// writing titles and meta descriptions, so the body text is the readable copy
// (paragraphs and list items inside <main>), not headings, buttons or labels.
//
// Run `npm run build` first, then:
//   node agent/scripts/seo-copy.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = process.cwd();
const OUT = join(ROOT, '.next/server/app');
const EXCERPT = 300;

if (!existsSync(OUT)) {
  console.error('No build found at .next/server/app. Run npm run build first.');
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(ROOT, 'content/index.json'), 'utf8'));

// Escape for RFC 4180: quote every field, double any quote inside it.
const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const rows = index.map((entry) => {
  const file = join(OUT, entry.url === '/' ? 'index.html' : `${entry.url.slice(1)}.html`);
  if (!existsSync(file)) return [entry.url, '', '', ''];
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const text = (el) => $(el).text().replace(/\s+/g, ' ').trim();

  const body = $('main p, main li, main blockquote')
    .map((_, el) => text(el))
    .get()
    .filter(Boolean)
    .join(' ')
    .slice(0, EXCERPT);

  return [
    entry.url,
    $('title').first().text(),
    $('main h1').map((_, el) => text(el)).get().join(' + '),
    body,
  ];
});

const csv = [['url', 'title', 'h1', `body_first_${EXCERPT}_chars`], ...rows]
  .map((row) => row.map(cell).join(','))
  .join('\r\n');

writeFileSync(join(ROOT, 'agent/seo-copy.csv'), `${csv}\r\n`);
console.log(`agent/seo-copy.csv: ${rows.length} pages`);
