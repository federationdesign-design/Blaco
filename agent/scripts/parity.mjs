// Content parity (brief 8.5): compares the visible text of every live page with
// the same URL in the new build and writes agent/PARITY.md.
// Live text comes from the raw HTML saved by fetch-raw.mjs; new text is fetched
// from a running build. Usage: BASE_URL=http://localhost:3102 node agent/scripts/parity.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { diffArrays } from 'diff';

const BASE = process.env.BASE_URL ?? 'http://localhost:3102';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const extract = join(repo, 'agent', 'extract');

const urls = JSON.parse(await readFile(join(extract, 'urls.json'), 'utf8'));
const index = JSON.parse(await readFile(join(repo, 'content', 'index.json'), 'utf8'));
const changes = JSON.parse(await readFile(join(extract, 'changes.json'), 'utf8'));

// Text that differs on purpose. Each entry: page (or '*'), a pattern matched
// against the missing or added run, and the reason from DECISIONS.md.
const INTENDED = [
  { page: '*', side: 'missing', match: /^(Name|Email Address|Message|Telephone|Submit)( (Name|Email Address|Message|Telephone|Submit))*$/, why: 'Form labels: live repeats them as hidden labels and placeholders; the port shows each once as a visible label' },
  { page: '*', side: 'added', match: /^(Name|Email Address|Message|Telephone|\*)( (Name|Email Address|Message|Telephone|\*))*$/, why: 'Form labels shown as visible labels with a required marker' },
  { page: '/about/faq', side: 'missing', match: /nations|supports|\bf\b|spending|cancelation|yoru/, why: 'Typo fix in the listed FAQ answer (decision 6)' },
  { page: '/about/faq', side: 'added', match: /national|support\b|\bIf\b|Depending|cancellation|your/, why: 'Typo fix in the listed FAQ answer (decision 6)' },
  { page: '*', side: 'added', match: /^\d{1,2}$/, why: 'Counter value: live animates it in with JavaScript from the same number', counter: true },
  { page: '/what-internet-speeds-can-i-expect', side: 'missing', match: /nations|supports/, why: 'Typo fix (decision 6)' },
  { page: '/what-internet-speeds-can-i-expect', side: 'added', match: /national|support\b/, why: 'Typo fix (decision 6)' },
  { page: '/what-is-your-cancellation-policy', side: 'missing', match: /\bf\b|spending|cancelation|yoru/, why: 'Typo fix (decision 6)' },
  { page: '/what-is-your-cancellation-policy', side: 'added', match: /\bIf\b|Depending|cancellation|your/, why: 'Typo fix (decision 6)' },
  { page: '/privacy-policy-2', side: 'missing', match: /enquiries@/, why: 'enquiries@ to victoria@ (decision 6)' },
  { page: '/privacy-policy-2', side: 'added', match: /victoria@/, why: 'enquiries@ to victoria@ (decision 6)' },
  { page: '*', side: 'missing', match: /^4$/, why: 'Swallow sleeps 5 (decision 5)', swallow: true },
  { page: '*', side: 'added', match: /^5$/, why: 'Swallow sleeps 5 (decision 5)', swallow: true },
  { page: '/about/faq', side: 'missing', match: /Rebecca P|Pho3nix1705|Deborah W|Charris-ment|Weekend away|girls weekend|Family weekend|family get together/, why: 'Testimonials removed from the FAQ index (the live blog module was unfiltered)' },
  { page: '/for-four-people', side: 'missing', match: /Swallow/, why: 'Swallow card moved to /for-six-people (decision 5)' },
  { page: '/for-six-people', side: 'added', match: /Swallow/, why: 'Swallow card moved from /for-four-people (decision 5)' },
  { page: '*', side: 'added', match: /^(FAQ|Testimonials)$/, why: 'Post pages link back to their index' },
  { page: '/', side: 'missing', match: /^(A warm welcome from Victoria and Thomas Blaco Hill Farm Cottages ?)+$/, why: 'The three live slides repeat one heading; the port shows it once over swipeable photos' },
  { page: '*', side: 'missing', match: /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/, why: 'Post date (moved into the post header)' },
  { page: '/', side: 'missing', match: /DVD Player/, why: 'DVD Player removed (Checkpoint 3 decision 2)' },
  { page: '/accessibility-statement', side: 'missing', match: /DVD [Pp]layer/, why: 'DVD Player removed (Checkpoint 3 decision 2)' },
  { page: '/accessibility-statement', side: 'added', match: /^TV[.,]?$/, why: 'DVD Player removed after "Digital TV" (Checkpoint 3 decision 2)' },
  { page: '/about', side: 'missing', match: /^12$/, why: 'Cottages counter 12 to 11 (Checkpoint 3 decision 3)' },
  { page: '/about', side: 'added', match: /^eleven$/, why: '"12 self catering properties" to eleven (Checkpoint 3 decision 3)' },
];

const normalise = (s) =>
  s
    .replace(/[   ]/g, ' ')
    .replace(/[​-‍﻿]/g, '')
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[-]/g, ' ') // Divi icon font glyphs
    .replace(/\s+/g, ' ')
    .trim();

const blockText = ($, root) => {
  root.find('script, style, noscript, template').remove();
  // Every block element ends a run of words, so adjacent blocks never merge.
  root.find('p, li, h1, h2, h3, h4, h5, h6, td, th, br, div, summary, blockquote, figcaption, a, label, button').each((_, el) => {
    $(el).prepend(' ').append(' ');
  });
  return normalise(root.text());
};

const liveText = (html) => {
  const $ = cheerio.load(html);
  const main = $('#et-main-area').first();
  main.find('footer, .et-l--footer, #sidebar, .et_pb_social_media_follow, .et_pb_contact_captcha_question, .et_pb_contact_captcha, input, textarea').remove();
  return blockText($, main);
};

const newText = (html) => {
  const $ = cheerio.load(html);
  const main = $('main').first();
  main.find('[aria-hidden="true"]').remove();
  return blockText($, main);
};

const tokens = (s) => s.split(/\s+/).filter(Boolean);

const posts = JSON.parse(await readFile(join(repo, 'content', 'posts.json'), 'utf8'));
const testimonialText = normalise(posts.testimonial.map((p) => cheerio.load(p.html).text()).join(' '));

const faqText = normalise(posts.faq.map((p) => cheerio.load(p.html).text()).join(' '));
const aboutLive = JSON.parse(await readFile(join(extract, 'content', 'about.json'), 'utf8'));
const aboutOldAnswers = normalise(
  aboutLive.sections.flatMap((sec) => sec.rows.flatMap((r) => r.columns.flatMap((c) => c.modules))).filter((m) => m.type === 'toggle').map((m) => cheerio.load(m.html).text()).join(' '),
);

const rows = [];
const details = [];
let totalMissing = 0;

for (const { url, file } of urls) {
  const entry = index.find((e) => e.url === url);
  if (!entry) continue; // dropped or redirected (decisions 2 and 3)
  const live = liveText(await readFile(join(extract, 'raw', file), 'utf8'));
  const res = await fetch(`${BASE}${url}`);
  const fresh = newText(await res.text());

  const a = tokens(live);
  const b = tokens(fresh);
  const parts = diffArrays(a, b);
  const missing = [];
  const added = [];
  for (const p of parts) {
    if (p.removed) missing.push(p.value.join(' '));
    if (p.added) added.push(p.value.join(' '));
  }

  // A run that is missing in one place but present elsewhere has moved.
  const classify = (run, side) => {
    const other = side === 'missing' ? fresh : live;
    if (run.split(' ').length >= 3 && other.includes(run)) return { run, kind: 'moved' };
    const intended = INTENDED.find((i) => (i.page === '*' || i.page === url) && i.side === side && i.match.test(run) && (!i.swallow || /swallow/i.test(url) || changes.some((c) => c.url === url && /Swallow/.test(c.what))));
    if (intended) return { run, kind: 'intended', why: intended.why };
    return { run, kind: side === 'missing' ? 'missing' : 'added' };
  };

  const m = missing.map((r) => classify(r, 'missing'));
  const ad = added.map((r) => classify(r, 'added'));
  const unexplained = m.filter((x) => x.kind === 'missing');
  totalMissing += unexplained.length;


  // Missing text that belongs to a testimonial post (the unfiltered live FAQ index).
  for (const x of m) {
    if (x.kind === 'missing' && url === '/about/faq' && testimonialText.includes(x.run.slice(0, 60))) {
      x.kind = 'intended';
      x.why = 'Testimonial removed from the FAQ index (the live blog module was unfiltered)';
    }
  }
  // Checkpoint 3 decision 3: About toggles now give the FAQ pages' answers. Only
  // words from the old toggle answers may go, and only words from the FAQ pages may arrive.
  if (url === '/about') {
    for (const x of m) if (x.kind === 'missing' && aboutOldAnswers.includes(x.run)) Object.assign(x, { kind: 'intended', why: 'About toggle aligned to its FAQ page (Checkpoint 3 decision 3)' });
    for (const x of ad) if (x.kind === 'added' && faqText.includes(x.run)) Object.assign(x, { kind: 'intended', why: 'About toggle aligned to its FAQ page (Checkpoint 3 decision 3)' });
  }
  // A removed run replaced by the same words with different spacing.
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i].removed && parts[i + 1].added && parts[i].value.join('') === parts[i + 1].value.join('')) {
      for (const x of [...m, ...ad]) if (x.run === parts[i].value.join(' ') || x.run === parts[i + 1].value.join(' ')) Object.assign(x, { kind: 'intended', why: 'Whitespace only (live excerpt joins two paragraphs)' });
    }
  }
  const unexplainedNow = m.filter((x) => x.kind === 'missing');
  totalMissing += unexplainedNow.length - unexplained.length;
  unexplained.length = 0;
  unexplained.push(...unexplainedNow);

  rows.push({
    url,
    template: entry.template,
    status: res.status,
    live: a.length,
    fresh: b.length,
    missing: unexplained.length,
    intended: m.filter((x) => x.kind === 'intended').length + ad.filter((x) => x.kind === 'intended').length,
    moved: m.filter((x) => x.kind === 'moved').length,
    added: ad.filter((x) => x.kind === 'added').length,
  });

  const pageChanges = changes.filter((c) => c.url === url);
  if (unexplained.length || m.some((x) => x.kind === 'intended') || ad.some((x) => x.kind !== 'moved') || pageChanges.length) {
    const lines = [`### \`${url}\``, ''];
    if (pageChanges.length) {
      lines.push('Deliberate changes made by the port:', '');
      for (const c of pageChanges) lines.push(`- ${c.what}`);
      lines.push('');
    }
    for (const x of m.filter((x) => x.kind !== 'moved')) lines.push(`- **${x.kind === 'missing' ? 'Missing or changed' : 'Intended'}:** "${x.run.slice(0, 300)}"${x.why ? ` (${x.why})` : ''}`);
    for (const x of ad.filter((x) => x.kind !== 'moved')) lines.push(`- **${x.kind === 'added' ? 'Added' : 'Intended'}:** "${x.run.slice(0, 300)}"${x.why ? ` (${x.why})` : ''}`);
    lines.push('');
    details.push(lines.join('\n'));
  }
}

const table = [
  '| URL | Template | Status | Live words | New words | Missing or changed | Intended | Moved | Added |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| \`${r.url}\` | ${r.template} | ${r.status} | ${r.live} | ${r.fresh} | ${r.missing ? `**${r.missing}**` : 0} | ${r.intended} | ${r.moved} | ${r.added} |`),
];

const report = `# Content parity report

Generated by \`agent/scripts/parity.mjs\` on ${new Date().toISOString().slice(0, 10)}.

Compares the visible text of each live WordPress page (raw HTML saved by \`fetch-raw.mjs\`, main content only, without the header, footer and the dropped post sidebar) with the same URL in the new build (\`<main>\`). Text is compared word by word after normalising whitespace, curly quotes and dashes.

- **Missing or changed:** live text not found in the new page. Each needs an explanation.
- **Intended:** differences required by \`agent/DECISIONS.md\` (typo fixes, Swallow sleeps 5, email change, FAQ index filter) or by the port itself (form labels shown once).
- **Moved:** text present in both, in a different order (for example cottage features ahead of the description on mobile).
- **Added:** text in the new page that is not on the live page.

**Pages compared:** ${rows.length}. **Pages with unexplained missing or changed text:** ${rows.filter((r) => r.missing).length}. **Unexplained runs in total:** ${totalMissing}.

${table.join('\n')}

## Details

${details.join('\n')}
`;

await writeFile(join(repo, 'agent', 'PARITY.md'), report);
console.log(`pages: ${rows.length}, pages with unexplained differences: ${rows.filter((r) => r.missing).length}, runs: ${totalMissing}`);
