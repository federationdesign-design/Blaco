# Checkpoint 3: templates and content port

## What was built

**Content pipeline** (run with `npm run content`):

1. `agent/scripts/extract-content.mjs` reads the raw HTML of every live page into structured JSON: sections, rows, columns and modules, with backgrounds, links, forms and images rewritten to local paths. It writes a readable outline to `agent/extract/outline.md`.
2. `agent/scripts/build-content.mjs` turns that into `content/pages/*.json` (one file per URL), `content/posts.json` and `content/index.json`. It applies the Checkpoint 1 and 2 decisions and logs every deliberate change to `agent/extract/changes.json`.
3. `agent/scripts/media-dimensions.mjs` records the real pixel size of every image in `content/media.json`, so every `next/image` has a correct width and height.

**Routing:** `app/page.tsx` serves the home page. `app/[...slug]/page.tsx` statically generates the other 57 URLs exactly as they are on live, including root-level FAQ and testimonial slugs. Titles are ported as `{title} | Blaco Hill Farm Cottages`, and the home page keeps its own title. No page on live has a meta description, so none are set. Unknown URLs return 404, because `dynamicParams` is off.

**Redirects** (`next.config.ts`, all 308 permanent): the category archives and `/category/faq/page/2`, `/sample-page`, `/booking-test`, and `/our-cottages/chaffinch` to `/our-cottages/chaffinch-2`.

**Templates** (all 10 from decision 1):

| Template | Pages | Component |
|---|---|---|
| home | 1 | Section renderer; the slider becomes a swipeable hero |
| cottage | 11 | `CottageTemplate` (mobile order below) |
| cottage listing | 4 | Section renderer; cottage cards |
| FAQ index | 1 | Section renderer plus `PostList` |
| testimonial index | 1 | Section renderer plus `PostList` |
| post detail | 28 | `PostTemplate` (FAQ and testimonials) |
| contact or enquiry | 4 | Section renderer; forms |
| general content | 4 | Section renderer |
| policy | 3 | Section renderer |
| accessibility statement | 1 | Section renderer |

Eight templates share one section renderer (`app/components/blocks/Sections.tsx`), because the live pages are built from the same ten or so Divi blocks. Each block has its own mobile-first layout: hero, band, reviews, amenities, cottage cards, contact block, toggles, counters, gallery and forms. Every page's wrapper carries `data-template`, so each template can be styled on its own when you refine the mobile views.

**Mobile-first behaviour:**

- Columns stack at 390px, pair up at 768px and take their live widths at 1024px.
- Images and galleries run edge to edge on phones.
- Galleries and reviews swipe sideways using native scroll snap, with no script.
- Toggles are `<details>` elements, so they open by tap.
- Phone numbers and email addresses in the contact blocks are `tel:` and `mailto:` links.
- **Cottage pages (brief 5.10):** on mobile the order is name, then rooms and sleeps, then the features list, then Check Availability, then the description, then the gallery. From 1024px the live order returns, with the description beside the features.

## Verification

| Check | Result |
|---|---|
| `./node_modules/.bin/tsc --noEmit` | Clean |
| `npm run build` | Succeeds, 58 pages prerendered |
| `:global` audit | No bare selectors (none used at all) |
| Em dashes | None in code, content or docs |
| Content parity (`agent/PARITY.md`) | 58 pages compared, **0 unexplained differences**. Every difference is listed with its reason. |
| URL parity (`agent/scripts/url-parity.mjs`) | 65 URLs checked: 58 return 200, 7 redirect as decided |
| Old domain (`blacohillcottages.co.uk/wp-content`, `dev.blacohillcottages.co.uk`) | No references in `app/`, `content/`, `public/` or the built output. The only mention of the domain is the privacy policy's own text, "Our website address is: http://www.blacohillcottages.co.uk". |
| Layout (`agent/scripts/screenshots.mjs`) | No horizontal overflow on any of the 58 pages at 360, 390, 1280 or 2800px. Every tap target outside running text is at least 44px at 390 and 1280. |

### Section 9 content checks

| # | Check | Result |
|---|---|---|
| 1 | No DVD player on any cottage page | **Pass** for the 11 cottage pages. See question 1: "DVD Player" is still on the home page and in the accessibility statement. |
| 2 | Swallow sleeps 5 | Pass. Home, `/our-cottages`, the Swallow page and the accessibility statement all show 5. Swallow's card has moved to `/for-six-people`. |
| 3 | No `enquiries@` | Pass (the privacy page was changed, decision 6) |
| 4 | FAQ: internet speeds | Pass, typos fixed |
| 5 | FAQ: pets in all except Cuckoo | Pass |
| 6 | FAQ: cancellations | Pass, typos fixed |
| 7 | FAQ: refunds discretionary | Pass |
| 8 | FAQ: travel insurance | Pass |

## Screenshots (`agent/screenshots/`)

Full-page JPEGs at 390px and 1280px: `home`, `cottage` (Swift), `cottage-swallow`, `listing` (For six people), `faq-index`, `testimonial-index`, `post-faq`, `post-testimonial`, `contact`, `enquiry-form`, `general` (About), `general-gallery` (Games Room), `policy` (Privacy), `accessibility`. Also `shell-390-menu-open`.

**Replacement background (Checkpoint 2 decision 6):** `-scaled-1.jpg` is behind the green "Guest Reviews" band. To judge it, see `cottage-390`, `cottage-1280`, `home-390`, `home-1280` and `enquiry-form-*`.

## Deliberate differences from live

All of these are listed page by page in `agent/PARITY.md` and `agent/extract/changes.json`.

1. Decisions 4, 5 and 6 applied:
   - The 2026 site map replaces the 11 per-cottage maps.
   - Swallow sleeps 5.
   - The typos in the internet-speed and cancellation FAQs are fixed.
   - `enquiries@` becomes `victoria@` on the privacy page.
2. **Site map placement.** The map is shown full width and uncropped below each cottage's gallery, not in the gallery slot. Squaring it off to the gallery's 4:3 crop would cut off its key.
3. **Home slider.** The three live slides all repeat the same heading, so it is shown once over three swipeable photos with dot buttons. There is no autoplay.
4. **FAQ index** lists the 16 FAQs only. On live, the Divi blog module wasn't filtered by category and also showed four testimonials.
5. **Social icons dropped.** Every social link on live points to `#`.
6. **Broken links fixed.**
   - Cards linking to `/our-cottages/chaffinch` (a 404 on live) now point to `chaffinch-2`.
   - The Swift card image on `/for-six-people` linked to Swallow on live; it now links to Swift.
   - Three buttons with no link on live now have one: "Request a booking" on Local Interests and Checking in, and "Check Availability" on Contact.
7. **Contact map.** The live Google Map module is replaced by a link to Google Maps at the map's centre. The live pin is Divi's default San Francisco location. An embedded map would need an API key and cookie consent.
8. **Counter numbers** (for example 6 / 3 / 2 bedrooms) are shown as static numbers. Live counts them up with JavaScript from the same values.
9. **Form labels** are visible labels with a required marker. Live uses placeholders and hidden labels.
10. **Post pages** have a small FAQ or Testimonials link above the title, and the dropped sidebar (decision 8).

## Not yet done (Phase 4)

- Forms have the live fields, labels and required flags, and post to `/api/enquiry`. That route handler (Resend, validation, honeypot, success and error states) is Phase 4, so submitting a form returns a 404 until then.
- Cookie banner, GA4, `/modern-slavery`, `sitemap.ts` and `robots.ts`.

## Questions for Steve

1. **DVD players.** The brief's check covers cottage pages only, and they pass. But "DVD Player" appears in the home page's facilities paragraph and amenities list, and several cottages in the accessibility statement list "Digital TV & DVD Player". Remove these too, or port as live?
2. **Inconsistent live copy**, ported as it is:
   - The About page's FAQ toggles have older answers that disagree with the FAQ posts. For example, pets are "some of our holiday cottages" there but "all except Cuckoo" in the FAQ, and parking is "up to 10 cars".
   - The About counter says 12 cottages and the About text says "12 self catering properties", but everywhere else says eleven.
   - Should I align any of these?
3. **Cancellation FAQ.** The minimal typo fix leaves "Depending on the time between the cancellation and the booking may result in your deposit being lost." That is still ungrammatical. Would you like to supply wording, or leave it as is?
4. **Alt text.** Almost every live image has empty alt text. The port derives alt text from the file names, for example "Swift entrance" or "Pheasant lounge". Decorative backgrounds and avatars stay empty. Keep these, or would you like to supply proper descriptions? The Mallard, Grey Goose and Woodcock pages use the "Pheasant" photos, so their alts say "Pheasant".
5. **Green bands.** White body text sits on the brand green gradient in the "We have availability" and "Guest Reviews" bands. I added a light dark wash under the gradient for legibility. Please check it on a phone in the screenshots.
6. **Privacy policy** still contains WordPress boilerplate, including a mention of "VFS Global". It is ported as is because you are supplying new wording.
