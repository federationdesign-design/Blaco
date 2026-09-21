# Checkpoint 2: shell review

## Re-extraction (raw HTML, replaces the Phase 1 WebFetch reading)

- `agent/scripts/fetch-raw.mjs` fetches raw HTML of all 64 sitemap URLs (plus `/category/faq/page/2`) and the full REST collections: 32 pages, 28 posts, 3 categories, 183 media items (Phase 1 reported 177).
- `agent/scripts/extract-media.mjs` scans img src and srcset, data attributes, inline styles, `<style>` blocks and each page's Divi cache CSS. It strips WordPress size suffixes back to the original file, skips the dropped and redirected URLs, and skips `cottage-map-*.jpg` (decision 4). Output: `agent/extract/media-manifest.json`, with the media for each page.
- **107 files in use**, not about 95. The extra files are CSS section backgrounds and reviewer avatars that WebFetch could not see: `bed-and-breakfast-15/18/25.jpg`, `main-image-test.jpg`, `photo.jpg.png`, the five `Screenshot-2020-09-16-*.png` files (60px avatars in the Guest Reviews blocks), `landscape-e1600776204814.jpg` (home parallax), `TOWELS.jpg`, `table-football.jpg`, `Pheasant-etc.jpg`, `family.jpg`, a lion cub image, `2021/02` images and others. Phase 1 had marked several of these "apparently unused".
- `agent/scripts/download-media.mjs` downloaded 106 files (22 MB) to `public/media/<yyyy>/<mm>/<file>`, always from the live https host. One failed: see PLACEHOLDERS.md (it is broken on the live site too).
- Raw HTML and CSS are gitignored and can be recreated with the scripts. The API JSON and manifest are committed for Phase 3.

## Design tokens (`app/globals.css`)

From the Divi customiser and theme-builder CSS:

- Green `#00a86b` (accent), ink `#212121` (footer), mist `#f5f5f5`, lime `#7cda24`, grey `#b2b9c4`, Divi defaults `#333` headings and `#666` body.
- Baskervville for headings and body, Raleway bold for buttons, loaded via `next/font/google`.
- The two green overlay gradients used on live section backgrounds.
- Liquid type scale (`--step--1` to `--step-4`, all `clamp()`), spacing scale, gutter, 44px touch target.

## Shell

- Sticky header: logo, Call (icon at 390px, number from 768px), Enquire (to `/booking-request-form`), menu button.
- Below 1024px: full-screen menu opens under the header so Call and Enquire stay visible. It closes on Escape, on navigation and on resize to desktop. The rest of the page is inert while it is open.
- From 1024px: inline nav. Submenus open by tapping the chevron; hover also opens them for mouse users but is not required.
- Footer ported from the live theme-builder footer: main menu, white logo, strapline, info menu, legal menu, copyright.
- `/` is a temporary token preview page. It is replaced by the home template in Phase 3.

## Verification

- `tsc --noEmit` clean; `npm run build` succeeds; `:global` audit clean; no em dashes.
- `agent/scripts/screenshots.mjs`: no horizontal overflow at 360, 390, 768, 1024, 1280, 1440 or 2800px; every header and footer target is at least 44px; Escape closes the menu.
- Screenshots: `agent/screenshots/shell-390.png`, `shell-390-menu-open.png`, `shell-1280.png`, `shell-1280-submenu-open.png`.

## Decisions for Steve

1. **Green contrast.** `#00a86b` with white text is 3.1:1, which fails WCAG AA for normal text. Buttons, links and small green text use `--colour-green-dark` `#008454` (4.7:1). Brand green is kept for large text, rules and gradients. Keep this, or use the live green everywhere?
2. **Enquire target.** Points to `/booking-request-form`. Or `/contact-us`?
3. **Header search.** The live header has a WordPress search box. It was left out because there is no search in the new build. OK to drop?
4. **Mobile menu.** The repeated "About" and "All Cottages" child links are hidden (their parents are tappable links). The desktop dropdowns keep them as on live.
5. **Footer main menu** shows top-level links only (the live one has dropdowns). The footer has no phone or email, as on live. Add them?
6. **Missing background image** (PLACEHOLDERS.md): use `...-scaled-1.jpg`, or keep the gradient only as live shows it?
7. **Copyright year** stays "2020" as on live, unless you want it changed.
