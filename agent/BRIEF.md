# Blaco Hill Cottages: Next.js Rebuild Brief

## 1. Purpose

Rebuild https://blacohillcottages.co.uk (WordPress) as a Next.js site deployed on Vercel.

The approach is fixed:

- **Content and structure are ported faithfully.** Every page, every piece of copy, every image, every link and every URL comes across from the live WordPress site.
- **Layout is built mobile-first.** Do not reproduce the current adaptive mobile view. Build each template for a 390px screen first, then enhance upward to desktop.
- Steve reviews and refines the mobile view page by page after the build. Your job is to hand him a clean, consistent, mobile-first base, not a finished design.

## 2. Source of truth

1. The live WordPress site is the source of truth for all content. It has already been updated with the content changes below. Do not re-apply them; verify they came through (section 9).
2. Extract content through the WordPress REST API (`/wp-json/wp/v2/pages`, `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/media`) and `/sitemap.xml` or `/wp-sitemap.xml`, not by scraping rendered HTML where the API is available.
3. Download all media into `public/` and reference it locally. Nothing may load from the old server, as it is being retired.
4. Never invent content. Where content is missing or needed from Steve, use a clearly named placeholder and log it (section 11).

## 3. Stack and house rules

- Repo: `github.com/federationdesign-design/blaco`. Vercel project: `blaco`.
- Next.js App Router, React 19, TypeScript, deployed on Vercel.
- CSS Modules only. No Tailwind, no styled-components, no inline style blocks.
- Relative imports only. Never the `@/` alias.
- No em dashes anywhere, in code comments, copy or docs.
- UK English throughout.
- `next/image` for all images, with correct width, height and alt text.
- The cookie consent system is ported from the LHM repo (`github.com/federationdesign-design/LHM`), which is already UK GDPR and PECR compliant. Do not build a new one.

**CSS Modules build trap:** a bare `:global(.foo)` selector with no local class passes the type-check but hard-fails the Vercel build. Always compound as `.localClass:global(.foo)`.

## 4. Phases and checkpoints

Stop at each checkpoint and report to Steve. Do not continue past a checkpoint until he approves.

**Phase 1: Inventory**
1. Crawl the site and produce `agent/INVENTORY.md`: every URL, its page title, meta description, template type, and the media it uses.
2. Group pages by template. Expected templates, to be confirmed by the crawl: home, cottage, FAQ index, FAQ detail, contact or enquiry, general content, policy, accessibility statement.
3. **Checkpoint 1:** Steve confirms the inventory and template list.

**Phase 2: Design system**
1. Extract the existing colours, fonts and logo from the live site into tokens in a single global CSS file.
2. Build the shared layout, header, mobile navigation and footer to the mobile rules in section 5.
3. **Checkpoint 2:** Steve reviews the shell at 390px and 1280px.

**Phase 3: Templates and content port**
1. Build each template mobile-first, then port every page into it.
2. Preserve every existing URL exactly, including each FAQ's own URL (for example `/do-you-have-wifi`).
3. Port page titles and meta descriptions as they are on the live site.
4. **Checkpoint 3:** content parity report (section 8) plus screenshots.

**Phase 4: New features**
1. Cookie banner and consent (section 6).
2. Enquiry forms via Resend (section 7).
3. Modern slavery page (section 6).
4. Single uniform PDF map (section 6).
5. `sitemap.ts` and `robots.ts`.
6. **Checkpoint 4:** full verification (section 8).

## 5. Mobile-first rules

These are starting defaults. Steve may change them at Checkpoint 2.

1. Base styles target 390px. Larger screens are added with `min-width` media queries only. Never `max-width`.
2. Breakpoints: 390px base, 768px, 1024px, 1440px.
3. Liquid type: headings and body scale with viewport width using `clamp()`. No fixed pixel font sizes.
4. Layout must hold from 360px up to 2800px wide, with no horizontal scrolling at any width.
5. Navigation: a sticky header with the logo and a menu button on mobile, opening a full-screen menu. A clear "Enquire" or "Call" action is always visible on mobile.
6. Phone numbers are `tel:` links and email addresses are `mailto:` links.
7. Touch targets are at least 44px by 44px.
8. Nothing depends on hover. Every interaction works by tap.
9. Images are full-bleed on mobile, and galleries are swipeable.
10. Cottage pages lead on mobile with the essentials: name, sleeps, key features, then the enquiry action, before long descriptions.
11. Vertical space between two stacked elements belongs to one of them, never both. Compute the existing gap before adding padding.

## 6. New content and features

**Cookie banner**
- Port the LHM consent system.
- Google Analytics 4, measurement ID `G-TN54HGV0ME`, must not load until the visitor accepts analytics cookies.
- The banner has a clear accept button and an equally clear reject option.

**Cookie policy and privacy (GDPR) policy**
- Port the existing pages as they are.
- Steve will supply updated wording. Mark both pages in `PLACEHOLDERS.md` as awaiting updated text. Do not write legal text.

**Modern slavery page**
- Create `/modern-slavery` using the general content template, linked from the footer.
- Content is `[MODERN_SLAVERY_TEXT]`, to be supplied by Steve.

**PDF map**
- Copy `~/Downloads/cottage map-cottage-2026.pdf` to `public/maps/cottage-map-2026.pdf` (renamed so the URL has no space).
- Replace every existing PDF map link with `/maps/cottage-map-2026.pdf`.
- Remove the old map PDFs from the build.

## 7. Forms

1. Recreate every existing form with the same fields.
2. Submissions go through a Next.js route handler using Resend.
3. Recipient: `victoria@blacohillcottages.co.uk`.
4. Environment variables: `RESEND_API_KEY` and `RESEND_FROM` (placeholder values only; Steve sets the real ones in Vercel).
5. Include server-side validation and a honeypot field for spam.
6. Show clear success and error states on the page.

## 8. Verification

Every checkpoint must pass all of these:

1. `./node_modules/.bin/tsc --noEmit` is clean. Use the repo binaries, not `npx`.
2. `npm run build` succeeds. A local failure caused only by Google Fonts being unreachable is not a code failure.
3. The `:global` audit: `grep -n ":global(\.[a-zA-Z-]*) *{" **/*.module.css` returns no bare selectors.
4. Playwright screenshots of every template at 390px and 1280px, saved to `agent/screenshots/`.
5. **Content parity:** a script compares the visible text of every page against the live WordPress page and writes `agent/PARITY.md`, listing any page where copy is missing or changed. Pixel parity is not required.
6. **URL parity:** every URL in `INVENTORY.md` returns a page in the new build.
7. No references remain to the old server's domain in any image, link or asset path.

## 9. Content changes to verify

These are already made on the live site. Confirm each appears in the port:

1. No mention of a DVD player on any cottage page.
2. Swallow Cottage sleeps 5.
3. No `enquiries@` address anywhere; all use `victoria@`.
4. FAQ: internet speeds.
5. FAQ: pets accepted in all cottages except Cuckoo.
6. FAQ: cancellations.
7. FAQ: refunds are discretionary.
8. FAQ: travel insurance advice.

## 10. Git

1. Work on a feature branch named `rebuild`. Never commit to `main`.
2. Commit incrementally with real messages.
3. Always `git add public/` when adding images or files, or they 404 on Vercel.
4. Run `git show --stat` before handing over. A small message with hundreds of deletions is a red flag.
5. Never push. Pushing and deploying are Steve's.

## 11. Placeholders and missing inputs

- Any missing input gets a clearly named placeholder, logged in `PLACEHOLDERS.md` at the repo root.
- Never invent content, prices, dates, legal text or asset paths.

Known placeholders at the start:

| Placeholder | Needed from Steve |
|---|---|
| `[MODERN_SLAVERY_TEXT]` | Modern slavery page content |
| Cookie and privacy policy text | Updated wording |
| `RESEND_API_KEY`, `RESEND_FROM` | Set in Vercel once Resend is configured |

## 12. Out of scope

Do not touch any of the following:

- Email migration from StackMail to Zoho.
- DNS and domain cutover.
- Google Search Console setup.
- Resend domain verification.
- Deployment to Vercel.
