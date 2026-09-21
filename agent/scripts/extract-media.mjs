// Finds every upload the live pages actually use (img src/srcset/data attrs, links,
// inline styles, <style> blocks and each page's linked Divi cache CSS), then writes
// agent/extract/media-manifest.json. Run after fetch-raw.mjs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'extract');
const cssCache = join(root, 'css', 'pages');
await mkdir(cssCache, { recursive: true });

const urls = JSON.parse(await readFile(join(root, 'urls.json'), 'utf8'));
const library = JSON.parse(await readFile(join(root, 'api', 'media.json'), 'utf8'));
const libraryPaths = new Set(library.map((m) => new URL(m.source_url).pathname.replace('/wp-content/uploads/', '')));

// Pages dropped or redirected at Checkpoint 1 do not contribute media.
const DROPPED = new Set(['/sample-page', '/booking-test', '/category/faq', '/category/faq/page/2', '/category/testimonial', '/category/uncategorized']);
// Checkpoint 1 decision 4: per-cottage map images are retired.
const RETIRED = /\/cottage-map-[^/]+\.jpg$/i;

const UPLOAD = /(?:https?:)?\/\/(?:dev\.)?blacohillcottages\.co\.uk\/wp-content\/uploads\/([^"'\s)?#,]+)/gi;

const cssText = async (href) => {
  const file = join(cssCache, href.split('/').pop());
  if (existsSync(file)) return readFile(file, 'utf8');
  const res = await fetch(href);
  const text = res.ok ? await res.text() : '';
  await writeFile(file, text);
  return text;
};

// Strip WordPress size suffixes (-300x200) so we keep one original per image.
const original = (p) => {
  const stripped = p.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
  return libraryPaths.has(stripped) ? stripped : p;
};

const media = new Map();
const perPage = {};

for (const { url, file } of urls) {
  if (DROPPED.has(url)) continue;
  const html = await readFile(join(root, 'raw', file), 'utf8');
  const hrefs = [...html.matchAll(/href=["']([^"']*et-cache[^"']*\.css)["']/g)].map((m) => m[1]);
  let haystack = html.replace(/&#0?38;/g, '&');
  for (const h of hrefs) haystack += '\n' + (await cssText(h));

  const found = new Map();
  for (const m of haystack.matchAll(UPLOAD)) {
    const raw = decodeURIComponent(m[1]);
    if (RETIRED.test(raw)) continue;
    const p = original(raw);
    const host = m[0].includes('dev.') ? 'dev' : 'live';
    found.set(p, host);
  }
  perPage[url] = [...found.keys()].sort();
  for (const [p, host] of found) {
    const entry = media.get(p) ?? { upload: p, local: `/media/${p}`, hosts: new Set(), pages: [] };
    entry.hosts.add(host);
    entry.pages.push(url);
    media.set(p, entry);
  }
}

const pageCount = Object.keys(perPage).length;
const list = [...media.values()]
  .map((e) => ({ ...e, hosts: [...e.hosts], siteWide: e.pages.length === pageCount, inLibrary: libraryPaths.has(e.upload) }))
  .sort((a, b) => a.upload.localeCompare(b.upload));

await writeFile(join(root, 'media-manifest.json'), JSON.stringify({ pages: perPage, media: list }, null, 2));
console.log(`pages: ${pageCount}, unique media: ${list.length}, site-wide: ${list.filter((m) => m.siteWide).length}, not in library: ${list.filter((m) => !m.inLibrary).length}`);
