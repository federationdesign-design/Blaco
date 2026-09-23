# SEO readiness report

Branch `rebuild`. First measured at commit `b9e8b12` on 2026-09-22, then
remeasured after the fixes in "What was applied" below. Measured by parsing the
prerendered HTML in `.next/server/app/` after a clean `npm run build`
(`tsc --noEmit` clean, 59 pages), together with the generated `robots.txt` and
`sitemap.xml`. Nothing here is inferred from source alone: every title,
canonical and heading below was read out of the built page.

It lists what is missing and, in "What was applied", what has since been
fixed. No meta descriptions or Open Graph copy are written here: those are
Steve's to supply (brief 11).

## Summary

| Check | Result |
|---|---|
| Pages built | 60, matching `content/index.json` and the sitemap |
| Titles | Present on all 60, all unique. 3 over 60 characters |
| Meta descriptions | All 60, the approved wording, used exactly as written |
| Canonical URLs | Present and correct on all 60 |
| H1 | Present on all 60, exactly one each, all distinct |
| Open Graph | All 60: title, description, url, type, site_name, locale, image |
| Twitter cards | All 60, `summary_large_image` |
| Structured data | `LodgingBusiness` sitewide, `FAQPage` on the 18 FAQ pages (the index and 17 questions) |
| `sitemap.ts` | 60 URLs, live domain, no redirected or missing URLs |
| `robots.ts` | Correct, live domain, sitemap declared |
| `noindex` | None. No page carries a robots meta tag |
| GA4 | Fires only after analytics consent (verified) |
| `lang` | `en-GB` on every page |
| Favicon | `/media/2020/11/cropped-bird.png`, plus apple-touch-icon |

## What was applied

Two rounds of changes on 2026-09-22, both re-audited against the rebuilt site.

### Round 1

1. **The three pages with no H1 now have one.** `/calendar`'s "Cottage
   Availability" H2 became an H1; on `/ask-us-a-question` and
   `/booking-request-form` the form title is now the H1. No wording changed,
   and `.formTitle` sets the size, so nothing looks different.
2. **Structured data added.** `LodgingBusiness` in `app/layout.tsx`, so every
   page carries it, and `FAQPage` on `/about/faq` (all 16 questions) and on
   each of the 16 FAQ detail pages. Built only from `app/lib/site.ts`, the
   ported contact and privacy pages and `content/posts.json`. No ratings: the
   ported testimonials carry none.
3. **The 14 long titles were shortened** and `/about` and `/our-cottages` no
   longer shared an H1.
4. **`lastmod` stays out of the sitemap.**

### Round 2: the brand suffix, and the live wording back

Round 1 shortened the titles by rewriting them, because the brand suffix
` | Blaco Hill Farm Cottages` spent 27 of the ~60 characters Google shows.
Steve's fix was better: shorten the suffix instead.

1. **The suffix is now ` | Blaco Hill`** (`TITLE_SUFFIX` in `app/lib/site.ts`,
   used by the title template in `app/layout.tsx`). That is 13 characters
   rather than 27, which buys back 14 on every page. The live site's own
   suffix is unchanged in `build-content.mjs`, where it is used to strip the
   suffix off the extracted titles.
2. **Every title is the live wording again.** The seven testimonial titles have
   their reviewer's handle back, and the four paraphrased FAQ titles ask the
   guest's own question again. The rewrite list is gone entirely: with the
   short suffix nothing needed overriding, so `build-content.mjs` no longer
   carries one.
3. **`/our-cottages` H1 is now "Our Eleven Cottages"**, replacing the bare
   brand name. Eleven is the count the About page already gives.

**A correction.** My Round 1 note said six testimonial titles had lost their
handle. It was seven: `/wonderful-country-views-in-cosy-newly-converted-barns`
was also in the list and I missed it when writing the summary. All seven are
restored.

**Three titles still run past 60 characters**, all in the live wording, which
is the trade Steve chose:

| URL | Length | Title |
|---|---|---|
| `/what-time-can-i-check-in-...-on-my-departure` | 115 | What time can I check in on arrival and what time do I have to vacate the property by on my departure? \| Blaco Hill |
| `/wonderful-country-views-in-cosy-newly-converted-barns` | 81 | Wonderful country views in cosy newly converted barns – Sue and John \| Blaco Hill |
| `/i-am-disabled-are-your-properties-suitable-for-me` | 64 | I am disabled. Are your properties suitable for me? \| Blaco Hill |

Google will truncate these in the result, so the brand falls off the end and,
on the first one, most of the question with it. Nothing breaks: the full title
still reaches the browser tab, the share preview and the crawler. The other 11
of the original 14 now fit.

The heading and title changes are made in `agent/scripts/build-content.mjs`,
not in the generated JSON, and each one is logged to
`agent/extract/changes.json` so the parity report counts it as intended.

Verified after both rounds: `tsc --noEmit` clean, `npm run build` succeeds (59
pages), content parity 0 unexplained differences across 58 live pages, URL
parity 68 of 68, all 16 Phase 4 checks pass, `:global` audit clean.

### Round 3: descriptions, Open Graph and Twitter

1. **Steve's approved descriptions are in**, from
   `agent/blaco_seo_descriptions.csv`, as both the meta description and
   `og:description`. They are used **exactly as written**: the build script
   reads the CSV and never edits or generates a word, and the audit compares
   every rendered description against the CSV and fails on any difference. The
   file covers all 59 URLs, none empty, none over 160 characters.
2. **Open Graph and Twitter on every page.** `og:title` is the whole document
   title, suffix included, so a shared link reads the same as the browser tab.
   `og:url` is the canonical. `og:type` is `website`, `og:site_name` is
   "Blaco Hill Farm Cottages", and `og:locale` is `en_GB` (not asked for, but
   free and correct). `twitter:card` is `summary_large_image`.
3. **`og:image` is the page's own hero photo**, absolute on the live domain,
   with `og:image:width` and `og:image:height` set. The audit checks the file
   actually exists in `public/`, so no preview points at a 404.
4. **One more title shortened.** `/what-time-can-i-check-in-...` is
   "Check-in and checkout times | Blaco Hill" in the title tag. Its H1 still
   asks the guest's full question. The other two long titles are left alone.

All of this is built in one place, `app/lib/metadata.ts`, so a page's title,
canonical, description and social tags cannot drift apart.

### The share image on 30 pages

Half the site has no photo of its own: the 28 FAQ and testimonial detail pages,
`/calendar` and `/modern-slavery`. Those fall back to the logo, as Steve asked.

**This needs a decision before launch.** The only raster logo in the repo is
`/media/2020/11/cropped-bird.png`, the 512x512 bird mark used as the site icon.
The other two logo files are SVGs, and an SVG `og:image` renders in nothing:
not Facebook, X, LinkedIn, WhatsApp or iMessage. So the bird is the only
working choice, and it is what those 30 pages use.

It works, but it is not good. At 512x512 it is square, while
`summary_large_image` wants roughly 1.91:1, so it is cropped top and bottom and
shown small. Every FAQ and every guest review shared on WhatsApp gets the same
cropped bird.

Two ways out, neither invented here:

- **A proper share image**, 1200x630, made from an existing farm photo. One
  file, used on the 30 pages with no hero of their own.
- **Or give the detail pages a photo**, so a shared FAQ shows the farm rather
  than a mark.

Until then the tags are correct and complete, and nothing is broken.

### Round 4: client changes (2026-09-23)

Recorded in `agent/DECISIONS.md` under "Client changes after launch".

1. **New FAQ** at `/can-we-all-eat-together-if-we-book-the-whole-site`, on the
   FAQ detail template, listed first on `/about/faq` (newest first, like the
   others), in the sitemap, and in both `FAQPage` blocks: its own page and the
   index, which now carries 17 questions. The question and answer are the
   client's wording. Its description was written in the style of the others and
   added to `agent/blaco_seo_descriptions.csv`. Like the other FAQ pages it has
   no photo, so its `og:image` is the bird logo (now 31 pages).
2. **Its title is 63 characters** with the suffix, so it joins the two titles
   that run past 60. It keeps the full question, as the other FAQ titles do.
3. **"For six people" is now "For five or six people"** in the menu, the
   listing page's title and its H1. The URL stays `/for-six-people`. Its
   description said "sleeping six", which stopped being true when Swallow
   (sleeps five) joined the page, so it now says "sleeping five or six". That
   is the only change to an existing approved description.

Verified: `tsc --noEmit` clean, `npm run build` succeeds (60 pages), SEO audit
clean apart from the three long titles, content parity 0 unexplained
differences across 58 live pages, URL parity 69 of 69, all Phase 4 checks
pass, `:global` audit clean.

### Round 5: modern slavery statement (2026-09-23)

`/modern-slavery` now shows the statement from
`agent/blaco_modern_slavery_statement.md` in place of `[MODERN_SLAVERY_TEXT]`,
on the general content template with the policy pages' reading measure. Its
four approval details (`[FINANCIAL_YEAR_END]`, `[NAME]`, `[POSITION]`,
`[DATE]`) stay in square brackets until the client supplies them. Its
description in `agent/blaco_seo_descriptions.csv` is new: "How Blaco Hill Farm
Cottages works to prevent modern slavery and human trafficking in our business
and supply chain, and how to raise a concern." The page still has no photo, so
its `og:image` is the logo.

## Item by item

Where each of the original seven findings stands.

### 1. Fixed: meta descriptions

All 59 carry Steve's approved wording, verified against the CSV on every audit
run.

### 2. Fixed: Open Graph and Twitter tags

All 59 carry the full set. The one open question is the share image on the 30
pages with no hero, above.

### 3. Fixed: the three pages with no H1

`/ask-us-a-question`, `/booking-request-form` and `/calendar` each have one
now, in the live wording. Nothing left to do.

### 4. Three cottage H1s do not name the cottage

| URL | Title | H1 |
|---|---|---|
| `/our-cottages/grey-goose` | Greygoose | Old Cart Shed D |
| `/our-cottages/mallard` | Mallard | Old Cart Shed C |
| `/our-cottages/woodcock` | Woodcock | Old Cart Shed E |

Ported exactly as live has them (`content/pages/our-cottages__*.json`). The
other eight cottages use their own name. Someone searching "Greygoose cottage
Mattersey" lands on a page whose only H1 says "Old Cart Shed D".

**Needed from Steve:** whether these are the intended names. I have not changed
them.

### 5. Partly fixed: structured data

`LodgingBusiness` and `FAQPage` are in. Not added, and worth considering later:

- `Review` on the 12 testimonial pages. Held back only because **no star
  ratings exist** and I will not invent them. Schema.org allows a review with
  no rating, so this can go in whenever you want it.
- Per-cottage `Accommodation` or `LodgingBusiness` markup, with sleeps and
  amenities. The data is already in the cottage JSON.

### 6. Fixed: titles over 60 characters

The shorter brand suffix brought 11 of the 14 under the limit in their own live
wording, and `/what-time-can-i-check-in-...` is now "Check-in and checkout
times". Two remain over, both keeping the live wording on purpose:
`/wonderful-country-views-in-cosy-newly-converted-barns` at 81 and
`/i-am-disabled-are-your-properties-suitable-for-me` at 64.

### 7. Fixed: the two identical H1s

`/about` is "About Blaco Hill Farm Cottages" and `/our-cottages` is "Our Eleven
Cottages". All 59 H1s are now distinct.

## Confirmations you asked for

### GA4 fires only after consent: confirmed

The measurement ID now comes from `NEXT_PUBLIC_GA_ID` rather than being written
into the code, so preview and local builds no longer report into the live
property. The consent gating is unchanged, and was re-verified with the ID both
set and unset.

Verified four ways:

1. `app/components/cookies/Analytics.tsx` returns `null` when
   `consent?.analytics` is not true. The `<Script>` tags are not rendered at
   all, rather than rendered and held back, so no request to
   `googletagmanager.com` is made and no GA cookie is set before opt-in.
2. A second guard returns `null` when `NEXT_PUBLIC_GA_ID` is unset, so a build
   with no ID loads no analytics at all. It sits after the consent check, so it
   can only ever withhold analytics, never grant them.
3. Consent starts as `null` and is only read from `localStorage` after mount
   (`CookieConsentProvider.tsx`), so the first paint is always unconsented.
   `null` is treated as "not chosen", not as consent, and the banner shows.
4. Built both ways and run against each build. With the ID set, GA loads only
   after Accept all and never before or after Reject all. With it unset, GA
   never loads at all. The ID is never in the served HTML in either build,
   because nothing renders until the visitor consents; when set, it is inlined
   into one client chunk.

`agent/scripts/phase4-checks.mjs` detects whether the build under test has an
ID by looking in the client bundle, not by reading its own environment, and
asserts the right thing either way. So the check cannot quietly pass because a
variable happened to be missing.

Withdrawing consent also calls `clearAnalyticsCookies()`, which expires `_ga`,
`_ga_*`, `_gid` and `_gat*` on the host and the registrable domain rather than
waiting them out. Reject is presented as an equal action to accept, per brief 6.

### The sitemap uses the live domain: confirmed

The domain is declared once, as `SITE_URL` in `app/lib/site.ts`. `sitemap.ts`,
`robots.ts`, `layout.tsx` (`metadataBase`), `metadata.ts` and
`StructuredData.tsx` all import it, so they cannot drift apart. Every one of the
59 `<loc>` values is on that origin. No `vercel.app` preview URL, no
`dev.blacohillcottages.co.uk`, no `localhost`, and no `http://` entry. Both the
canonical tags and `metadataBase` in `app/layout.tsx` use the same origin, so
they agree.

### sitemap.ts and robots.ts list the right URLs: confirmed

- The sitemap's 59 URLs are exactly the 59 entries in `content/index.json`,
  which are exactly the 59 pages the build prerendered. Nothing is listed that
  does not exist, and no built page is left out.
- The seven redirect sources in `next.config.ts` (`/category/faq`,
  `/category/faq/page/:page`, `/category/testimonial`,
  `/category/uncategorized`, `/sample-page`, `/booking-test`,
  `/our-cottages/chaffinch`) are correctly absent.
- `robots.txt` allows everything, disallows `/api/`, and declares the sitemap
  at the live domain.

Two things the sitemap does not carry, both optional:

- **No `lastmod`.** `sitemap.ts` sets `changeFrequency` and `priority` but no
  `lastModified`. Google ignores the first two and does use `lastmod`. The
  content JSON has a `date` on posts but not on pages, so there is no honest
  value for most URLs. Better left out than faked.
- The home page is listed as `https://blacohillcottages.co.uk` with no trailing
  slash, matching its own canonical. Consistent, so harmless.

## Every page

Every page also carries its approved description as both the meta description
and `og:description`, `og:title` equal to the title, `og:url` equal to the
canonical, `og:type` `website`, `og:site_name`, `og:locale` `en_GB` and
`twitter:card` `summary_large_image`, so those columns are omitted rather than
repeated 59 times. The canonical is the live domain plus the URL in column one.
No page carries a robots meta tag, so nothing is `noindex`. Titles use the
`%s | Blaco Hill` template from `app/layout.tsx`, except the home page, which
keeps its own absolute live title.

`og:image` is shown relative for width; each one ships as an absolute URL on
`https://blacohillcottages.co.uk` with its width and height.

| URL | Template | Title | H1 | og:image | Structured data |
|---|---|---|---|---|---|
| `/` | home | Blaco Hill Farm Cottages \| Holiday Rentals | A warm welcome from Victoria and Thomas | `/media/2021/02/blaco-hill-farm.jpg` | LodgingBusiness |
| `/about` | general | About \| Blaco Hill | About Blaco Hill Farm Cottages | `/media/2020/08/main-image-test.jpg` | LodgingBusiness |
| `/about/faq` | faq-index | FAQ \| Blaco Hill | Questions | `/media/2020/09/TOWELS.jpg` | LodgingBusiness, FAQPage |
| `/about/games-room` | general | Games Room \| Blaco Hill | The Games Room | `/media/2020/09/table-football.jpg` | LodgingBusiness |
| `/about/local-interests` | general | Local Interests \| Blaco Hill | Local Attractions | `/media/2020/09/a-lion-cub-panthera-leo-lies-on-the-ground-and-loo-L9RVWV8-scaled-1.jpg` | LodgingBusiness |
| `/about/testimonials` | testimonial-index | Testimonials \| Blaco Hill | Testimonials | `/media/2020/08/family.jpg` | LodgingBusiness |
| `/accessibility-statement` | accessibility | Accessibility Statement \| Blaco Hill | Access statement for Blaco Hill Farm Cottages | `/media/2020/08/bed-and-breakfast-15.jpg` | LodgingBusiness |
| `/amazing-family-get-together` | post | Amazing family get together – Charris-ment \| Blaco Hill | Amazing family get together – Charris-ment | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/are-longer-term-lets-available` | post | Are longer-term lets available? \| Blaco Hill | Are longer-term lets available? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/are-these-holiday-lets-suitable-for-families` | post | Are these holiday lets suitable for families? \| Blaco Hill | Are these holiday lets suitable for families? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/are-towels-and-linen-provided` | post | Are towels and linen provided? \| Blaco Hill | Are towels and linen provided? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/are-your-cottages-child-friendly` | post | Are your cottages child friendly? \| Blaco Hill | Are your cottages child friendly? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/ask-us-a-question` | contact | Ask us a question \| Blaco Hill | Ask us a Question | `/media/2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled-1.jpg` | LodgingBusiness |
| `/booking-request-form` | contact | Booking request form \| Blaco Hill | Request a booking form | `/media/2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled-1.jpg` | LodgingBusiness |
| `/brilliant-place-to-stay` | post | Brilliant place to stay! – dollyface99 \| Blaco Hill | Brilliant place to stay! – dollyface99 | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/can-we-all-eat-together-if-we-book-the-whole-site` | post | Can we all eat together if we book the whole site? \| Blaco Hill | Can we all eat together if we book the whole site? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/calendar` | contact | Cottage Availability \| Blaco Hill | Cottage Availability | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/checking-in-checkout-process` | general | Checking in & Checkout Process \| Blaco Hill | Checking in & Checkout Process | `/media/2020/08/bed-and-breakfast-15.jpg` | LodgingBusiness |
| `/contact-us` | contact | Contact us \| Blaco Hill | Contact Us | `/media/2020/08/blaco-hill-farm.jpg` | LodgingBusiness |
| `/cookies` | policy | Cookies \| Blaco Hill | Cookies Policy | `/media/2020/08/bed-and-breakfast-15.jpg` | LodgingBusiness |
| `/disclaimer` | policy | Disclaimer \| Blaco Hill | Disclaimer | `/media/2020/08/bed-and-breakfast-15.jpg` | LodgingBusiness |
| `/do-i-need-travel-insurance` | post | Do I need travel insurance? \| Blaco Hill | Do I need travel insurance? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/do-you-accept-pets` | post | Do you accept pets? \| Blaco Hill | Do you accept pets? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/do-you-have-any-laundry-facilities-we-can-use` | post | Do you have any laundry facilities we can use? \| Blaco Hill | Do you have any laundry facilities we can use? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/do-you-have-wifi` | post | Do you have wifi? \| Blaco Hill | Do you have wifi? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/excellent-and-great-location` | post | Excellent and great location – Mrs G Dundee \| Blaco Hill | Excellent and great location – Mrs G Dundee | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/family-weekend-away` | post | Family weekend away – Deborah W \| Blaco Hill | Family weekend away – Deborah W | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/fantastic-girls-weekend` | post | Fantastic girls weekend – Pho3nix1705 \| Blaco Hill | Fantastic girls weekend – Pho3nix1705 | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/for-four-people` | listing | For four people \| Blaco Hill | For four people | `/media/2020/09/swallow-master.jpg` | LodgingBusiness |
| `/for-six-people` | listing | For five or six people \| Blaco Hill | For five or six people | `/media/2020/09/swallow-master.jpg` | LodgingBusiness |
| `/for-two-people` | listing | For two people \| Blaco Hill | For two people | `/media/2020/09/swallow-master.jpg` | LodgingBusiness |
| `/highly-recommended` | post | Highly recommended! – Burl Brown \| Blaco Hill | Highly recommended! – Burl Brown | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/how-do-i-pay` | post | How do I pay? \| Blaco Hill | How do I pay? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/i-am-disabled-are-your-properties-suitable-for-me` | post | I am disabled. Are your properties suitable for me? \| Blaco Hill | I am disabled. Are your properties suitable for me? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/modern-slavery` | general | Modern Slavery Statement \| Blaco Hill | Modern Slavery Statement | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/our-cottages` | listing | Our Cottages \| Blaco Hill | Our Eleven Cottages | `/media/2020/09/swallow-master.jpg` | LodgingBusiness |
| `/our-cottages/chaffinch-2` | cottage | Chaffinch \| Blaco Hill | Chaffinch | `/media/2020/09/Chaffinch-lounge.jpg` | LodgingBusiness |
| `/our-cottages/cuckoo` | cottage | Cuckoo \| Blaco Hill | Cuckoo | `/media/2020/09/Cuckoo-lounge-flipped.jpg` | LodgingBusiness |
| `/our-cottages/grey-goose` | cottage | Greygoose \| Blaco Hill | Old Cart Shed D | `/media/2020/09/Pheasant-etc.jpg` | LodgingBusiness |
| `/our-cottages/mallard` | cottage | Mallard \| Blaco Hill | Old Cart Shed C | `/media/2020/09/Pheasant-etc.jpg` | LodgingBusiness |
| `/our-cottages/nightingale` | cottage | Nightingale \| Blaco Hill | Nightingale | `/media/2020/09/nightingale.jpg` | LodgingBusiness |
| `/our-cottages/partridge` | cottage | Partridge \| Blaco Hill | Partridge | `/media/2025/05/Partridge-new-image.jpg` | LodgingBusiness |
| `/our-cottages/skylark` | cottage | Skylark \| Blaco Hill | Skylark | `/media/2020/10/skylark-main-1.jpg` | LodgingBusiness |
| `/our-cottages/swallow` | cottage | Swallow \| Blaco Hill | Swallow | `/media/2020/09/swallow-master.jpg` | LodgingBusiness |
| `/our-cottages/swift` | cottage | Swift \| Blaco Hill | Swift | `/media/2020/09/swift-kitchen.jpg` | LodgingBusiness |
| `/our-cottages/woodcock` | cottage | Woodcock \| Blaco Hill | Old Cart Shed E | `/media/2020/09/Pheasant-etc.jpg` | LodgingBusiness |
| `/our-cottages/wren` | cottage | Wren \| Blaco Hill | Wren | `/media/2020/10/wren-exterior.jpg` | LodgingBusiness |
| `/perfect-countryside-retreat` | post | Perfect countryside retreat – Alex Smith \| Blaco Hill | Perfect countryside retreat – Alex Smith | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/perfect-highly-recommended` | post | Perfect-highly recommended! – dollyface99 \| Blaco Hill | Perfect-highly recommended! – dollyface99 | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/privacy-policy-2` | policy | Privacy Policy \| Blaco Hill | Privacy Policy | `/media/2020/08/bed-and-breakfast-15.jpg` | LodgingBusiness |
| `/very-good-value-for-money` | post | Very good value for money – Pip W \| Blaco Hill | Very good value for money – Pip W | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/weekend-away-rebecca-p` | post | Weekend away – Rebecca P \| Blaco Hill | Weekend away – Rebecca P | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/what-internet-speeds-can-i-expect` | post | What internet speeds can I expect? \| Blaco Hill | What internet speeds can I expect? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/what-is-your-cancellation-policy` | post | What is your cancellation policy? \| Blaco Hill | What is your cancellation policy? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/what-length-of-stays-do-you-offer` | post | What length of stays do you offer? \| Blaco Hill | What length of stays do you offer? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure` | post | Check-in and checkout times \| Blaco Hill | What time can I check in on arrival and what time do I have to vacate the property by on my departure? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/where-should-i-park` | post | Where should I park? \| Blaco Hill | Where should I park? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/will-i-receive-a-refund-if-i-cancel` | post | Will I receive a refund if I cancel? \| Blaco Hill | Will I receive a refund if I cancel? | `/media/2020/11/cropped-bird.png` | LodgingBusiness, FAQPage |
| `/wonderful` | post | Wonderful – Lorraine D \| Blaco Hill | Wonderful – Lorraine D | `/media/2020/11/cropped-bird.png` | LodgingBusiness |
| `/wonderful-country-views-in-cosy-newly-converted-barns` | post | Wonderful country views in cosy newly converted barns – Sue and John \| Blaco Hill | Wonderful country views in cosy newly converted barns – Sue and John | `/media/2020/11/cropped-bird.png` | LodgingBusiness |

## How to reproduce

```
npm run build
node agent/scripts/seo-audit.mjs   # the findings above
node agent/scripts/seo-copy.mjs    # rewrites agent/seo-copy.csv
```

The audit script parses every file in `.next/server/app/` with cheerio and
reports titles, descriptions, canonicals, Open Graph and Twitter tags,
JSON-LD, robots meta and heading levels, then cross-checks the set against
`content/index.json` and the generated sitemap. It also proves the things that
are easy to get quietly wrong: that every rendered description is byte for byte
the approved one, that `og:title` matches the title and `og:url` the canonical,
and that every `og:image` is absolute, carries its width and height, and points
at a file that exists in `public/`.

`agent/seo-copy.csv` is the worksheet for writing the missing descriptions:
one row per page with the URL, the title, the H1 and the first 300 characters
of the page's body text. It is regenerated from the built site, so it always
shows the titles and H1s as they currently ship.
