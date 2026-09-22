// SEO audit. Reads the prerendered HTML in .next/server/app/ and reports the
// head tags and heading levels of every page, then cross-checks the set
// against content/index.json and the generated sitemap.
//
// Run `npm run build` first, or the report describes a stale build.
//
//   node agent/scripts/seo-audit.mjs
//
// The findings are written up in agent/SEO.md.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = process.cwd();
const OUT = join(ROOT, '.next/server/app');

if (!existsSync(OUT)) {
  console.error('No build found at .next/server/app. Run npm run build first.');
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(ROOT, 'content/index.json'), 'utf8'));
const SITE = 'https://blacohillcottages.co.uk';

// The approved descriptions, so the audit can prove the pages carry them exactly.
const approved = Object.fromEntries(
  readFileSync(join(ROOT, 'agent/blaco_seo_descriptions.csv'), 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^"(.*?)","([\s\S]*)"$/);
      return m ? [m[1], m[2].replace(/""/g, '"')] : null;
    })
    .filter(Boolean)
);

const pages = index.map((entry) => {
  const file = join(OUT, entry.url === '/' ? 'index.html' : `${entry.url.slice(1)}.html`);
  if (!existsSync(file)) return { ...entry, missing: true };
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const attrs = (sel, key) => $(sel).map((_, el) => `${$(el).attr(key)}=${$(el).attr('content')}`).get();
  return {
    url: entry.url,
    template: entry.template,
    title: $('title').first().text(),
    description: $('meta[name="description"]').attr('content') ?? null,
    canonical: $('link[rel="canonical"]').attr('href') ?? null,
    og: attrs('meta[property^="og:"]', 'property'),
    twitter: attrs('meta[name^="twitter:"]', 'name'),

    ogTitle: $('meta[property="og:title"]').attr('content') ?? null,
    ogDescription: $('meta[property="og:description"]').attr('content') ?? null,
    ogUrl: $('meta[property="og:url"]').attr('content') ?? null,
    ogType: $('meta[property="og:type"]').attr('content') ?? null,
    ogSiteName: $('meta[property="og:site_name"]').attr('content') ?? null,
    ogImage: $('meta[property="og:image"]').attr('content') ?? null,
    ogImageWidth: $('meta[property="og:image:width"]').attr('content') ?? null,
    ogImageHeight: $('meta[property="og:image:height"]').attr('content') ?? null,
    twitterCard: $('meta[name="twitter:card"]').attr('content') ?? null,
    structuredData: $('script[type="application/ld+json"]').length,
    robots: $('meta[name="robots"]').attr('content') ?? null,
    lang: $('html').attr('lang') ?? null,
    h1s: $('h1').map((_, el) => $(el).text().trim().replace(/\s+/g, ' ')).get(),
  };
});

const built = pages.filter((p) => !p.missing);

const duplicates = (key) => {
  const seen = new Map();
  for (const page of built) {
    const value = page[key];
    if (!value) continue;
    seen.set(value, [...(seen.get(value) ?? []), page.url]);
  }
  return [...seen].filter(([, urls]) => urls.length > 1);
};

// The sitemap is generated, so read it back rather than re-deriving it.
const sitemapBody = join(OUT, 'sitemap.xml.body');
const sitemapUrls = existsSync(sitemapBody)
  ? [...readFileSync(sitemapBody, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  : [];
const expected = index.map((e) => (e.url === '/' ? SITE : `${SITE}${e.url}`));

const report = {
  pages: pages.length,
  missingFromBuild: pages.filter((p) => p.missing).map((p) => p.url),
  missingTitle: built.filter((p) => !p.title).map((p) => p.url),
  duplicateTitles: duplicates('title'),
  titlesOver60: built.filter((p) => p.title.length > 60).map((p) => [p.title.length, p.url]),
  missingDescription: built.filter((p) => !p.description).map((p) => p.url),
  descriptionNotAsApproved: built
    .filter((p) => p.description !== approved[p.url])
    .map((p) => ({ url: p.url, approved: approved[p.url] ?? null, found: p.description })),
  descriptionsOver160: built.filter((p) => (p.description ?? '').length > 160).map((p) => [p.description.length, p.url]),
  ogDescriptionNotMatching: built.filter((p) => p.ogDescription !== p.description).map((p) => p.url),
  ogTitleNotMatchingTitle: built.filter((p) => p.ogTitle !== p.title).map((p) => p.url),
  ogUrlNotMatchingCanonical: built.filter((p) => p.ogUrl !== p.canonical).map((p) => [p.url, p.ogUrl, p.canonical]),
  missingOgType: built.filter((p) => !p.ogType).map((p) => p.url),
  missingOgSiteName: built.filter((p) => !p.ogSiteName).map((p) => p.url),
  twitterCardNotLargeImage: built.filter((p) => p.twitterCard !== 'summary_large_image').map((p) => [p.url, p.twitterCard]),
  ogImageProblems: built
    .filter((p) => !p.ogImage || !p.ogImage.startsWith(`${SITE}/`) || !p.ogImageWidth || !p.ogImageHeight)
    .map((p) => [p.url, p.ogImage, p.ogImageWidth, p.ogImageHeight]),
  // og:image files must actually exist in public/, or the preview is a 404.
  ogImageMissingFile: built
    .filter((p) => p.ogImage?.startsWith(`${SITE}/`) && !existsSync(join(ROOT, 'public', p.ogImage.slice(SITE.length + 1))))
    .map((p) => p.ogImage),
  ogImageIsLogo: built.filter((p) => /cropped-bird\.png$/.test(p.ogImage ?? '')).length,
  missingCanonical: built.filter((p) => !p.canonical).map((p) => p.url),
  missingOpenGraph: built.filter((p) => p.og.length === 0).map((p) => p.url),
  missingTwitter: built.filter((p) => p.twitter.length === 0).map((p) => p.url),
  missingStructuredData: built.filter((p) => p.structuredData === 0).length,
  noindex: built.filter((p) => /noindex/i.test(p.robots ?? '')).map((p) => p.url),
  noH1: built.filter((p) => p.h1s.length === 0).map((p) => [p.url, p.template]),
  multipleH1: built.filter((p) => p.h1s.length > 1).map((p) => [p.url, p.h1s]),
  duplicateH1s: (() => {
    const seen = new Map();
    for (const page of built) for (const h of page.h1s) seen.set(h, [...(seen.get(h) ?? []), page.url]);
    return [...seen].filter(([, urls]) => urls.length > 1);
  })(),
  langs: [...new Set(built.map((p) => p.lang))],
  sitemap: {
    count: sitemapUrls.length,
    notOnLiveDomain: sitemapUrls.filter((u) => !u.startsWith(SITE)),
    inSitemapButNotBuilt: sitemapUrls.filter((u) => !expected.includes(u)),
    builtButNotInSitemap: expected.filter((u) => !sitemapUrls.includes(u)),
  },
};

console.log(JSON.stringify(report, null, 2));
