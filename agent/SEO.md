# SEO readiness report

Branch `rebuild`, at commit `b9e8b12`. Measured on 2026-09-22 by parsing the
prerendered HTML in `.next/server/app/` after a clean `npm run build`
(`tsc --noEmit` clean, 59 pages), together with the generated `robots.txt` and
`sitemap.xml`. Nothing here is inferred from source alone: every title,
canonical and heading below was read out of the built page.

This report lists what is missing. It does not write the missing copy, because
titles and descriptions are Steve's to supply (brief 11).

## Summary

| Check | Result |
|---|---|
| Pages built | 59, matching `content/index.json` and the sitemap |
| Titles | Present on all 59, all unique |
| Meta descriptions | **None on any page** |
| Canonical URLs | Present and correct on all 59 |
| H1 | Present on 56, **missing on 3**, never more than one |
| Open Graph | **None on any page** |
| Twitter cards | **None on any page** |
| Structured data | **None on any page** |
| `sitemap.ts` | 59 URLs, live domain, no redirected or missing URLs |
| `robots.ts` | Correct, live domain, sitemap declared |
| `noindex` | None. No page carries a robots meta tag |
| GA4 | Fires only after analytics consent (verified) |
| `lang` | `en-GB` on every page |
| Favicon | `/media/2020/11/cropped-bird.png`, plus apple-touch-icon |

## What is missing

These are the gaps, in the order I would fix them.

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

### 3. Three pages have no H1

| URL | Template | Highest heading present |
|---|---|---|
| `/ask-us-a-question` | contact | H2 "Ask us a Question" |
| `/booking-request-form` | contact | H2 "Request a booking form" |
| `/calendar` | contact | H2 "Cottage Availability" |

Each starts at H2, so the document outline has no top level. This is inherited
from the live pages, where those headings are also H2: no template emits an H1
of its own, they come through in the ported rich text. `/contact-us`, on the
same template, does have one.

The fix is to promote the first H2 to an H1 on those three pages, which changes
no wording. **Needed from Steve:** approval, since it edits ported markup.

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

### 5. No structured data

No `application/ld+json` on any page. Nothing is broken without it, but for
this site it is the clearest win after Open Graph, because it feeds Google's
rich results:

- `LodgingBusiness` on the home page: name, address (Mattersey, Doncaster, DN10
  5HQ), phone, email, photo. All of it already exists in `app/lib/site.ts` and
  `agent/INVENTORY.md`.
- `FAQPage` on `/about/faq` and on each of the 16 FAQ detail pages. The
  questions and answers are already in `content/posts.json`.
- `Review` on the 12 testimonial pages. The author and text are already ported,
  though **no star ratings exist**, and I will not invent them.

All of this can be built from content already in the repo. **Needed from
Steve:** approval, plus a decision on whether to ask guests for ratings.

### 6. Minor: 14 titles run past 60 characters

Google truncates around 60. The longest is 129 characters:

`What time can I check in on arrival and what time do I have to vacate the property by on my departure? | Blaco Hill Farm Cottages`

The others are the longer FAQ questions and the testimonial titles, which carry
the guest's name. All are ported live titles, and all are unique, so this is
cosmetic in search results rather than a ranking problem. **Needed from
Steve:** shorter titles, if he wants them. I have not shortened any.

### 7. Minor: two pages share an H1

`/about` and `/our-cottages` both use the H1 "Blaco Hill Farm Cottages". Their
titles differ, so search results still distinguish them. Ported as live.

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

`Desc`, `OG`, `Twitter` and `Structured data` are absent on all 59, so those
columns are omitted rather than repeated. No page carries a robots meta tag, so
nothing is `noindex`. Titles use the `%s | Blaco Hill Farm Cottages` template
from `app/layout.tsx`, except the home page, which sets its own absolute title.

| URL | Template | Title | Canonical | H1 |
|---|---|---|---|---|
| `/` | home | Blaco Hill Farm Cottages \| Holiday Rentals | https://blacohillcottages.co.uk | A warm welcome from Victoria and Thomas |
| `/about` | general | About \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/about | Blaco Hill Farm Cottages |
| `/about/faq` | faq-index | FAQ \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/about/faq | Questions |
| `/about/games-room` | general | Games Room \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/about/games-room | The Games Room |
| `/about/local-interests` | general | Local Interests \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/about/local-interests | Local Attractions |
| `/about/testimonials` | testimonial-index | Testimonials \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/about/testimonials | Testimonials |
| `/accessibility-statement` | accessibility | Accessibility Statement \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/accessibility-statement | Access statement for Blaco Hill Farm Cottages |
| `/amazing-family-get-together` | post | Amazing family get together – Charris-ment \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/amazing-family-get-together | Amazing family get together – Charris-ment |
| `/are-longer-term-lets-available` | post | Are longer-term lets available? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/are-longer-term-lets-available | Are longer-term lets available? |
| `/are-these-holiday-lets-suitable-for-families` | post | Are these holiday lets suitable for families? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/are-these-holiday-lets-suitable-for-families | Are these holiday lets suitable for families? |
| `/are-towels-and-linen-provided` | post | Are towels and linen provided? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/are-towels-and-linen-provided | Are towels and linen provided? |
| `/are-your-cottages-child-friendly` | post | Are your cottages child friendly? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/are-your-cottages-child-friendly | Are your cottages child friendly? |
| `/ask-us-a-question` | contact | Ask us a question \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/ask-us-a-question | **none** |
| `/booking-request-form` | contact | Booking request form \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/booking-request-form | **none** |
| `/brilliant-place-to-stay` | post | Brilliant place to stay! – dollyface99 \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/brilliant-place-to-stay | Brilliant place to stay! – dollyface99 |
| `/calendar` | contact | Cottage Availability \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/calendar | **none** |
| `/checking-in-checkout-process` | general | Checking in & Checkout Process \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/checking-in-checkout-process | Checking in & Checkout Process |
| `/contact-us` | contact | Contact us \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/contact-us | Contact Us |
| `/cookies` | policy | Cookies \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/cookies | Cookies Policy |
| `/disclaimer` | policy | Disclaimer \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/disclaimer | Disclaimer |
| `/do-i-need-travel-insurance` | post | Do I need travel insurance? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/do-i-need-travel-insurance | Do I need travel insurance? |
| `/do-you-accept-pets` | post | Do you accept pets? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/do-you-accept-pets | Do you accept pets? |
| `/do-you-have-any-laundry-facilities-we-can-use` | post | Do you have any laundry facilities we can use? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/do-you-have-any-laundry-facilities-we-can-use | Do you have any laundry facilities we can use? |
| `/do-you-have-wifi` | post | Do you have wifi? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/do-you-have-wifi | Do you have wifi? |
| `/excellent-and-great-location` | post | Excellent and great location – Mrs G Dundee \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/excellent-and-great-location | Excellent and great location – Mrs G Dundee |
| `/family-weekend-away` | post | Family weekend away – Deborah W \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/family-weekend-away | Family weekend away – Deborah W |
| `/fantastic-girls-weekend` | post | Fantastic girls weekend – Pho3nix1705 \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/fantastic-girls-weekend | Fantastic girls weekend – Pho3nix1705 |
| `/for-four-people` | listing | For four people \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/for-four-people | For four people |
| `/for-six-people` | listing | For six people \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/for-six-people | For six people |
| `/for-two-people` | listing | For two people \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/for-two-people | For two people |
| `/highly-recommended` | post | Highly recommended! – Burl Brown \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/highly-recommended | Highly recommended! – Burl Brown |
| `/how-do-i-pay` | post | How do I pay? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/how-do-i-pay | How do I pay? |
| `/i-am-disabled-are-your-properties-suitable-for-me` | post | I am disabled. Are your properties suitable for me? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/i-am-disabled-are-your-properties-suitable-for-me | I am disabled. Are your properties suitable for me? |
| `/modern-slavery` | general | Modern Slavery Statement \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/modern-slavery | Modern Slavery Statement |
| `/our-cottages` | listing | Our Cottages \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages | Blaco Hill Farm Cottages |
| `/our-cottages/chaffinch-2` | cottage | Chaffinch \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/chaffinch-2 | Chaffinch |
| `/our-cottages/cuckoo` | cottage | Cuckoo \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/cuckoo | Cuckoo |
| `/our-cottages/grey-goose` | cottage | Greygoose \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/grey-goose | Old Cart Shed D |
| `/our-cottages/mallard` | cottage | Mallard \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/mallard | Old Cart Shed C |
| `/our-cottages/nightingale` | cottage | Nightingale \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/nightingale | Nightingale |
| `/our-cottages/partridge` | cottage | Partridge \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/partridge | Partridge |
| `/our-cottages/skylark` | cottage | Skylark \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/skylark | Skylark |
| `/our-cottages/swallow` | cottage | Swallow \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/swallow | Swallow |
| `/our-cottages/swift` | cottage | Swift \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/swift | Swift |
| `/our-cottages/woodcock` | cottage | Woodcock \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/woodcock | Old Cart Shed E |
| `/our-cottages/wren` | cottage | Wren \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/our-cottages/wren | Wren |
| `/perfect-countryside-retreat` | post | Perfect countryside retreat – Alex Smith \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/perfect-countryside-retreat | Perfect countryside retreat – Alex Smith |
| `/perfect-highly-recommended` | post | Perfect-highly recommended! – dollyface99 \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/perfect-highly-recommended | Perfect-highly recommended! – dollyface99 |
| `/privacy-policy-2` | policy | Privacy Policy \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/privacy-policy-2 | Privacy Policy |
| `/very-good-value-for-money` | post | Very good value for money – Pip W \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/very-good-value-for-money | Very good value for money – Pip W |
| `/weekend-away-rebecca-p` | post | Weekend away – Rebecca P \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/weekend-away-rebecca-p | Weekend away – Rebecca P |
| `/what-internet-speeds-can-i-expect` | post | What internet speeds can I expect? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/what-internet-speeds-can-i-expect | What internet speeds can I expect? |
| `/what-is-your-cancellation-policy` | post | What is your cancellation policy? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/what-is-your-cancellation-policy | What is your cancellation policy? |
| `/what-length-of-stays-do-you-offer` | post | What length of stays do you offer? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/what-length-of-stays-do-you-offer | What length of stays do you offer? |
| `/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure` | post | What time can I check in on arrival and what time do I have to vacate the property by on my departure? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure | What time can I check in on arrival and what time do I have to vacate the property by on my departure? |
| `/where-should-i-park` | post | Where should I park? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/where-should-i-park | Where should I park? |
| `/will-i-receive-a-refund-if-i-cancel` | post | Will I receive a refund if I cancel? \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/will-i-receive-a-refund-if-i-cancel | Will I receive a refund if I cancel? |
| `/wonderful` | post | Wonderful – Lorraine D \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/wonderful | Wonderful – Lorraine D |
| `/wonderful-country-views-in-cosy-newly-converted-barns` | post | Wonderful country views in cosy newly converted barns – Sue and John \| Blaco Hill Farm Cottages | https://blacohillcottages.co.uk/wonderful-country-views-in-cosy-newly-converted-barns | Wonderful country views in cosy newly converted barns – Sue and John |
## How to reproduce

```
npm run build
node agent/scripts/seo-audit.mjs
```

The audit script parses every file in `.next/server/app/` with cheerio and
reports titles, descriptions, canonicals, Open Graph and Twitter tags,
JSON-LD, robots meta and heading levels, then cross-checks the set against
`content/index.json` and the generated sitemap.
