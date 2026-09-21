// Converts each live page's Divi markup into structured JSON (sections > rows >
// columns > modules) in agent/extract/content/<slug>.json, plus a readable
// outline in agent/extract/outline.md. Run after fetch-raw.mjs and extract-media.mjs.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'extract');
const outDir = join(root, 'content');
await mkdir(outDir, { recursive: true });

const urls = JSON.parse(await readFile(join(root, 'urls.json'), 'utf8'));
const library = JSON.parse(await readFile(join(root, 'api', 'media.json'), 'utf8'));
const libraryPaths = new Set(library.map((m) => new URL(m.source_url).pathname.replace('/wp-content/uploads/', '')));
const cssFiles = new Map();
for (const f of await readdir(join(root, 'css', 'pages'))) cssFiles.set(f, await readFile(join(root, 'css', 'pages', f), 'utf8'));

const UPLOAD = /^(?:https?:)?\/\/(?:dev\.)?blacohillcottages\.co\.uk\/wp-content\/uploads\/(.+)$/i;
const SITE = /^(?:https?:)?\/\/(?:dev\.)?blacohillcottages\.co\.uk(\/.*)?$/i;

// Checkpoint 2 decision 6: the 404ing background is replaced by the -scaled-1 copy.
const REPLACE = { '2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled.jpg': '2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled-1.jpg' };

export const localMedia = (url) => {
  const m = decodeURIComponent(url || '').match(UPLOAD);
  if (!m) return null;
  let p = m[1].split('?')[0];
  const stripped = p.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
  if (libraryPaths.has(stripped)) p = stripped;
  p = REPLACE[p] ?? p;
  return `/media/${p}`;
};

const localHref = (href) => {
  if (!href) return href;
  const media = localMedia(href);
  if (media) return media;
  const m = href.match(SITE);
  if (m) return (m[1] || '/').replace(/\/$/, '') || '/';
  return href;
};

// Clean module HTML: rewrite links and images, drop Divi attributes.
const cleanHtml = ($, el) => {
  const c = $(el).clone();
  c.find('script, style, noscript').remove();
  c.find('a').each((_, a) => {
    const $a = $(a);
    $a.attr('href', localHref($a.attr('href')));
  });
  c.find('img').each((_, img) => {
    const $i = $(img);
    const src = localMedia($i.attr('src'));
    $i.replaceWith(src ? `<img src="${src}" alt="${$i.attr('alt') ?? ''}">` : '');
  });
  c.find('*').each((_, n) => {
    for (const attr of Object.keys(n.attribs || {})) {
      if (!['href', 'src', 'alt', 'target', 'rel'].includes(attr)) $(n).removeAttr(attr);
    }
  });
  return (c.html() ?? "").replace(/\s+/g, ' ').replace(/<p>\s*<\/p>/g, '').trim();
};

const text = ($, el) => $(el).text().replace(/\s+/g, ' ').trim();

// Returns the full function call starting at index i, respecting nested brackets.
const balanced = (str, i) => {
  if (i < 0) return null;
  let depth = 0;
  for (let j = str.indexOf('(', i); j < str.length; j++) {
    if (str[j] === '(') depth++;
    if (str[j] === ')' && --depth === 0) return str.slice(i, j + 1);
  }
  return null;
};

const bgFromCss = (css, cls) => {
  const re = new RegExp(`\\.${cls}(?![0-9_])[^{}]*\\{[^}]*background-image:([^;}]+)`, 'g');
  const found = [];
  for (const m of css.matchAll(re)) {
    const urls = [...m[1].matchAll(/url\(([^)]+)\)/g)].map((u) => localMedia(u[1].replace(/["']/g, ''))).filter(Boolean);
    const gradient = balanced(m[1], m[1].search(/(linear|radial)-gradient\(/));
    found.push({ image: urls[0] ?? null, gradient });
  }
  return found[0] ?? null;
};

const KNOWN = ['text', 'image', 'blurb', 'button', 'toggle', 'accordion_item', 'testimonial', 'contact_form', 'number_counter', 'social_media_follow', 'map', 'gallery', 'fullwidth_slider', 'slider', 'divider', 'cta', 'fullwidth_header', 'code', 'video'];

const parseModule = ($, el) => {
  const $m = $(el);
  const cls = $m.attr('class') || '';
  const type = cls.includes('et_pb_button_module_wrapper') ? 'button' : cls.includes('et_pb_contact_form_container') ? 'contact_form' : cls.includes('et_pb_map_container') ? 'map' : cls.includes('et_pb_posts') ? 'posts' : cls.split(/\s+/).map((c) => c.replace(/^et_pb_/, '')).find((c) => KNOWN.includes(c)) ?? `unknown:${cls}`;
  const base = { type, id: (cls.match(/\bet_pb_[a-z_]+_\d+\b/) || [''])[0] };
  switch (type) {
    case 'text':
      return { ...base, html: cleanHtml($, $m.find('.et_pb_text_inner').first()) };
    case 'image': {
      const img = $m.find('img').first();
      const a = $m.find('a').first();
      return { ...base, src: localMedia(img.attr('src')), alt: img.attr('alt') ?? '', title: img.attr('title') ?? '', width: Number(img.attr('width')) || null, height: Number(img.attr('height')) || null, href: localHref(a.attr('href')) || null };
    }
    case 'blurb': {
      const img = $m.find('.et_pb_main_blurb_image img').first();
      const icon = $m.find('.et-pb-icon').first();
      const a = $m.find('.et_pb_module_header a, .et_pb_main_blurb_image a').first();
      return {
        ...base,
        title: text($, $m.find('.et_pb_module_header')),
        image: img.length ? { src: localMedia(img.attr('src')), alt: img.attr('alt') ?? '', width: Number(img.attr('width')) || null, height: Number(img.attr('height')) || null } : null,
        icon: icon.length ? icon.text().trim() : null,
        href: localHref(a.attr('href')) || null,
        html: cleanHtml($, $m.find('.et_pb_blurb_description').first()),
      };
    }
    case 'button': {
      const a = $m.is('a') ? $m : $m.find('a.et_pb_button').first();
      return { ...base, id: (a.attr('class')?.match(/\bet_pb_button_\d+\b/) || [''])[0], label: text($, a), href: localHref(a.attr('href')) };
    }
    case 'toggle':
    case 'accordion_item':
      return { ...base, title: text($, $m.find('.et_pb_toggle_title')), html: cleanHtml($, $m.find('.et_pb_toggle_content').first()) };
    case 'testimonial': {
      const portrait = $m.find('.et_pb_testimonial_portrait').attr('style')?.match(/url\(([^)]+)\)/)?.[1];
      return {
        ...base,
        author: text($, $m.find('.et_pb_testimonial_author')),
        meta: text($, $m.find('.et_pb_testimonial_meta')).replace(text($, $m.find('.et_pb_testimonial_author')), '').trim(),
        html: cleanHtml($, $m.find('.et_pb_testimonial_content').first()),
        portrait: localMedia(portrait),
      };
    }
    case 'contact_form':
      return {
        ...base,
        title: text($, $m.find('.et_pb_contact_main_title')),
        fields: $m.find('input, textarea, select').toArray().filter((f) => !['hidden', 'submit'].includes($(f).attr('type')) && !$(f).attr('name')?.includes('captcha')).map((f) => ({
          tag: f.tagName,
          name: $(f).attr('name'),
          type: $(f).attr('type') ?? null,
          label: $(f).attr('placeholder') || $(f).attr('data-original_title') || text($, $m.find(`label[for="${$(f).attr('id')}"]`)),
          required: $(f).attr('data-required_mark') === 'required' || $(f).is('[required]'),
          fieldType: $(f).attr('data-field_type') ?? null,
        })),
        captcha: $m.find('.et_pb_contact_captcha_question').length > 0,
        submit: text($, $m.find('button[type="submit"], .et_pb_contact_submit')),
        success: $m.find('.et-pb-contact-message').text().trim() || null,
        email: $m.attr('data-email') ?? null,
      };
    case 'number_counter':
      return { ...base, number: $m.attr('data-number-value') ?? '', title: text($, $m.find('.title')) };
    case 'social_media_follow':
      return { ...base, links: $m.find('a').toArray().map((a) => ({ href: $(a).attr('href'), label: $(a).attr('title') || text($, a) })).filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i) };
    case 'map':
      // The live pin coordinates are Divi's San Francisco default; the map centre is the farm.
      return { ...base, title: $m.find('.et_pb_map_pin').attr('data-title') ?? '', lat: $m.find('.et_pb_map').attr('data-center-lat'), lng: $m.find('.et_pb_map').attr('data-center-lng'), zoom: $m.find('.et_pb_map').attr('data-zoom') };
    case 'posts':
      return { ...base, posts: $m.find('article').toArray().map((a) => ({ title: text($, $(a).find('.entry-title')), href: localHref($(a).find('.entry-title a').attr('href')), category: ($(a).attr('class').match(/category-([a-z-]+)/) || [])[1] })) };
    case 'gallery':
      return { ...base, images: $m.find('.et_pb_gallery_item').toArray().map((it) => { const img = $(it).find('img'); return { src: localMedia($(it).find('a').attr('href') || img.attr('src')), alt: img.attr('alt') ?? '', title: text($, $(it).find('.et_pb_gallery_title')), caption: text($, $(it).find('.et_pb_gallery_caption')) }; }) };
    case 'fullwidth_slider':
    case 'slider':
      return { ...base, slides: $m.find('.et_pb_slide').toArray().map((s) => ({ id: ($(s).attr('class').match(/\bet_pb_slide_\d+\b/) || [''])[0], background: bgFromCss(CSS, ($(s).attr('class').match(/\bet_pb_slide_\d+\b/) || ['x'])[0]), title: text($, $(s).find('.et_pb_slide_title')), html: cleanHtml($, $(s).find('.et_pb_slide_content').first()), button: $(s).find('.et_pb_more_button').length ? { label: text($, $(s).find('.et_pb_more_button')), href: localHref($(s).find('.et_pb_more_button').attr('href')) } : null, image: localMedia($(s).find('.et_pb_slide_image img').attr('src')) })) };
    case 'divider':
      return base;
    default:
      return { ...base, unknown: true, text: text($, $m).slice(0, 300) };
  }
};

const outline = [];
let CSS = '';
const hiddenRe = (css, cls) => {
  const hides = [];
  for (const [q, label] of [['max-width:767px', 'phone'], ['min-width:768px) and (max-width:980px', 'tablet'], ['min-width:981px', 'desktop']]) {
    const re = new RegExp(`@media only screen and \\(${q.replace(/[()]/g, '\\$&')}\\)\\{[^@]*\\.${cls}(?![0-9_])[^{}]*\\{[^}]*display:none`);
    if (re.test(css)) hides.push(label);
  }
  return hides;
};

for (const { url, file } of urls) {
  const html = await readFile(join(root, 'raw', file), 'utf8');
  const $ = cheerio.load(html);
  const css = CSS = [...html.matchAll(/href=["']([^"']*et-cache[^"']*\.css)["']/g)].map((m) => cssFiles.get(m[1].split('/').pop()) ?? '').join('\n') + $('style').text();
  const title = $('title').text().trim();
  const page = { url, title, h1: text($, $('h1').first()), sections: [], post: null };

  // Post pages (FAQ and testimonials) use the classic single template.
  const article = $('#left-area article').first();
  if (article.length) {
    page.post = { title: text($, article.find('.entry-title')), date: text($, article.find('.post-meta .published')), html: cleanHtml($, article.find('.entry-content').first()) };
  }

  $('#et-main-area .et_pb_section').each((_, sec) => {
    const $s = $(sec);
    if ($s.parents('.et_pb_section').length || $s.closest('footer').length) return;
    const cls = ($s.attr('class').match(/\bet_pb_section_\d+\b/) || [''])[0];
    const parallax = $s.find('> .et_parallax_bg_wrap .et_parallax_bg').attr('style')?.match(/url\(([^)]+)\)/)?.[1];
    const section = {
      id: cls,
      label: null,
      background: bgFromCss(css, cls) ?? (parallax ? { image: localMedia(parallax), gradient: null } : null),
      hiddenOn: hiddenRe(css, cls),
      rows: [],
    };
    $s.find('.et_pb_row, .et_pb_row_inner').filter((_, r) => $(r).closest('.et_pb_section')[0] === sec && !$(r).find('.et_pb_row_inner').length).each((_, row) => {
      const rcls = ($(row).attr('class').match(/\bet_pb_row(?:_inner)?_\d+\b/) || [''])[0];
      const cols = $(row).find('> .et_pb_column').toArray().map((col) => ({
        size: ($(col).attr('class').match(/et_pb_column_(\d_\d)/) || [])[1] ?? null,
        modules: $(col).find('.et_pb_module').toArray().filter((m) => !$(m).parents('.et_pb_module').length).map((m) => ({ ...parseModule($, m), hiddenOn: hiddenRe(css, (($(m).attr('class') || '').match(/\bet_pb_[a-z_]+_\d+\b/) || ['x'])[0]) })),
      }));
      section.rows.push({ id: rcls, hiddenOn: hiddenRe(css, rcls), columns: cols });
    });
    // Fullwidth modules sit directly in the section.
    $s.find('> .et_pb_module').each((_, m) => section.rows.push({ id: 'fullwidth', hiddenOn: [], columns: [{ size: '4_4', modules: [parseModule($, m)] }] }));
    page.sections.push(section);
  });

  await writeFile(join(outDir, file.replace(/\.html$/, '.json')), JSON.stringify(page, null, 2));

  outline.push(`\n## ${url}  (${title})`);
  if (page.post) outline.push(`POST: ${page.post.title} | ${page.post.meta}\n${page.post.html.slice(0, 400)}`);
  for (const s of page.sections) {
    outline.push(`- ${s.id}${s.hiddenOn.length ? ` [hidden ${s.hiddenOn}]` : ''}${s.background ? ` bg=${s.background.image ?? ''} ${s.background.gradient ? 'gradient' : ''}` : ''}`);
    for (const r of s.rows) {
      outline.push(`  - ${r.id}${r.hiddenOn.length ? ` [hidden ${r.hiddenOn}]` : ''}`);
      for (const c of r.columns) {
        for (const m of c.modules) {
          const summary = m.html ? cheerio.load(m.html).text().replace(/\s+/g, ' ').slice(0, 160) : '';
          outline.push(`    - [${c.size}] ${m.type}${m.hiddenOn?.length ? ` [hidden ${m.hiddenOn}]` : ''}: ${[m.title, m.author, m.label, m.src, m.image?.src, m.icon ? `icon:${m.icon}` : '', m.href ? `-> ${m.href}` : '', m.number, summary, m.fields ? m.fields.map((f) => `${f.name}:${f.label}${f.required ? '*' : ''}`).join(', ') : '', m.links ? m.links.map((l) => l.href).join(' ') : '', m.slides ? JSON.stringify(m.slides).slice(0, 400) : '', m.images ? m.images.map((i) => i.src).join(' ') : '', m.unknown ? m.text : ''].filter(Boolean).join(' | ')}`);
        }
      }
    }
  }
}
await writeFile(join(root, 'outline.md'), outline.join('\n'));
console.log(`pages: ${urls.length}`);
