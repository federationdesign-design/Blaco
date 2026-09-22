// Builds the site's content files from the extracted live pages:
//   content/pages/<slug>.json  one file per URL
//   content/index.json         URL, template and title for every page
// Applies the Checkpoint 1 and 2 decisions (agent/DECISIONS.md) and logs every
// deliberate change to agent/extract/changes.json for the parity report.
// Run: node agent/scripts/extract-content.mjs && node agent/scripts/build-content.mjs
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = join(repo, 'agent', 'extract', 'content');
const out = join(repo, 'content', 'pages');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const dims = JSON.parse(await readFile(join(repo, 'content', 'media.json'), 'utf8'));
const posts = JSON.parse(await readFile(join(repo, 'agent', 'extract', 'api', 'posts.json'), 'utf8'));
const changes = [];
const problems = [];
const note = (url, what) => changes.push({ url, what });

const SUFFIX = ' | Blaco Hill Farm Cottages';

// Meta and og:description for every page, approved by Steve and used exactly as
// written (agent/blaco_seo_descriptions.csv). Never edited or generated here.
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c !== '"') cell += c;
      else if (text[i + 1] === '"') (cell += '"'), i++;
      else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ',') (row.push(cell), (cell = ''));
    else if (c === '\n') (row.push(cell), rows.push(row), (row = []), (cell = ''));
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));
  return rows;
};
const DESCRIPTIONS = Object.fromEntries(
  parseCsv(await readFile(join(repo, 'agent', 'blaco_seo_descriptions.csv'), 'utf8'))
    .slice(1)
    .filter((r) => r[0])
    .map((r) => [r[0], r[1]])
);
const DROPPED = new Set(['/sample-page', '/booking-test', '/category/faq', '/category/faq/page/2', '/category/testimonial', '/category/uncategorized']);
const MAP = '/maps/cottage-map-2026.jpg';

// ---------- decisions applied to copy ----------

// Exact-string copy changes: [from, to, reason]. Every change is logged.
const COPY_FIXES = {
  '/what-internet-speeds-can-i-expect': [
    ['around the nations average', 'around the national average', 'Checkpoint 1 decision 6'],
    ['It will supports streaming', 'It will support streaming', 'Checkpoint 1 decision 6'],
  ],
  '/what-is-your-cancellation-policy': [
    ['<p>f you need to cancel', '<p>If you need to cancel', 'Checkpoint 1 decision 6'],
    [
      'spending on the time between the cancelation and the booking may result in yoru deposit being lost.',
      'Depending on how close to your arrival date you cancel, you may lose your deposit.',
      'Checkpoint 3 decision 4',
    ],
  ],
  '/privacy-policy-2': [['enquiries@blacohillcottages.co.uk', 'victoria@blacohillcottages.co.uk', 'Checkpoint 1 decision 6']],
  '/': [[', DVD Player', '', 'Checkpoint 3 decision 2']],
  '/accessibility-statement': [
    [' &amp; DVD Player', '', 'Checkpoint 3 decision 2'],
    [' &amp; DVD player', '', 'Checkpoint 3 decision 2'],
    [', DVD Player', '', 'Checkpoint 3 decision 2'],
  ],
  '/about': [
    ['a selection of 12 self catering properties', 'a selection of eleven self catering properties', 'Checkpoint 3 decision 3'],
    // agent/SEO.md: /about and /our-cottages both had the H1 "Blaco Hill Farm
    // Cottages". Only /about changes, which is enough to tell them apart, and
    // it is the page the word "About" already introduces.
    ['<h1>Blaco Hill Farm Cottages</h1>', '<h1>About Blaco Hill Farm Cottages</h1>', 'agent/SEO.md: the two H1s were identical'],
  ],
  // agent/SEO.md: the listing page had the bare brand name as its H1, which it
  // shared with /about. Eleven is the cottage count the About page already gives.
  '/our-cottages': [['<h1>Blaco Hill Farm Cottages</h1>', '<h1>Our Eleven Cottages</h1>', 'agent/SEO.md: a listing page needs a heading of its own']],
  // agent/SEO.md: the page started at H2, so it had no H1. Same wording.
  '/calendar': [['<h2>Cottage Availability</h2>', '<h1>Cottage Availability</h1>', 'agent/SEO.md: the page had no H1']],
};

// agent/SEO.md: the one title still too long to be useful in a search result.
// The live question runs to 102 characters, so the result showed nothing but
// the question's first half. The H1 keeps the guest's own wording.
const TITLE_OVERRIDES = {
  '/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure': 'Check-in and checkout times',
};

// agent/SEO.md: these two pages had no H1 either. Their form title is the only
// top-level heading on the page, so it becomes the H1. No wording changes.
const FORM_H1 = new Set(['/ask-us-a-question', '/booking-request-form']);


// Checkpoint 1 decision 5: Swallow sleeps 5 everywhere.
const swallowFive = (html, url) => {
  const next = html
    .replace(/(Swallow\s*[-–]\s*Sleeps\s*)4/g, '$15')
    .replace(/(<h[1-6]>\s*Swallow\s*<\/h[1-6]>[\s\S]{0,80}?Sleeps\s*)4/g, '$15');
  if (next !== html) note(url, 'Swallow shown as sleeping 5 (decision 5)');
  return next;
};

const fixHref = (href, url) => {
  if (href === '/our-cottages/chaffinch') {
    note(url, 'Link to /our-cottages/chaffinch (a 404 on live) points to /our-cottages/chaffinch-2');
    return '/our-cottages/chaffinch-2';
  }
  return href;
};

// ---------- helpers ----------

// Checkpoint 3 decision 5: alt text is written by looking at each image, kept in
// content/alt-text.json keyed by path. It is never derived from file names.
const ALT = JSON.parse(await readFile(join(repo, 'content', 'alt-text.json'), 'utf8'));

const img = (srcPath, alt, title, url, decorative = false) => {
  if (!srcPath) return null;
  let path = srcPath;
  let altText = alt;
  if (/\/cottage-map-[^/]+\.jpg$/i.test(path)) {
    path = MAP;
    note(url, `Per-cottage map ${srcPath.split('/').pop()} replaced by the 2026 site map (decision 4)`);
  }
  const d = dims[path];
  if (!d) {
    problems.push(`${url}: no local file for ${path}`);
    return null;
  }
  if (!decorative) {
    altText = ALT[path];
    if (!altText) problems.push(`${url}: no reviewed alt text for ${path}`);
  }
  return { src: path, width: d.width, height: d.height, alt: decorative ? '' : altText ?? '' };
};

// Live gradients come in two families: a white wash (dark text) and a green
// overlay (white text). They map to named overlays in the CSS.
const overlay = (gradient) => (!gradient ? 'dark' : gradient.includes('rgba(255,255,255') ? 'light' : 'green');
const background = (bg, url) => (bg ? { image: bg.image ? img(bg.image, '', '', url, true) : null, overlay: overlay(bg.gradient) } : null);

// Clean module HTML for rendering: unwrap spans, drop empty nodes, turn a small
// heading that sits directly above a larger one into a kicker paragraph.
const clean = (html, url) => {
  if (!html) return '';
  const $ = cheerio.load(`<div id="root">${html}</div>`, null, false);
  const root = $('#root');
  root.find('*').addBack().contents().filter((_, n) => n.type === 'comment').remove();
  root.find('span, font').each((_, el) => $(el).replaceWith($(el).contents()));
  root.find('img').each((_, el) => {
    problems.push(`${url}: inline image in text removed from rich text: ${$(el).attr('src')}`);
    $(el).remove();
  });
  root.find('a').each((_, el) => {
    const $a = $(el);
    const href = fixHref($a.attr('href'), url);
    $a.attr('href', href);
    $a.removeAttr('target');
    if (/^https?:\/\//.test(href || '')) $a.attr('rel', 'noopener');
  });
  root.find('p, li, h1, h2, h3, h4, h5, h6').each((_, el) => {
    if (!$(el).text().replace(/ /g, ' ').trim() && !$(el).find('img, br + *').length) $(el).remove();
  });
  root.children('h5, h6').each((_, el) => {
    const next = $(el).next();
    if (next.length && /^h[1-4]$/.test(next[0].tagName)) $(el).replaceWith(`<p data-kicker="">${$(el).html()}</p>`);
  });
  return root.html().replace(/&nbsp;/g, ' ').replace(/ /g, ' ').replace(/\s+/g, ' ').replace(/<br>\s*<\/li>/g, '</li>').trim();
};

// Component match to live, decision 1: headings the live CSS sets in Raleway get
// data-font="sans". Kickers (small headings above a larger one) are already
// Raleway through their own style. Live sets every one of these at weight 700,
// which is the default heading weight here.
const markSans = (html, tags = {}) => {
  const names = Object.keys(tags);
  if (!names.length) return html;
  for (const [tag, weight] of Object.entries(tags)) if (weight !== '700') problems.push(`unexpected live weight ${weight} on Raleway ${tag}`);
  const $ = cheerio.load(`<div id="root">${html}</div>`, null, false);
  $('#root').find(names.join(',')).attr('data-font', 'sans');
  return $('#root').html();
};

const applyCopy = (html, url) => {
  let next = swallowFive(html, url);
  for (const [from, to, why] of COPY_FIXES[url] ?? []) {
    if (next.includes(from)) {
      next = next.split(from).join(to);
      note(url, to ? `Copy change: "${from}" to "${to}" (${why})` : `Copy change: "${from.trim()}" removed (${why})`);
    }
  }
  return next;
};

const ICONS = { e081: 'pin', e074: 'house', e08b: 'people', e090: 'phone', e076: 'mail', e052: 'check', e084: 'bed' };
const iconName = (icon) => (icon ? ICONS[[...icon].map((c) => c.codePointAt(0).toString(16)).join('')] ?? null : null);

// ---------- module and section conversion ----------

// Success messages set on the live Divi forms (success_message in the REST
// shortcodes). Forms without one showed Divi's default.
const pagesApi = JSON.parse(await readFile(join(repo, 'agent', 'extract', 'api', 'pages.json'), 'utf8'));
const FORM_SUCCESS = { default: 'Thanks for contacting us' };
for (const p of pagesApi) {
  const m = p.content.rendered.match(/success_message=&#8221;(.*?)&#8221;/);
  if (m) FORM_SUCCESS[new URL(p.link).pathname.replace(/\/$/, '') || '/'] = cheerio.load(m[1]).text();
}

const DEFAULT_BUTTON = { 'Request a booking': '/booking-request-form', 'Check Availability': '/calendar' };

const convertModule = (m, url) => {
  const html = (h) => applyCopy(clean(h, url), url);
  switch (m.type) {
    case 'text':
      return { type: 'text', html: markSans(html(m.html), m.sansHeadings) };
    case 'image':
      return { type: 'image', image: img(m.src, m.alt, m.title, url), href: m.href && !m.href.startsWith('/media/') ? fixHref(m.href, url) : null };
    case 'blurb': {
      if (m.title.trim() === 'DVD Player') {
        note(url, 'Amenity "DVD Player" removed (Checkpoint 3 decision 2)');
        return null;
      }
      const icon = iconName(m.icon);
      let href = m.href ? fixHref(m.href, url) : null;
      // Rule 6: phone numbers and emails are links.
      if (icon === 'phone') href = `tel:+44${m.title.replace(/\D/g, '').replace(/^0/, '')}`;
      if (icon === 'mail') href = `mailto:${m.title.toLowerCase()}`;
      return { type: 'blurb', title: applyCopy(m.title, url), icon, sans: Boolean(m.sans), image: m.image ? img(m.image.src, m.image.alt, '', url) : null, href, html: html(m.html) };
    }
    case 'button': {
      let href = m.href;
      if (!href) {
        href = DEFAULT_BUTTON[m.label] ?? null;
        note(url, `"${m.label}" button has no link on live; linked to ${href}`);
      }
      return { type: 'button', label: m.label, href: fixHref(href, url) };
    }
    case 'toggle':
    case 'accordion_item':
      return { type: 'toggle', title: m.title, sans: Boolean(m.sans), html: html(m.html) };
    case 'testimonial':
      return { type: 'testimonial', author: m.author, html: html(m.html), portrait: m.portrait ? img(m.portrait, '', '', url, true) : null };
    case 'contact_form':
      if (FORM_H1.has(url)) note(url, `Form title "${m.title}" is the page's H1 rather than an H2 (agent/SEO.md). Same wording.`);
      return {
        type: 'form',
        variant: m.fields.some((f) => f.name?.includes('_tel_')) ? 'full' : 'quick',
        title: m.title,
        titleSans: Boolean(m.titleSans),
        heading: FORM_H1.has(url) ? 'h1' : 'h2',
        fields: m.fields.map((f) => ({ name: f.name, label: f.label, type: f.tag === 'textarea' ? 'textarea' : f.fieldType === 'email' ? 'email' : f.name.includes('_tel_') ? 'tel' : 'text', required: f.required })),
        submit: m.submit || 'Submit',
        success: FORM_SUCCESS[url] ?? FORM_SUCCESS.default,
      };
    case 'number_counter':
      if (url === '/about' && m.title === 'Cottages' && m.number === '12') {
        note(url, 'Cottages counter changed from 12 to 11 (Checkpoint 3 decision 3)');
        return { type: 'counter', number: '11', title: m.title, sans: Boolean(m.sans) };
      }
      return { type: 'counter', number: m.number, title: m.title, sans: Boolean(m.sans) };
    case 'gallery':
      return { type: 'gallery', images: m.images.map((i) => img(i.src, i.alt, i.title, url)).filter(Boolean) };
    case 'divider':
      return { type: 'divider' };
    case 'map':
      return { type: 'map', title: m.title, lat: Number(m.lat), lng: Number(m.lng) };
    case 'posts':
      return { type: 'posts' };
    case 'social_media_follow':
      note(url, 'Social media icons dropped: every link on live is "#"');
      return null;
    case 'fullwidth_slider':
    case 'slider':
      return { type: 'slider', slides: m.slides.map((s) => ({ title: s.title, titleSans: Boolean(s.titleSans), html: clean(s.html, url), image: s.background?.image ? img(s.background.image, '', '', url) : null })) };
    default:
      problems.push(`${url}: unhandled module ${m.type}`);
      return null;
  }
};

// A column holding image + text + "Read more" button is a cottage card.
const asCard = (modules, url) => {
  const types = modules.map((m) => m.type).join(',');
  if (!/^(image,)?text,button$/.test(types) || modules.at(-1).label !== 'Read more') return null;
  const button = modules.at(-1);
  const image = modules[0].type === 'image' ? modules[0] : null;
  if (image?.href && image.href !== button.href) note(url, `Card image linked to ${image.href} on live; now links to ${button.href} like its button`);
  return { type: 'card', image: image?.image ?? null, html: modules.find((m) => m.type === 'text').html, href: button.href, label: button.label };
};

const sectionKind = (section, modules) => {
  const types = new Set(modules.map((m) => m.type));
  if (types.has('slider')) return 'slider';
  if (section.rows.length === 0 && section.background?.image) return 'parallax';
  if (modules.some((m) => m.type === 'text' && /<h1[\s>]/.test(m.html)) && section.background?.image) return 'hero';
  if (types.has('testimonial')) return 'reviews';
  if (modules.some((m) => m.type === 'blurb' && m.icon === 'phone')) return 'contact';
  if (modules.filter((m) => m.type === 'blurb' && m.icon === 'check').length >= 3) return 'amenities';
  if (types.has('card')) return 'cards';
  if (section.background) return 'band';
  return 'content';
};

const convertSections = (page, url) => {
  const sections = [];
  for (const s of page.sections) {
    if (s.hiddenOn.length === 3) continue;
    const rows = [];
    for (const r of s.rows) {
      if (r.hiddenOn.length === 3) continue;
      let columns = r.columns
        .map((c) => ({ size: c.size ?? '4_4', modules: c.modules.filter((m) => m.hiddenOn?.length !== 3).map((m) => convertModule(m, url)).filter(Boolean) }))
        .map((c) => {
          const card = asCard(c.modules, url);
          return card ? { ...c, modules: [card] } : c;
        })
        .filter((c) => c.modules.length);
      if (!columns.length) continue;
      // A row of images only becomes one swipeable gallery.
      const all = columns.flatMap((c) => c.modules);
      if (all.length > 1 && all.every((m) => m.type === 'image' && !m.href)) {
        const images = all.map((m) => m.image).filter(Boolean);
        const prev = rows.at(-1)?.columns;
        if (prev?.length === 1 && prev[0].modules.length === 1 && prev[0].modules[0].type === 'gallery') {
          prev[0].modules[0].images.push(...images);
          continue;
        }
        columns = [{ size: '4_4', modules: [{ type: 'gallery', images }] }];
      }
      // Consecutive rows of blurbs (amenities, highlights) read as one list.
      const prevRow = rows.at(-1);
      const onlyBlurbs = (cols) => cols.every((c) => c.modules.every((m) => m.type === 'blurb'));
      if (prevRow && onlyBlurbs(prevRow.columns) && onlyBlurbs(columns) && prevRow.columns[0].size === columns[0].size) {
        prevRow.columns.push(...columns);
        continue;
      }
      rows.push({ columns });
    }
    const modules = rows.flatMap((r) => r.columns.flatMap((c) => c.modules));
    const section = { kind: null, background: background(s.background, url), rows };
    section.kind = sectionKind({ ...s, rows, background: section.background }, modules);
    sections.push(section);
  }
  return sections;
};

// ---------- templates ----------

const templateFor = (url) => {
  if (url === '/') return 'home';
  if (url === '/our-cottages' || /^\/for-(six|four|two)-people$/.test(url)) return 'listing';
  if (url.startsWith('/our-cottages/')) return 'cottage';
  if (url === '/about/faq') return 'faq-index';
  if (url === '/about/testimonials') return 'testimonial-index';
  if (['/contact-us', '/booking-request-form', '/ask-us-a-question', '/calendar'].includes(url)) return 'contact';
  if (['/cookies', '/privacy-policy-2', '/disclaimer'].includes(url)) return 'policy';
  if (url === '/accessibility-statement') return 'accessibility';
  if (['/about', '/about/games-room', '/about/local-interests', '/checking-in-checkout-process'].includes(url)) return 'general';
  return 'post';
};

// Cottage pages lead with the essentials on mobile (brief 5.10), so the intro row
// is split into its description and features parts.
const cottageParts = (sections, url) => {
  const hero = sections.find((s) => s.kind === 'hero');
  const introSection = sections.find((s) => s !== hero && s.rows.some((r) => r.columns.some((c) => c.size === '2_5')));
  if (!hero || !introSection) {
    problems.push(`${url}: cottage structure not recognised`);
    return null;
  }
  const introRow = introSection.rows.find((r) => r.columns.some((c) => c.size === '2_5'));
  const heading = hero.rows[0].columns[0].modules[0];
  const highlightRow = hero.rows[1];
  // The 2026 site map is shown uncropped on its own, not squared off in the gallery.
  const galleryModules = introSection.rows.filter((r) => r !== introRow).flatMap((r) => r.columns.flatMap((c) => c.modules));
  return {
    background: hero.background,
    heading: heading.html,
    highlights: highlightRow.columns.flatMap((c) => c.modules).filter((m) => m.type === 'blurb'),
    action: highlightRow.columns.flatMap((c) => c.modules).find((m) => m.type === 'button') ?? null,
    description: introRow.columns.find((c) => c.size === '3_5').modules,
    features: introRow.columns.find((c) => c.size === '2_5').modules,
    gallery: galleryModules.map((m) => (m.type === 'gallery' ? { ...m, images: m.images.filter((i) => i.src !== MAP) } : m)),
    map: galleryModules.flatMap((m) => (m.type === 'gallery' ? m.images : m.type === 'image' ? [m.image] : [])).find((i) => i?.src === MAP) ?? null,
    sections: sections.filter((s) => s !== hero && s !== introSection),
  };
};

// ---------- posts ----------

const faqPosts = [];
const testimonialPosts = [];

// ---------- run ----------

const index = [];
const extracted = new Map();
for (const f of await readdir(src)) {
  const page = JSON.parse(await readFile(join(src, f), 'utf8'));
  extracted.set(page.url, page);
}

// Checkpoint 1 decision 5: Swallow's card moves from "For four" to "For six".
const moveSwallow = (pages) => {
  const four = pages.get('/for-four-people');
  const six = pages.get('/for-six-people');
  const findCardRow = (p) => p.sections.find((s) => s.kind === 'cards');
  const fourCards = findCardRow(four);
  let swallow = null;
  for (const row of fourCards.rows) {
    const i = row.columns.findIndex((c) => c.modules[0]?.href === '/our-cottages/swallow');
    if (i >= 0) [swallow] = row.columns.splice(i, 1);
  }
  const sixCards = findCardRow(six);
  sixCards.rows.at(-1).columns.push(swallow);
  note('/for-four-people', 'Swallow card moved to /for-six-people (decision 5)');
  note('/for-six-people', 'Swallow card added from /for-four-people, showing Sleeps 5 (decision 5)');
};

const built = new Map();
for (const [url, page] of extracted) {
  if (DROPPED.has(url)) continue;
  const template = templateFor(url);
  // Titles are the live ones, bar the one override above. They fit in a search
  // result because the brand suffix is the short " | Blaco Hill"
  // (app/layout.tsx), not the live site's " | Blaco Hill Farm Cottages".
  const live = page.title.endsWith(SUFFIX) ? page.title.slice(0, -SUFFIX.length) : page.title;
  const title = TITLE_OVERRIDES[url] ?? live;
  if (title !== live) note(url, `Title shortened for search results: "${live}" to "${title}" (agent/SEO.md). The H1 is unchanged.`);
  const doc = { url, template, title, absoluteTitle: url === '/' ? page.title : null };
  if (template === 'post') {
    const apiPost = posts.find((p) => p.link.replace(/\/$/, '').endsWith(url));
    const category = apiPost?.categories.includes(3) ? 'testimonial' : 'faq';
    doc.post = { title: page.post.title, date: page.post.date, category, html: applyCopy(clean(page.post.html, url), url) };
    (category === 'faq' ? faqPosts : testimonialPosts).push({ url, title: doc.post.title, html: doc.post.html, date: apiPost.date });
  } else {
    doc.sections = convertSections(page, url);
  }
  built.set(url, doc);
}

moveSwallow(built);

// Brief 6: new page on the general content template. Text to come from Steve.
built.set('/modern-slavery', {
  url: '/modern-slavery',
  template: 'general',
  title: 'Modern Slavery Statement',
  absoluteTitle: null,
  sections: [
    {
      kind: 'content',
      background: null,
      rows: [{ columns: [{ size: '4_4', modules: [{ type: 'text', html: '<h1>Modern Slavery Statement</h1> <p>[MODERN_SLAVERY_TEXT]</p>' }] }] }],
    },
  ],
});

// The accessibility statement puts "Sleeps 4" in a list under a separate Swallow heading.
for (const section of built.get('/accessibility-statement').sections) {
  const modules = section.rows.flatMap((r) => r.columns.flatMap((c) => c.modules));
  if (!modules.some((m) => m.html === '<h2>Swallow</h2>')) continue;
  for (const m of modules) {
    if (m.html?.includes('<li>Sleeps 4</li>')) {
      m.html = m.html.replace('<li>Sleeps 4</li>', '<li>Sleeps 5</li>');
      note('/accessibility-statement', 'Swallow shown as sleeping 5 (decision 5)');
    }
  }
}

// Checkpoint 3 decision 3: About page toggles give the same answers as the FAQ pages.
{
  const norm = (t) => t.toLowerCase().replace(/[^a-z]/g, '');
  for (const section of built.get('/about').sections) {
    for (const m of section.rows.flatMap((r) => r.columns.flatMap((c) => c.modules))) {
      if (m.type !== 'toggle') continue;
      const post = faqPosts.find((p) => norm(p.title) === norm(m.title));
      if (!post) {
        note('/about', `Toggle "${m.title}" kept as live: there is no FAQ page with this question`);
        continue;
      }
      if (post.html !== m.html) {
        m.html = post.html;
        note('/about', `Toggle "${m.title}" now gives the answer from ${post.url} (Checkpoint 3 decision 3)`);
      }
    }
  }
}

// og:image (agent/SEO.md). The page's own hero photo, which is the first
// background image the page shows: a cottage header, a hero or slider section,
// or failing those any section background. Pages with no photo at all (the FAQ
// and testimonial details, /calendar and /modern-slavery) fall back to the
// logo, which is the only mark the repo holds for them.
const SHARE_FALLBACK = { src: '/media/2020/11/cropped-bird.png', alt: 'Blaco Hill Farm Cottages' };
const heroImage = (doc) => {
  if (doc.cottage?.background?.image) return doc.cottage.background.image;
  for (const s of doc.sections ?? []) {
    if (s.kind === 'slider') {
      const slider = s.rows[0]?.columns[0]?.modules[0];
      if (slider?.slides?.[0]?.image) return slider.slides[0].image;
    }
    if (s.kind === 'hero' && s.background?.image) return s.background.image;
  }
  for (const s of doc.sections ?? []) if (s.background?.image) return s.background.image;
  return null;
};

for (const [url, doc] of built) {
  if (doc.template === 'cottage') doc.cottage = cottageParts(doc.sections, url);
  doc.description = DESCRIPTIONS[url];
  if (!doc.description) problems.push(`${url}: no approved description in agent/blaco_seo_descriptions.csv`);
  const share = heroImage(doc) ?? { ...SHARE_FALLBACK, ...dims[SHARE_FALLBACK.src] };
  doc.share = { src: share.src, width: share.width, height: share.height, alt: share.alt || SHARE_FALLBACK.alt };
  if (doc.template === 'faq-index') note(url, 'Lists the 16 FAQs only. The live Divi blog module also listed the first 4 testimonials.');
  const file = url === '/' ? 'home' : url.slice(1).replace(/\//g, '__');
  await writeFile(join(out, `${file}.json`), JSON.stringify(doc, null, 2));
  index.push({ url, file, template: doc.template, title: doc.title });
}

// Index lists: same order as the live blog modules (newest first).
const byDate = (a, b) => b.date.localeCompare(a.date);
await writeFile(join(repo, 'content', 'posts.json'), JSON.stringify({ faq: faqPosts.sort(byDate), testimonial: testimonialPosts.sort(byDate) }, null, 2));
await writeFile(join(repo, 'content', 'index.json'), JSON.stringify(index.sort((a, b) => a.url.localeCompare(b.url)), null, 2));
const uniq = [...new Map(changes.map((c) => [c.url + c.what, c])).values()];
await writeFile(join(repo, 'agent', 'extract', 'changes.json'), JSON.stringify(uniq, null, 2));

console.log(`pages: ${index.length}, faq: ${faqPosts.length}, testimonials: ${testimonialPosts.length}, changes: ${uniq.length}`);
if (problems.length) console.log('PROBLEMS\n' + problems.join('\n'));
