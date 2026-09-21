# Checkpoint 5: liquid, full-width layout

> **Updated at Checkpoint 6.** Images may now be enlarged up to 1.25× (Checkpoint 5 decision 1). The section "Please look at this first" further down describes the earlier strict rule; the table at the end reflects the new limit. See `agent/CHECKPOINT-6.md`.

Recorded in `agent/DECISIONS.md` (Checkpoint 4, "Liquid, full-width layout"). It overrides every earlier max-width rule. Also recorded: "Modern Slavery Statement" is kept, and the About page FAQs stay as they are.

## What changed

1. **No width caps.** The build never had an 1100px cap. The caps it did have are all removed: the 80rem (1280px) container on the header, footer, sections, hero, cottage intro and 404 page; the 68ch text measure; the 48rem forms and form messages; the 40ch footer strapline; the 30rem footer rules; and the 45rem cookie panel, which is now 60% of the viewport from 1024px. Nothing in `app/` sets a `max-width` other than the global `img { max-width: 100% }` that stops overflow.
2. **Gutters** are `clamp(1rem, 0.4429rem + 2.286vw, 2.5rem)`: 16px at 390px, 40px at 1440px, and above that they grow with the root size (78px at 2800px). No fixed pixels.
3. **Type keeps growing to 2800px.** Each step of the scale now rises linearly from 390px to 1440px, so none stops early. Above 1440px the root font size is `max(100%, 1.1111vw)`, so every rem-based size (type, spacing, gutters, header, logos, icons) scales in proportion to the viewport. Layout at 1440px and below is unchanged from Checkpoint 4. Measured on a cottage page:

| Viewport | 390 | 768 | 1024 | 1280 | 1440 | 1600 | 1920 | 2240 | 2560 | 2800 |
|---|---|---|---|---|---|---|---|---|---|---|
| Body text (px) | 16.0 | 16.7 | 17.2 | 17.7 | 18.0 | 20.0 | 24.0 | 28.0 | 32.0 | 35.0 |
| Page heading (px) | 33.1 | 39.2 | 43.3 | 47.4 | 50.0 | 55.6 | 66.7 | 77.8 | 88.9 | 97.2 |

4. **Images scale with the width.** Backgrounds, hero slides and the site map are full width. Galleries and cards are a third of the width from 1024px. Content images take their column's share. Every `next/image` `sizes` attribute now describes this with no upper limit: content images get theirs from the column width (`app/lib/image-fit.ts`, `columnSizes`). Image widths up to 2800px (and 3840px) are available (`next.config.ts`). Measured on a gallery: the file served is always at least as wide as its box, from 384px files at 390px up to 1080px files for the 871px boxes at 2800px.
5. **No image is stretched into blur.** `agent/scripts/image-fit.mjs` renders every page at 390, 768, 1024, 1280, 1440, 1600, 1920, 2240, 2560 and 2800px. For each image in each role, it finds the width from which the original would have to be enlarged, and writes that to `content/image-fit.json`.
   - From that width the image is served as its original file and shown at its natural size, centred, instead of being scaled up. Content images keep their natural width, and cropped or background images use `object-fit: none` (`app/globals.css`).
   - The layout check now fails if any image renders larger than its original at 1280, 1920 or 2800px on any page. It passes.
   - The images affected are listed below.
6. **Column counts are unchanged.** Cards, galleries and reviews are 1 / 2 / 3 per row at 390 / 768 / 1024px and above, as before. They grow rather than multiply.

## Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm run build` | Succeeds, 59 pages |
| `:global` audit, em dashes, `max-width` media queries, width caps | All clean |
| Content parity (`agent/PARITY.md`) | 58 live pages, 0 unexplained differences |
| URL parity | 68 URLs pass (61 pages, 7 redirects) |
| Phase 4 checks | 16 of 16 pass |
| Layout checks | Every page at 360, 390, 1280, 1920 and 2800px: no horizontal overflow, no tap target under 44px, no image enlarged beyond its original |
| Old domain | None |

**Screenshots** (`agent/screenshots/`): every template at 390, 1280 and 2800px (`home`, `cottage`, `cottage-swallow`, `listing`, `faq-index`, `testimonial-index`, `post-faq`, `post-testimonial`, `contact`, `enquiry-form`, `general`, `general-gallery`, `policy`, `accessibility`, `modern-slavery`). Also the cookie banner, the preferences panel, the form states and the open mobile menu. The 2800px shots are 70% JPEG to keep the repo size down.

## Please look at this first

Following rule 5 strictly means a small image stops filling its box once it would need enlarging. Four hero images do this **below 1440px**, so on ordinary laptops they appear at natural size with blank space around them rather than slightly enlarged:

- `2020/10/wren-exterior.jpg` (1000×700): Wren hero, from 768px.
- `2021/02/blaco-hill-farm.jpg` (1024×768): the first home slide, from 1024px.
- `2020/08/blaco-hill-farm.jpg` (1024×768): the About and Contact heroes, from 1024px.
- `2025/05/Partridge-new-image.jpg` (1512×915): Partridge hero, from 1440px.

The rest hold until 1600px or wider (see the "from" column). If you would rather allow slight enlargement (for example up to 1.25×) before the natural-size fallback kicks in, it is one number (`TOLERANCE`) in `agent/scripts/image-fit.mjs`, followed by a re-run. Supplying larger originals fixes it outright: replace the file at the same path, then re-run `media-dimensions.mjs` and `image-fit.mjs`.

**Line length.** With no text measure, full-width text blocks (for example the policy pages, the accessibility statement and post pages) run the whole width. Because type scales with the viewport, the number of characters per line stays roughly constant from 1440px up, at an estimated 150 to 170 on full-width blocks (from the average character width of Baskervville). Text in columns is shorter.

## Images smaller than their display size at 2800px

59 files, 62 uses (one file can appear in more than one role). Updated for the 1.25× limit and the home page decisions: the 3 home hero slides always fill the full width and are enlarged as needed, so they most need larger originals; 25 other uses are enlarged by no more than 1.25× and fill their box; 34 would need more, so they fill their box up to the width shown and appear at natural size above it. "Original needed" is the smallest size, at the same proportions, that fills the box at 2800px (hero measured at a 1000px tall window) without any enlargement; supply at least this, ideally double for high-density screens. Sorted by how much enlargement they would need.

| Image (under `public/media/`) | Original | Used as | Box at 2800px | Enlargement needed at 2800px | How it shows now | Original needed | Pages |
|---|---|---|---|---|---|---|---|
| `2020/10/wren-exterior.jpg` | 1000×700 | Section or hero background | 2800×933 | 2.8× | Fills up to 1152px, natural size above | 2800×1960 | `/our-cottages/wren` |
| `2021/02/blaco-hill-farm.jpg` | 1024×768 | Home hero slide | 2800×800 | 2.73× | Always fills the hero, enlarged up to 2.73× (exempt, home page decision 1) | 2796×2097 | `/` |
| `2020/08/blaco-hill-farm.jpg` | 1024×768 | Section or hero background | 2800×933 | 2.73× | Fills up to 1280px, natural size above | 2796×2097 | `/contact-us` |
| `2025/05/Partridge-new-image.jpg` | 1512×915 | Section or hero background | 2800×933 | 1.85× | Fills up to 1760px, natural size above | 2798×1693 | `/our-cottages/partridge` |
| `2020/09/badger.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/lion-small.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/paintball.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/horseracing.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/waterpark.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/10/archery-target.jpg` | 500×333 | Content image | 788×525 | 1.58× | Fills up to 2080px, natural size above | 790×527 | `/about/local-interests` |
| `2020/09/golf.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/aqua-park.jpg` | 500×335 | Content image | 788×528 | 1.58× | Fills up to 2080px, natural size above | 790×530 | `/about/local-interests` |
| `2020/09/arrive.jpg` | 500×327 | Content image | 788×515 | 1.58× | Fills up to 2080px, natural size above | 790×517 | `/checking-in-checkout-process` |
| `2020/09/leave.jpg` | 500×333 | Content image | 788×525 | 1.58× | Fills up to 2080px, natural size above | 790×527 | `/checking-in-checkout-process` |
| `2020/09/literature.jpg` | 500×333 | Content image | 788×525 | 1.58× | Fills up to 2080px, natural size above | 790×527 | `/checking-in-checkout-process` |
| `2020/09/landscape-e1600776204814.jpg` | 1795×1190 | Section or hero background | 2800×1699 | 1.56× | Fills up to 2240px, natural size above | 2801×1857 | `/` |
| `2020/08/main-image-test.jpg` | 1800×885 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1381 | `/about` |
| `2020/09/TOWELS.jpg` | 1800×1200 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1872 | `/about/faq` |
| `2020/09/table-football.jpg` | 1800×1200 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1872 | `/about/games-room` |
| `2020/08/family.jpg` | 1800×1200 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1872 | `/about/testimonials` |
| `2020/09/swallow-master.jpg` | 1800×1032 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1610 | `/for-four-people`, `/for-six-people`, `/for-two-people` and 2 more |
| `2020/09/Chaffinch-bath.jpg` | 805×1000 | Content image | 1252×1556 | 1.56× | Fills up to 2240px, natural size above | 1256×1560 | `/for-four-people`, `/for-six-people`, `/for-two-people`, `/our-cottages` |
| `2020/09/Chaffinch-lounge.jpg` | 1800×1038 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1620 | `/our-cottages/chaffinch-2` |
| `2020/09/Cuckoo-lounge-flipped.jpg` | 1800×1038 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1620 | `/our-cottages/cuckoo` |
| `2020/09/Pheasant-etc.jpg` | 1800×1078 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1682 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/nightingale.jpg` | 1800×1035 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1615 | `/our-cottages/nightingale` |
| `2020/10/skylark-main-1.jpg` | 1800×1038 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1620 | `/our-cottages/skylark` |
| `2020/09/swift-kitchen.jpg` | 1800×1038 | Section or hero background | 2800×933 | 1.56× | Fills up to 2240px, natural size above | 2808×1620 | `/our-cottages/swift` |
| `2020/08/bed-and-breakfast-15.jpg` | 1920×1441 | Section or hero background | 2800×593 | 1.46× | Fills up to 2400px, natural size above | 2804×2104 | `/`, `/about/faq`, `/about/games-room` and 23 more |
| `2020/08/bed-and-breakfast-18.jpg` | 1920×1329 | Section or hero background | 2800×578 | 1.46× | Fills up to 2400px, natural size above | 2804×1941 | `/about` |
| `2020/08/bed-and-breakfast-25.jpg` | 1920×970 | Section or hero background | 2800×587 | 1.46× | Fills up to 2400px, natural size above | 2804×1417 | `/about` |
| `2025/05/IMG_0222.jpg` | 690×1000 | Gallery photo | 871×653 | 1.26× | Fills up to 2720px, natural size above | 870×1260 | `/our-cottages/partridge` |
| `2020/09/swift-entrance.jpg` | 1000×655 | Content image | 1252×820 | 1.25× | Fills up to 2720px, natural size above | 1250×819 | `/accessibility-statement` |
| `2020/09/Cuckoo-entrance.jpg` | 1000×632 | Content image | 1252×791 | 1.25× | Fills up to 2720px, natural size above | 1250×790 | `/accessibility-statement` |
| `2020/09/Pheasant-exterior2.jpg` | 1000×628 | Content image | 1252×786 | 1.25× | Fills up to 2720px, natural size above | 1250×785 | `/accessibility-statement` |
| `2020/08/blaco-hill-farm.jpg` | 1024×768 | Content image | 1252×939 | 1.22× | Enlarged 1.22× (within the limit) | 1250×937 | `/` |
| `2025/05/IMG_0227.jpg` | 750×1000 | Gallery photo | 871×653 | 1.16× | Enlarged 1.16× (within the limit) | 870×1160 | `/our-cottages/partridge` |
| `2025/05/IMG_0225.jpg` | 750×1000 | Gallery photo | 871×653 | 1.16× | Enlarged 1.16× (within the limit) | 870×1160 | `/our-cottages/partridge` |
| `2025/05/IMG_0226.jpg` | 750×1000 | Gallery photo | 871×653 | 1.16× | Enlarged 1.16× (within the limit) | 870×1160 | `/our-cottages/partridge` |
| `2025/05/IMG_0224.jpg` | 750×1000 | Gallery photo | 871×653 | 1.16× | Enlarged 1.16× (within the limit) | 870×1160 | `/our-cottages/partridge` |
| `2020/10/skylark-bath.jpg` | 750×1000 | Gallery photo | 871×653 | 1.16× | Enlarged 1.16× (within the limit) | 870×1160 | `/our-cottages/skylark` |
| `2021/02/IMG_4081-scaled.jpg` | 2560×1920 | Home hero slide | 2800×800 | 1.09× | Always fills the hero, enlarged up to 1.09× (exempt, home page decision 1) | 2791×2093 | `/` |
| `2021/02/IMG_8747-scaled.jpg` | 2560×1920 | Home hero slide | 2800×800 | 1.09× | Always fills the hero, enlarged up to 1.09× (exempt, home page decision 1) | 2791×2093 | `/` |
| `2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled-1.jpg` | 2560×1707 | Section or hero background | 2800×1435 | 1.09× | Enlarged 1.09× (within the limit) | 2791×1861 | `/`, `/ask-us-a-question`, `/booking-request-form` and 11 more |
| `2020/09/a-lion-cub-panthera-leo-lies-on-the-ground-and-loo-L9RVWV8-scaled-1.jpg` | 2560×1707 | Section or hero background | 2800×933 | 1.09× | Enlarged 1.09× (within the limit) | 2791×1861 | `/about/local-interests` |
| `2020/09/Pheasant-kitchen.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-master1.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-twin.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-dining.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-lounge.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-exterior2.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-twin2.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Pheasant-lounge2.jpg` | 1000×628 | Gallery photo | 871×653 | 1.04× | Enlarged 1.04× (within the limit) | 1040×654 | `/our-cottages/grey-goose`, `/our-cottages/mallard`, `/our-cottages/woodcock` |
| `2020/09/Chaffinch-master.jpg` | 1000×636 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×656 | `/our-cottages/chaffinch-2` |
| `2020/09/Chaffinch-kitchen2.jpg` | 1000×636 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×656 | `/our-cottages/chaffinch-2` |
| `2020/09/Chaffinch-twin.jpg` | 1000×636 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×656 | `/our-cottages/chaffinch-2` |
| `2020/09/Chaffinch-dining.jpg` | 1000×636 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×656 | `/our-cottages/chaffinch-2` |
| `2020/09/Cuckoo-entrance.jpg` | 1000×632 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×651 | `/our-cottages/cuckoo` |
| `2020/09/Cuckoo-bathroom.jpg` | 1000×632 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×651 | `/our-cottages/cuckoo` |
| `2020/09/Cuckoo-master.jpg` | 1000×632 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×651 | `/our-cottages/cuckoo` |
| `2020/09/Cuckoo-lounge2.jpg` | 1000×632 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×651 | `/our-cottages/cuckoo` |
| `2020/10/wren-master.jpg` | 1000×632 | Gallery photo | 871×653 | 1.03× | Enlarged 1.03× (within the limit) | 1030×651 | `/our-cottages/wren` |
