// Fetches raw HTML for every sitemap URL plus the WordPress REST API into agent/extract.
// Re-runnable: node agent/scripts/fetch-raw.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://blacohillcottages.co.uk';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'extract');
const rawDir = join(root, 'raw');
const apiDir = join(root, 'api');
await mkdir(rawDir, { recursive: true });
await mkdir(apiDir, { recursive: true });

const get = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': 'blaco-rebuild-extract' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
};

const locs = async (url) => [...(await (await get(url)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const urls = [];
for (const s of ['posts-post-1', 'posts-page-1', 'taxonomies-category-1']) urls.push(...(await locs(`${ORIGIN}/wp-sitemap-${s}.xml`)));
urls.push(`${ORIGIN}/category/faq/page/2`);

const slugFor = (u) => (new URL(u).pathname.replace(/^\/|\/$/g, '') || 'home').replace(/\//g, '__');

const index = [];
for (const u of urls) {
  const res = await get(u);
  const html = await res.text();
  const file = `${slugFor(u)}.html`;
  await writeFile(join(rawDir, file), html);
  index.push({ url: new URL(u).pathname.replace(/\/$/, '') || '/', file, status: res.status });
  process.stdout.write('.');
}
await writeFile(join(root, 'urls.json'), JSON.stringify(index, null, 2));

// Full REST collections, paginated.
for (const type of ['pages', 'posts', 'categories', 'media']) {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${ORIGIN}/wp-json/wp/v2/${type}?per_page=100&page=${page}`);
    if (!res.ok) break;
    const batch = await res.json();
    all.push(...batch);
    if (page >= Number(res.headers.get('x-wp-totalpages') || 1)) break;
  }
  await writeFile(join(apiDir, `${type}.json`), JSON.stringify(all, null, 2));
  console.log(`\n${type}: ${all.length}`);
}
console.log(`pages fetched: ${index.length}`);
