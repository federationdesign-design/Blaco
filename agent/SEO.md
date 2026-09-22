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
| Pages built | 59, matching `content/index.json` and the sitemap |
| Titles | Present on all 59, all unique, all in the live wording. 3 over 60 characters |
| Meta descriptions | **None on any page** |
| Canonical URLs | Present and correct on all 59 |
| H1 | Present on all 59, exactly one each, all distinct |
| Open Graph | **None on any page** |
| Twitter cards | **None on any page** |
| Structured data | `LodgingBusiness` sitewide, `FAQPage` on the 17 FAQ pages |
| `sitemap.ts` | 59 URLs, live domain, no redirected or missing URLs |
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

## What is still missing

These are the remaining gaps, in the order I would fix them.

### 1. No meta descriptions (59 pages)

No page has a `<meta name="description">`. This is faithful: the live
WordPress site has none either (`agent/INVENTORY.md`, site-wide facts, and the
note in `app/layout.tsx`), and it is already logged in `PLACEHOLDERS.md`.

Porting faithfully therefore means porting nothing, so this is a decision
rather than a defect. Google will write its own snippet from the page copy in
the meantime. **Needed from Steve:** one description per page, or a decision to
leave them out. I have not written any.

### 2. No Open Graph or Twitter tags (59 pages)

There is no `og:title`, `og:description`, `og:image`, `og:url`, `og:type`,
`og:locale`, `og:site_name`, `twitter:card` or any other social tag anywhere.
The live site has none either, so again this is a port-faithful outcome rather
than a regression.

The practical effect: a link to any page shared on Facebook, WhatsApp, iMessage
or LinkedIn shows the bare URL with no photo. For a holiday-let site, where
guests forward cottage pages to the rest of the party, that is the most
valuable thing on this list.

Most of it can be generated with no new copy at all: `og:title` from the
existing title, `og:url` from the existing canonical, `og:type`, `og:locale`
(`en_GB`) and `og:site_name` are constants, and `og:image` can be each page's
hero photo, which is already in the content JSON. Only `og:description` needs
wording, and it can reuse the meta description once that exists.

**Needed from Steve:** approval to add them, and a decision on the fallback
share image for pages with no hero.

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
wording. The remaining three are listed above and are a deliberate trade.

### 7. Fixed: the two identical H1s

`/about` is "About Blaco Hill Farm Cottages" and `/our-cottages` is "Our Eleven
Cottages". All 59 H1s are now distinct.

## Confirmations you asked for

### GA4 fires only after consent: confirmed

Verified three ways:

1. `app/components/cookies/Analytics.tsx` returns `null` when
   `consent?.analytics` is not true. The `<Script>` tags are not rendered at
   all, rather than rendered and held back, so no request to
   `googletagmanager.com` is made and no GA cookie is set before opt-in.
2. Consent starts as `null` and is only read from `localStorage` after mount
   (`CookieConsentProvider.tsx`), so the first paint is always unconsented.
   `null` is treated as "not chosen", not as consent, and the banner shows.
3. Grepping all 59 built HTML files for `googletagmanager`, `gtag` and
   `G-TN54HGV0ME` returns nothing. The measurement ID is not in the shipped
   HTML at all.

Withdrawing consent also calls `clearAnalyticsCookies()`, which expires `_ga`,
`_ga_*`, `_gid` and `_gat*` on the host and the registrable domain rather than
waiting them out. Reject is presented as an equal action to accept, per brief 6.

### The sitemap uses the live domain: confirmed

`app/sitemap.ts` hardcodes `https://blacohillcottages.co.uk`. Every one of the
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

`Desc`, `OG` and `Twitter` are absent on all 59, so those columns are omitted
rather than repeated. No page carries a robots meta tag, so nothing is
`noindex`. Titles use the `%s | Blaco Hill` template from `app/layout.tsx`,
except the home page, which keeps its own absolute live title.

| URL | Template | Title | Canonical | H1 | Structured data |
|---|---|---|---|---|---|
| `/` | home | Blaco Hill Farm Cottages \| Holiday Rentals | https://blacohillcottages.co.uk | A warm welcome from Victoria and Thomas | LodgingBusiness |
| `/about` | general | About \| Blaco Hill | https://blacohillcottages.co.uk/about | About Blaco Hill Farm Cottages | LodgingBusiness |
| `/about/faq` | faq-index | FAQ \| Blaco Hill | https://blacohillcottages.co.uk/about/faq | Questions | LodgingBusiness, FAQPage |
| `/about/games-room` | general | Games Room \| Blaco Hill | https://blacohillcottages.co.uk/about/games-room | The Games Room | LodgingBusiness |
| `/about/local-interests` | general | Local Interests \| Blaco Hill | https://blacohillcottages.co.uk/about/local-interests | Local Attractions | LodgingBusiness |
| `/about/testimonials` | testimonial-index | Testimonials \| Blaco Hill | https://blacohillcottages.co.uk/about/testimonials | Testimonials | LodgingBusiness |
| `/accessibility-statement` | accessibility | Accessibility Statement \| Blaco Hill | https://blacohillcottages.co.uk/accessibility-statement | Access statement for Blaco Hill Farm Cottages | LodgingBusiness |
| `/amazing-family-get-together` | post | Amazing family get together – Charris-ment \| Blaco Hill | https://blacohillcottages.co.uk/amazing-family-get-together | Amazing family get together – Charris-ment | LodgingBusiness |
| `/are-longer-term-lets-available` | post | Are longer-term lets available? \| Blaco Hill | https://blacohillcottages.co.uk/are-longer-term-lets-available | Are longer-term lets available? | LodgingBusiness, FAQPage |
| `/are-these-holiday-lets-suitable-for-families` | post | Are these holiday lets suitable for families? \| Blaco Hill | https://blacohillcottages.co.uk/are-these-holiday-lets-suitable-for-families | Are these holiday lets suitable for families? | LodgingBusiness, FAQPage |
| `/are-towels-and-linen-provided` | post | Are towels and linen provided? \| Blaco Hill | https://blacohillcottages.co.uk/are-towels-and-linen-provided | Are towels and linen provided? | LodgingBusiness, FAQPage |
| `/are-your-cottages-child-friendly` | post | Are your cottages child friendly? \| Blaco Hill | https://blacohillcottages.co.uk/are-your-cottages-child-friendly | Are your cottages child friendly? | LodgingBusiness, FAQPage |
| `/ask-us-a-question` | contact | Ask us a question \| Blaco Hill | https://blacohillcottages.co.uk/ask-us-a-question | Ask us a Question | LodgingBusiness |
| `/booking-request-form` | contact | Booking request form \| Blaco Hill | https://blacohillcottages.co.uk/booking-request-form | Request a booking form | LodgingBusiness |
| `/brilliant-place-to-stay` | post | Brilliant place to stay! – dollyface99 \| Blaco Hill | https://blacohillcottages.co.uk/brilliant-place-to-stay | Brilliant place to stay! – dollyface99 | LodgingBusiness |
| `/calendar` | contact | Cottage Availability \| Blaco Hill | https://blacohillcottages.co.uk/calendar | Cottage Availability | LodgingBusiness |
| `/checking-in-checkout-process` | general | Checking in & Checkout Process \| Blaco Hill | https://blacohillcottages.co.uk/checking-in-checkout-process | Checking in & Checkout Process | LodgingBusiness |
| `/contact-us` | contact | Contact us \| Blaco Hill | https://blacohillcottages.co.uk/contact-us | Contact Us | LodgingBusiness |
| `/cookies` | policy | Cookies \| Blaco Hill | https://blacohillcottages.co.uk/cookies | Cookies Policy | LodgingBusiness |
| `/disclaimer` | policy | Disclaimer \| Blaco Hill | https://blacohillcottages.co.uk/disclaimer | Disclaimer | LodgingBusiness |
| `/do-i-need-travel-insurance` | post | Do I need travel insurance? \| Blaco Hill | https://blacohillcottages.co.uk/do-i-need-travel-insurance | Do I need travel insurance? | LodgingBusiness, FAQPage |
| `/do-you-accept-pets` | post | Do you accept pets? \| Blaco Hill | https://blacohillcottages.co.uk/do-you-accept-pets | Do you accept pets? | LodgingBusiness, FAQPage |
| `/do-you-have-any-laundry-facilities-we-can-use` | post | Do you have any laundry facilities we can use? \| Blaco Hill | https://blacohillcottages.co.uk/do-you-have-any-laundry-facilities-we-can-use | Do you have any laundry facilities we can use? | LodgingBusiness, FAQPage |
| `/do-you-have-wifi` | post | Do you have wifi? \| Blaco Hill | https://blacohillcottages.co.uk/do-you-have-wifi | Do you have wifi? | LodgingBusiness, FAQPage |
| `/excellent-and-great-location` | post | Excellent and great location – Mrs G Dundee \| Blaco Hill | https://blacohillcottages.co.uk/excellent-and-great-location | Excellent and great location – Mrs G Dundee | LodgingBusiness |
| `/family-weekend-away` | post | Family weekend away – Deborah W \| Blaco Hill | https://blacohillcottages.co.uk/family-weekend-away | Family weekend away – Deborah W | LodgingBusiness |
| `/fantastic-girls-weekend` | post | Fantastic girls weekend – Pho3nix1705 \| Blaco Hill | https://blacohillcottages.co.uk/fantastic-girls-weekend | Fantastic girls weekend – Pho3nix1705 | LodgingBusiness |
| `/for-four-people` | listing | For four people \| Blaco Hill | https://blacohillcottages.co.uk/for-four-people | For four people | LodgingBusiness |
| `/for-six-people` | listing | For six people \| Blaco Hill | https://blacohillcottages.co.uk/for-six-people | For six people | LodgingBusiness |
| `/for-two-people` | listing | For two people \| Blaco Hill | https://blacohillcottages.co.uk/for-two-people | For two people | LodgingBusiness |
| `/highly-recommended` | post | Highly recommended! – Burl Brown \| Blaco Hill | https://blacohillcottages.co.uk/highly-recommended | Highly recommended! – Burl Brown | LodgingBusiness |
| `/how-do-i-pay` | post | How do I pay? \| Blaco Hill | https://blacohillcottages.co.uk/how-do-i-pay | How do I pay? | LodgingBusiness, FAQPage |
| `/i-am-disabled-are-your-properties-suitable-for-me` | post | I am disabled. Are your properties suitable for me? \| Blaco Hill | https://blacohillcottages.co.uk/i-am-disabled-are-your-properties-suitable-for-me | I am disabled. Are your properties suitable for me? | LodgingBusiness, FAQPage |
| `/modern-slavery` | general | Modern Slavery Statement \| Blaco Hill | https://blacohillcottages.co.uk/modern-slavery | Modern Slavery Statement | LodgingBusiness |
| `/our-cottages` | listing | Our Cottages \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages | Our Eleven Cottages | LodgingBusiness |
| `/our-cottages/chaffinch-2` | cottage | Chaffinch \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/chaffinch-2 | Chaffinch | LodgingBusiness |
| `/our-cottages/cuckoo` | cottage | Cuckoo \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/cuckoo | Cuckoo | LodgingBusiness |
| `/our-cottages/grey-goose` | cottage | Greygoose \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/grey-goose | Old Cart Shed D | LodgingBusiness |
| `/our-cottages/mallard` | cottage | Mallard \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/mallard | Old Cart Shed C | LodgingBusiness |
| `/our-cottages/nightingale` | cottage | Nightingale \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/nightingale | Nightingale | LodgingBusiness |
| `/our-cottages/partridge` | cottage | Partridge \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/partridge | Partridge | LodgingBusiness |
| `/our-cottages/skylark` | cottage | Skylark \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/skylark | Skylark | LodgingBusiness |
| `/our-cottages/swallow` | cottage | Swallow \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/swallow | Swallow | LodgingBusiness |
| `/our-cottages/swift` | cottage | Swift \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/swift | Swift | LodgingBusiness |
| `/our-cottages/woodcock` | cottage | Woodcock \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/woodcock | Old Cart Shed E | LodgingBusiness |
| `/our-cottages/wren` | cottage | Wren \| Blaco Hill | https://blacohillcottages.co.uk/our-cottages/wren | Wren | LodgingBusiness |
| `/perfect-countryside-retreat` | post | Perfect countryside retreat – Alex Smith \| Blaco Hill | https://blacohillcottages.co.uk/perfect-countryside-retreat | Perfect countryside retreat – Alex Smith | LodgingBusiness |
| `/perfect-highly-recommended` | post | Perfect-highly recommended! – dollyface99 \| Blaco Hill | https://blacohillcottages.co.uk/perfect-highly-recommended | Perfect-highly recommended! – dollyface99 | LodgingBusiness |
| `/privacy-policy-2` | policy | Privacy Policy \| Blaco Hill | https://blacohillcottages.co.uk/privacy-policy-2 | Privacy Policy | LodgingBusiness |
| `/very-good-value-for-money` | post | Very good value for money – Pip W \| Blaco Hill | https://blacohillcottages.co.uk/very-good-value-for-money | Very good value for money – Pip W | LodgingBusiness |
| `/weekend-away-rebecca-p` | post | Weekend away – Rebecca P \| Blaco Hill | https://blacohillcottages.co.uk/weekend-away-rebecca-p | Weekend away – Rebecca P | LodgingBusiness |
| `/what-internet-speeds-can-i-expect` | post | What internet speeds can I expect? \| Blaco Hill | https://blacohillcottages.co.uk/what-internet-speeds-can-i-expect | What internet speeds can I expect? | LodgingBusiness, FAQPage |
| `/what-is-your-cancellation-policy` | post | What is your cancellation policy? \| Blaco Hill | https://blacohillcottages.co.uk/what-is-your-cancellation-policy | What is your cancellation policy? | LodgingBusiness, FAQPage |
| `/what-length-of-stays-do-you-offer` | post | What length of stays do you offer? \| Blaco Hill | https://blacohillcottages.co.uk/what-length-of-stays-do-you-offer | What length of stays do you offer? | LodgingBusiness, FAQPage |
| `/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure` | post | What time can I check in on arrival and what time do I have to vacate the property by on my departure? \| Blaco Hill | https://blacohillcottages.co.uk/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure | What time can I check in on arrival and what time do I have to vacate the property by on my departure? | LodgingBusiness, FAQPage |
| `/where-should-i-park` | post | Where should I park? \| Blaco Hill | https://blacohillcottages.co.uk/where-should-i-park | Where should I park? | LodgingBusiness, FAQPage |
| `/will-i-receive-a-refund-if-i-cancel` | post | Will I receive a refund if I cancel? \| Blaco Hill | https://blacohillcottages.co.uk/will-i-receive-a-refund-if-i-cancel | Will I receive a refund if I cancel? | LodgingBusiness, FAQPage |
| `/wonderful` | post | Wonderful – Lorraine D \| Blaco Hill | https://blacohillcottages.co.uk/wonderful | Wonderful – Lorraine D | LodgingBusiness |
| `/wonderful-country-views-in-cosy-newly-converted-barns` | post | Wonderful country views in cosy newly converted barns – Sue and John \| Blaco Hill | https://blacohillcottages.co.uk/wonderful-country-views-in-cosy-newly-converted-barns | Wonderful country views in cosy newly converted barns – Sue and John | LodgingBusiness |

## How to reproduce

```
npm run build
node agent/scripts/seo-audit.mjs   # the findings above
node agent/scripts/seo-copy.mjs    # rewrites agent/seo-copy.csv
```

The audit script parses every file in `.next/server/app/` with cheerio and
reports titles, descriptions, canonicals, Open Graph and Twitter tags,
JSON-LD, robots meta and heading levels, then cross-checks the set against
`content/index.json` and the generated sitemap.

`agent/seo-copy.csv` is the worksheet for writing the missing descriptions:
one row per page with the URL, the title, the H1 and the first 300 characters
of the page's body text. It is regenerated from the built site, so it always
shows the titles and H1s as they currently ship.
