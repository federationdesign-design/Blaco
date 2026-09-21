# Blaco Hill Cottages: Site Inventory (Phase 1)

Crawled 2026-09-21 from https://blacohillcottages.co.uk.

Sources: `/wp-sitemap.xml` (and its page, post and category sub-sitemaps), `/wp-json/wp/v2/pages`, `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/categories`, `/wp-json/wp/v2/media` (2 pages), plus a rendered fetch of every page for the title tag, meta description, headings, media and forms.

**Method caveat:** shell network access (curl) was not available in this session, so pages were read through WebFetch, which returns an extracted reading of each page rather than raw HTML. Titles, URLs and image paths are reliable. Lazy-loaded or CSS background images may be under-reported. Phase 3 should re-extract from raw HTML and the REST `content.rendered` field with a script before porting.

## Site-wide facts

| Item | Value |
|---|---|
| Title pattern | `{Page title} \| Blaco Hill Farm Cottages` (home: `Blaco Hill Farm Cottages \| Holiday Rentals`) |
| Meta descriptions | **None on any page.** No SEO plugin (no Yoast fields in the API, no meta description or og:description in the head). |
| Analytics / consent | None detected on the live site. |
| Phone | 07718 762 845 (also 01777 817254 on the privacy page only) |
| Email | victoria@blacohillcottages.co.uk (written `Victoria@` in several places) |
| Address | Mattersey, Doncaster, South Yorkshire DN10 5HQ |
| Header logo | `/wp-content/uploads/2020/08/BHF-logoicon.svg` |
| Footer logo | `/wp-content/uploads/2020/09/WhiteRGB.svg` |
| Other logo files in library | `BHF-logo.svg` (2020/08), `BlackRGB72ppi.png` (2020/08), `cropped-bird.png` and `bird.png` (2020/11, likely site icon) |
| Footer strapline | "We welcome all people - families, friends, large groups exclusively, business users, moving house/ longer term lets." |
| Footer copyright | "Copyright © 2020 - Blaco Hill Farm Cottages" |
| Shared page footer blocks | "We are open year round" / "We have availability" CTA pair, and a "Send us a message" form (Name, Email Address, Message) on most pages. Cottage and listing pages also carry a "Guest Reviews" block. |
| Posts sidebar | FAQ and testimonial single posts show a search box, "Recent Posts" and an empty "Recent Comments" widget. |

### Primary navigation

- Home `/`
- About `/about`
  - About `/about`
  - Games Room `/about/games-room`
  - Local Interests `/about/local-interests`
  - Checking in `/checking-in-checkout-process`
  - FAQ `/about/faq`
  - Testimonials `/about/testimonials`
  - Accessibility Statement `/accessibility-statement`
- Our Cottages `/our-cottages`
  - For six people `/for-six-people`
  - For four people `/for-four-people`
  - For two people `/for-two-people`
  - All Cottages `/our-cottages`
- Contact `/contact-us`

### Footer links

Frequently Asked Questions `/about/faq`, Checking in & Checkout `/checking-in-checkout-process`, Testimonials `/about/testimonials`, Cookies `/cookies`, Disclaimer `/disclaimer`, Privacy `/privacy-policy-2`, Accessibility Statement `/accessibility-statement`. (Modern slavery `/modern-slavery` to be added in Phase 4.)

## Templates

| Template | Pages | Notes |
|---|---|---|
| **home** | 1 | Confirmed. |
| **cottage** | 11 | Confirmed. |
| **cottage listing** | 4 | **New, not in the brief's list.** `/our-cottages` plus the three "For N people" filtered lists share one layout of cottage cards. |
| **FAQ index** | 1 | Confirmed. Accordion of all 16 questions, each also linking to its own URL. |
| **FAQ detail** | 16 | Confirmed. WordPress posts at root-level slugs. |
| **testimonial index** | 1 | **New.** `/about/testimonials` lists 12 testimonials, each linking to its own URL. Could share the FAQ index layout. |
| **testimonial detail** | 12 | **New.** Same single-post layout as FAQ detail; one "post detail" template can serve both. |
| **contact or enquiry** | 4 | Confirmed. Contact us, Booking request form, Ask us a question, Cottage Availability. |
| **general content** | 4 (+1 new) | Confirmed. About, Games Room, Local Interests, Checking in. `/modern-slavery` added in Phase 4. |
| **policy** | 3 | Confirmed. Cookies, Privacy Policy, Disclaimer. |
| **accessibility statement** | 1 | Confirmed. Long, heavily sub-headed (per cottage, per room). |
| **category archive** | 3 | **Decision needed.** `/category/faq` (paginated, 6 per page), `/category/testimonial`, `/category/uncategorized`. |
| **leftover / junk** | 2 | **Decision needed.** `/sample-page`, `/booking-test`. |

## Page inventory

Meta description is **none** for every URL below, so the column is omitted. Media paths are relative to `https://blacohillcottages.co.uk/wp-content/uploads/`. Header and footer logos are on every page and are not repeated.

### Home

| URL | Title tag | Media |
|---|---|---|
| `/` | Blaco Hill Farm Cottages \| Holiday Rentals | Cottage cards: `dev.`2020/09/swift-kitchen-1.jpg, 2025/05/Partridge-new-image.jpg, `dev.`2020/09/Chaffinch-lounge.jpg, 2020/09/swallow-master.jpg, `dev.`2020/09/Cuckoo-lounge-flipped.jpg, `dev.`2020/10/Nightingale-living-diner-2.jpg, `dev.`2020/10/skylark-main-1.jpg, `dev.`2020/09/Pheasant-master1.jpg, `dev.`2020/09/twin2.jpg, `dev.`2020/09/Pheasant-twin.jpg, `dev.`2020/10/wren-master.jpg; hero/section: 2020/08/blaco-hill-farm.jpg |

Headings: A warm welcome from Victoria and Thomas; In a rather remote but quite special and scenically spectacular location; 11 cottage cards; Amenities; Guest Reviews; Near by…; We are open year round; We have availability.

`dev.` = image loaded from `http://dev.blacohillcottages.co.uk/...` (a second old-server hostname; see Issues).

### Cottage listing

| URL | Title tag | Media |
|---|---|---|
| `/our-cottages` | Our Cottages \| Blaco Hill Farm Cottages | Same 11 card images as home (8 from `dev.`), plus 2020/09/Chaffinch-bath.jpg |
| `/for-six-people` | For six people \| Blaco Hill Farm Cottages | 2020/09/swift-kitchen.jpg, 2025/05/Partridge-new-image.jpg, 2020/09/Chaffinch-bath.jpg. Lists Swift, Partridge. |
| `/for-four-people` | For four people \| Blaco Hill Farm Cottages | 2020/09/swallow-master.jpg, `dev.`2020/09/Cuckoo-lounge-flipped.jpg, `dev.`2020/09/Chaffinch-lounge.jpg, 2020/09/Chaffinch-bath.jpg. Lists Swallow, Cuckoo, Chaffinch. |
| `/for-two-people` | For two people \| Blaco Hill Farm Cottages | `dev.`2020/09/nightingale.jpg, `dev.`2020/09/twin2.jpg, `dev.`2020/09/Pheasant-master1.jpg, `dev.`2020/09/Pheasant-twin.jpg, 2020/09/Chaffinch-bath.jpg. Lists Nightingale, Skylark, Wren, Grey Goose, Mallard, Woodcock. |

### Cottages

All 11 share the same heading structure: cottage name (or shed name), rooms, bedrooms, "Sleeps N people", "Perfect for families/couples", Features, open year round / availability CTA, What you Get, Amenities, Reviews. Each carries one site-map image (`cottage-map-*.jpg`) showing where the cottage sits. Each has the Name / Email Address / Message form.

| URL | Title tag | Sleeps | Media |
|---|---|---|---|
| `/our-cottages/swift` | Swift \| Blaco Hill Farm Cottages | 6 | 2020/09/swift-entrance.jpg, swift-lounge.jpg, swift-kitchen2.jpg, swift-master.jpg, swift-twin2.jpg, swift-entrance2.jpg, swift-bath.jpg, swift-twin3.jpg; map 2023/09/cottage-map-cottage1.jpg |
| `/our-cottages/partridge` | Partridge \| Blaco Hill Farm Cottages | 6 | 2025/05/IMG_0222.jpg, IMG_0227.jpg, IMG_0225.jpg, IMG_0226.jpg, IMG_0224.jpg; map 2023/09/cottage-map-shedB.jpg |
| `/our-cottages/chaffinch-2` | Chaffinch \| Blaco Hill Farm Cottages | 4 | 2020/09/Chaffinch-master.jpg, Chaffinch-kitchen2.jpg, Chaffinch-twin.jpg, Chaffinch-dining.jpg, Chaffinch-lounge.jpg; map 2023/09/cottage-map-cottage5.jpg |
| `/our-cottages/swallow` | Swallow \| Blaco Hill Farm Cottages | **5** | 2020/10/Swallow-twin.jpg, Swallow-bath.jpg, Swallow-exterior.jpg; map 2023/09/cottage-map-cottage3.jpg |
| `/our-cottages/cuckoo` | Cuckoo \| Blaco Hill Farm Cottages | 4 | 2020/09/Cuckoo-entrance.jpg, Cuckoo-bathroom.jpg, Cuckoo-master.jpg, Cuckoo-lounge2.jpg, Cuckoo-twin.jpg; map 2023/09/cottage-map-cottage4.jpg |
| `/our-cottages/nightingale` | Nightingale \| Blaco Hill Farm Cottages | 2 | 2020/10/Nightingale-living.jpg, Nightingale-bath.jpg, Nightingale-living2.jpg, Nightingale-bed2.jpg, Nightingale-bed.jpg; map 2023/09/cottage-map-cottage8.jpg |
| `/our-cottages/skylark` | Skylark \| Blaco Hill Farm Cottages | 2 | 2020/10/skylark-exterior.jpg, skylark-living.jpg, skylark-bedroom.jpg, skylark-bedroom2.jpg, skylark-bath.jpg; map 2023/09/cottage-map-cottage7.jpg |
| `/our-cottages/wren` | Wren \| Blaco Hill Farm Cottages | 2 | 2020/10/wren-master.jpg, wren-living.jpg, wren-kitchen.jpg, wren-bath.jpg, wren-masterbedroom.jpg; map 2023/09/cottage-map-cottage2.jpg |
| `/our-cottages/mallard` | Mallard \| Blaco Hill Farm Cottages | 2 | Shared "Pheasant" set: 2020/09/Pheasant-kitchen.jpg, Pheasant-master1.jpg, Pheasant-twin.jpg, Pheasant-dining.jpg, Pheasant-lounge.jpg, Pheasant-exterior2.jpg, Pheasant-twin2.jpg, Pheasant-lounge2.jpg; map 2023/09/cottage-map-shedC.jpg. Page heading reads "Old Cart Shed C". |
| `/our-cottages/grey-goose` | Greygoose \| Blaco Hill Farm Cottages | 2 | Same Pheasant set; map 2023/09/cottage-map-shedD.jpg. Heading "Old Cart Shed D". |
| `/our-cottages/woodcock` | Woodcock \| Blaco Hill Farm Cottages | 2 | Same Pheasant set; map 2023/09/cottage-map-shedE.jpg. Heading "Old Cart Shed E". |

### FAQ index

| URL | Title tag | Media |
|---|---|---|
| `/about/faq` | FAQ \| Blaco Hill Farm Cottages | None in content |

### FAQ detail (16 posts)

No images in any post content. Title tag is `{Question} \| Blaco Hill Farm Cottages`.

| URL | Question (title tag prefix) | Category |
|---|---|---|
| `/do-i-need-travel-insurance` | Do I need travel insurance? | FAQ |
| `/will-i-receive-a-refund-if-i-cancel` | Will I receive a refund if I cancel? | **Uncategorized** |
| `/what-is-your-cancellation-policy` | What is your cancellation policy? | FAQ |
| `/what-internet-speeds-can-i-expect` | What internet speeds can I expect? | FAQ |
| `/do-you-have-wifi` | Do you have wifi? | FAQ |
| `/are-your-cottages-child-friendly` | Are your cottages child friendly? | FAQ |
| `/where-should-i-park` | Where should I park? | FAQ |
| `/what-length-of-stays-do-you-offer` | What length of stays do you offer? | FAQ |
| `/how-do-i-pay` | How do I pay? | FAQ |
| `/what-time-can-i-check-in-on-arrival-and-what-time-do-i-have-to-vacate-the-property-by-on-my-departure` | What time can I check in on arrival and what time do I have to vacate the property by on my departure? | FAQ |
| `/do-you-accept-pets` | Do you accept pets? | FAQ |
| `/do-you-have-any-laundry-facilities-we-can-use` | Do you have any laundry facilities we can use? | FAQ |
| `/i-am-disabled-are-your-properties-suitable-for-me` | I am disabled. Are your properties suitable for me? | FAQ |
| `/are-towels-and-linen-provided` | Are towels and linen provided? | FAQ |
| `/are-longer-term-lets-available` | Are longer-term lets available? | FAQ |
| `/are-these-holiday-lets-suitable-for-families` | Are these holiday lets suitable for families? | FAQ |

Media library items attached to post 433 but not shown in any post content: 2020/09/checkout.jpg, pets.jpg, laundary.jpg, disabled.jpg, carparking.jpg, calendar.jpg, family-freindly.jpg, TOWELS2.jpg (and TOWELS.jpg). These may have been FAQ thumbnails in an earlier design.

### Testimonial index

| URL | Title tag | Media |
|---|---|---|
| `/about/testimonials` | Testimonials \| Blaco Hill Farm Cottages | None in content |

### Testimonial detail (12 posts)

No images. Title tag is `{Post title} \| Blaco Hill Farm Cottages`. Titles contain an en dash (content, ported as is).

| URL | Post title |
|---|---|
| `/weekend-away-rebecca-p` | Weekend away – Rebecca P |
| `/fantastic-girls-weekend` | Fantastic girls weekend – Pho3nix1705 |
| `/family-weekend-away` | Family weekend away – Deborah W |
| `/amazing-family-get-together` | Amazing family get together – Charris-ment |
| `/very-good-value-for-money` | Very good value for money – Pip W |
| `/excellent-and-great-location` | Excellent and great location – Mrs G Dundee |
| `/brilliant-place-to-stay` | Brilliant place to stay! – dollyface99 |
| `/perfect-highly-recommended` | Perfect-highly recommended! – dollyface99 |
| `/wonderful` | Wonderful – Lorraine D |
| `/highly-recommended` | Highly recommended! – Burl Brown |
| `/perfect-countryside-retreat` | Perfect countryside retreat – Alex Smith |
| `/wonderful-country-views-in-cosy-newly-converted-barns` | Wonderful country views in cosy newly converted barns – Sue and John |

### Contact or enquiry

| URL | Title tag | Form | Media |
|---|---|---|---|
| `/contact-us` | Contact us \| Blaco Hill Farm Cottages | Contact Form 7: Name, Telephone, Email Address, Message; button "Submit" | None in content. Includes "Driving Directions" (from the A1 southbound / northbound). No map embed. |
| `/booking-request-form` | Booking request form \| Blaco Hill Farm Cottages | Contact Form 7: Name, Telephone, Email Address, Message; button "Submit" | None |
| `/ask-us-a-question` | Ask us a question \| Blaco Hill Farm Cottages | Name, Telephone, Email Address, Message; button "Submit" | None |
| `/calendar` | Cottage Availability \| Blaco Hill Farm Cottages | Name, Email Address, Message | None. No live calendar: text asks visitors to use the form. |

### General content

| URL | Title tag | Media |
|---|---|---|
| `/about` | About \| Blaco Hill Farm Cottages | 2020/08/blaco-hill-farm.jpg, 2020/09/the-farm.jpg, the-lake.jpg, the-pature.jpg, the-lake-view.jpg, geese.jpg, explore.jpg, the-view.jpg |
| `/about/games-room` | Games Room \| Blaco Hill Farm Cottages | 2020/09/games-room-sitting-area.jpg, gamesroom-table-tennis.jpg, games-room-tablefootball.jpg, games-room-library.jpg |
| `/about/local-interests` | Local Interests \| Blaco Hill Farm Cottages | 2020/09/badger.jpg, Meet-Honey-and-Sunny-at-Sundown-Adventureland-this-Mothers-Day.jpg, lion-small.jpg, paintball.jpg, horseracing.jpg, waterpark.jpg, 2020/10/archery-target.jpg, 2020/09/golf.jpg, aqua-park.jpg |
| `/checking-in-checkout-process` | Checking in & Checkout Process \| Blaco Hill Farm Cottages | 2020/09/arrive.jpg, leave.jpg, literature.jpg |
| `/modern-slavery` | *(new, Phase 4)* | `[MODERN_SLAVERY_TEXT]` |

### Policy

| URL | Title tag | Media |
|---|---|---|
| `/cookies` | Cookies \| Blaco Hill Farm Cottages | None |
| `/privacy-policy-2` | Privacy Policy \| Blaco Hill Farm Cottages | None |
| `/disclaimer` | Disclaimer \| Blaco Hill Farm Cottages | None |

### Accessibility statement

| URL | Title tag | Media |
|---|---|---|
| `/accessibility-statement` | Accessibility Statement \| Blaco Hill Farm Cottages | 2020/09/swift-entrance.jpg, nightingale.jpg (used 3 times: Nightingale, Skylark, Wren sections), Chaffinch-lounge.jpg, Cuckoo-entrance.jpg, Pheasant-exterior2.jpg, swallow-master.jpg |

### Category archives (decision needed)

| URL | Title tag | Notes |
|---|---|---|
| `/category/faq` | FAQ \| Blaco Hill Farm Cottages (as reported) | 15 posts, 6 per page, "Older Entries" to `/category/faq/page/2` |
| `/category/testimonial` | not fetched | 12 posts |
| `/category/uncategorized` | not fetched | 1 post (the refund FAQ) |

### Leftover pages (decision needed)

| URL | Title tag | Content |
|---|---|---|
| `/sample-page` | Sample Page \| Blaco Hill Farm Cottages | Default WordPress sample page text |
| `/booking-test` | Booking test \| Blaco Hill Farm Cottages | Footer strapline plus shortcode `[abc-single calendar=1]` (Advanced Booking Calendar plugin), not rendering |

Also in the sitemap but excluded: `/wp-sitemap-users-1.xml` (author archive).

## Forms

| Form | Where | Fields |
|---|---|---|
| Full enquiry (Contact Form 7) | `/contact-us`, `/booking-request-form`, `/ask-us-a-question` | Name, Telephone, Email Address, Message. None marked required. Button "Submit". |
| Quick message ("Send us a message") | Most other pages, including all cottages, `/calendar`, policy pages | Name, Email Address, Message. Button "Submit". |

Exact field `name` attributes and required flags to be confirmed from raw HTML in Phase 3.

## Media library

177 items in `/wp-json/wp/v2/media` (96 on page 1, 81 on page 2): JPEG photos, 5 PNG screenshots from 2020-09-16, SVG logos, PNG logos. Roughly 95 are used on live pages (listed above). Apparently unused, to be confirmed before deciding whether to download: `bed-and-breakfast-*.jpg` (18 files, 2020/08 and 2020/09), `main-image-test.jpg`, `2ndary-image-test.jpg`, `2ndary-image-test-crop.jpg`, `photo.jpg.png`, `photo.jpg-2.png`, `Screenshot-2020-09-16-*.png` (5), `Lounge2.jpg`, `Lounge3.jpg`, `Wren-1.jpg`, `Skylark-2.jpg`, `Nightingale-1.jpg`, `Swallow-1.jpg`, `Swift-2.jpg`, `Cuckoo-2.jpg`, `Cuckoo-2-1.jpg`, `Cuckoo-lounge.jpg`, `Cuckoo-kitchen-diner.jpg`, `Cuckoo-patio.jpg`, `Cuckoo-bathroom2.jpg`, `Chaffinch-entrance.jpg`, `Chaffinch-kitchen.jpg`, `swift-twin.jpg`, `skylark-main.jpg`, `Gamesroom_*` (2020/09, 5 files), `table-football.jpg`, `family.jpg`, `family-celebration-*.jpg`, `a-lion-cub-*.jpg`, `bird.jpg`, `bowling.jpg`, `cattle.jpg`, `crops.jpg`, `landscape*.jpg`, 2021/02 `IMG_8747-scaled.jpg`, `IMG_4081-scaled.jpg`, `blaco-hill-farm.jpg`, 2025/05 `IMG_0229.jpg`, `portrait-square-03.jpg`, `about1.png`, `about3.png`, `cottage-map-shedA.jpg`.

Note: `swallow-master.jpg` is used on the listing pages and the accessibility statement but not on the Swallow page itself.

**PDFs: none.** No page links to a PDF, and the media library contains no PDF. The only "maps" are the 13 `cottage-map-*.jpg` images (one per cottage).

## Issues found during the crawl

### Section 9 content checks

| # | Check | Result |
|---|---|---|
| 1 | No DVD player on any cottage page | **Pass.** "DVD" not found on any of the 11 cottage pages. |
| 2 | Swallow sleeps 5 | **Partial.** The Swallow page says "Sleeps five people", but the Swallow card on `/`, `/our-cottages` and `/for-four-people` still says **"Swallow - Sleeps 4"**, and Swallow is listed under "For four people". |
| 3 | No `enquiries@`, all `victoria@` | **Fail.** `/privacy-policy-2` still contains `enquiries@blacohillcottages.co.uk`. Since the privacy text is being replaced by Steve anyway, this may resolve itself. |
| 4 | FAQ: internet speeds | **Pass.** `/what-internet-speeds-can-i-expect` present. Live copy has typos: "around the nations average", "It will supports streaming". |
| 5 | FAQ: pets, all except Cuckoo | **Pass.** "Yes, we welcome pets in all of our cottages except Cuckoo." |
| 6 | FAQ: cancellations | **Pass.** `/what-is-your-cancellation-policy` present. Live copy has typos: "spending on the time between the cancelation and the booking may result in yoru deposit being lost." |
| 7 | FAQ: refunds discretionary | **Pass.** Present, but filed under **Uncategorized**, not FAQ. It still shows on `/about/faq`. |
| 8 | FAQ: travel insurance | **Pass.** `/do-i-need-travel-insurance` present. |

### Other issues

1. **Second old-server hostname.** 8 of the 11 cottage card images on `/`, `/our-cottages`, `/for-four-people` and `/for-two-people` load from `http://dev.blacohillcottages.co.uk/...` over plain HTTP. The URL-parity and "no old domain" checks must cover `dev.` as well.
2. **No meta descriptions anywhere.** "Port meta descriptions as they are" means porting none. Suggest Steve decides whether to write them later (would be logged as placeholders, not invented).
3. **Odd slugs kept as is:** `/our-cottages/chaffinch-2`, `/privacy-policy-2`.
4. **Name inconsistency:** "Greygoose" (page title) vs "Grey Goose" (`/for-two-people`). Mallard, Greygoose and Woodcock pages lead with "Old Cart Shed C/D/E" rather than the cottage name, and share one set of "Pheasant" photos.
5. **No live availability calendar.** `/calendar` is text plus a form.
6. **Copyright year** in the footer is 2020.

## Decisions needed from Steve (Checkpoint 1)

1. **Template list.** Confirm adding: cottage listing, testimonial index, and a single "post detail" template shared by FAQ and testimonial posts.
2. **Category archives** (`/category/faq`, `/category/testimonial`, `/category/uncategorized`, `/category/faq/page/2`): rebuild as simple lists, or redirect to `/about/faq` and `/about/testimonials`?
3. **`/sample-page` and `/booking-test`:** drop them (with a redirect to `/`), or keep to honour "every URL"?
4. **PDF map.** There are no existing PDF map links to replace. Where should `/maps/cottage-map-2026.pdf` be linked: in place of (or alongside) each cottage's `cottage-map-*.jpg`, from Checking in, from Contact, or all of these? And should the 13 map JPGs be retired?
5. **Swallow "Sleeps 4" cards:** port as live (faithful) or correct to 5 and move Swallow out of "For four people"? The brief says the change is already live, so this looks like a missed edit.
6. **Live typos** in the cancellation and internet-speed FAQs: port verbatim, or fix?
7. **Unused media:** download only what live pages use (recommended), or the whole library?
8. **Recent Posts / Recent Comments / search sidebar** on post pages: port or drop? Comments are not used.
