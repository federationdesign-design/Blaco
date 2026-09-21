# Decisions

Recorded at Checkpoint 1 (approved by Steve, 2026-09-21). Where anything here conflicts with `BRIEF.md`, this file wins.

## Checkpoint 1

1. **Templates.** The extra templates are approved: cottage listing, testimonial index, and a single shared detail template for FAQ and testimonial posts. Full list: home, cottage, cottage listing, FAQ index, testimonial index, post detail (FAQ and testimonial), contact or enquiry, general content, policy, accessibility statement.
2. **Category archives** redirect permanently:
   - `/category/faq` and `/category/faq/page/2` to `/about/faq`
   - `/category/testimonial` to `/about/testimonials`
   - `/category/uncategorized` to `/about/faq` (its only post is the refunds FAQ)
3. **Leftover pages.** `/sample-page` and `/booking-test` are dropped and redirect permanently to `/`.
4. **Map.** Supersedes brief section 6 "PDF map".
   - Render `~/Downloads/cottage map-cottage-2026.pdf` to a high-resolution JPG, at least 2400px wide, saved as `public/maps/cottage-map-2026.jpg`.
   - Use it in place of the per-cottage map image on every cottage page.
   - Retire all 13 `cottage-map-*.jpg` files. They are not downloaded or referenced.
   - If the PDF has more than one page, or cannot be rendered sharply, stop and report.
   - The PDF itself is not published, so there is no `/maps/cottage-map-2026.pdf` link.
5. **Swallow sleeps 5 everywhere.** Every card and heading shows "Sleeps 5". Swallow moves from `/for-four-people` to `/for-six-people`.
6. **Copy fixes.** This overrides "port faithfully" for these items only:
   - Fix the typos in `/what-is-your-cancellation-policy` and `/what-internet-speeds-can-i-expect`.
   - Change `enquiries@` to `victoria@` on `/privacy-policy-2`.
   - The parity report (brief section 8.5) lists these as intended differences, not failures.
7. **Media.** Download only the media that the live pages use. Unused items in the media library are left behind.
8. **Post sidebar.** Drop the search box, Recent Posts and Recent Comments sidebar from FAQ and testimonial detail pages.
9. **Old-domain check.** The check in brief section 8.7 covers both `blacohillcottages.co.uk/wp-content` and `dev.blacohillcottages.co.uk`.

## Checkpoint 2

Approved by Steve, 2026-09-21.

1. **Green contrast.** Keep the split. `--colour-green-dark` `#008454` for buttons, links and small text. Brand `--colour-green` `#00a86b` for large text, rules and gradients.
2. **Enquire** stays pointing to `/booking-request-form`.
3. **Header search box** is dropped.
4. **Mobile menu** keeps the repeated "About" and "All Cottages" child links hidden.
5. **Footer** gains the phone number and email address, as `tel:` and `mailto:` links.
6. **Missing background.** Use `2020/08/family-celebration-or-a-garden-party-outside-in-th-PGN6JPD-scaled-1.jpg` in place of the 404ing `-scaled.jpg`. Include it in the Checkpoint 3 screenshots for review.
7. **Copyright year** updates automatically.

## Checkpoint 3

Approved by Steve, 2026-09-21, with these changes.

1. **Font stack.** Wherever Baskervville is used, the declaration is exactly `font-family: 'Baskervville', Georgia, "Times New Roman", serif;`.
2. **DVD.** Remove "DVD Player" from the home page and the accessibility statement as well as the cottage pages.
3. **About page.** Align its FAQ toggle answers to the current FAQ pages, and change "12 cottages" to eleven.
4. **Cancellation FAQ.** Replace the ungrammatical sentence with "Depending on how close to your arrival date you cancel, you may lose your deposit."
5. **Alt text.** View each image and write alt text describing what it actually shows. Never derive it from file names.
6. **Green bands.** Keep the dark wash under white text on the green bands.

## Checkpoint 4

Approved by Steve, 2026-09-21.

1. **Modern slavery page** keeps the name "Modern Slavery Statement".
2. **About page FAQs** stay as they are (the parking toggle and the four newer FAQs are not changed or added).

### Liquid, full-width layout

This overrides every max-width rule in `BRIEF.md` and earlier decisions.

1. No page container, section or text block is capped at any width. (The build had no 1100px cap; the caps removed were the 80rem content container, the 68ch text measure, 48rem forms, the 40ch footer strapline, the 30rem footer rule and the 45rem cookie panel.)
2. Side gutters scale with the viewport using `clamp()`, not fixed pixels.
3. Type keeps scaling with viewport width all the way to 2800px and does not stop growing at 1440px.
4. Images, galleries, hero slides and cards scale up with the width, and every `next/image` `sizes` attribute serves files large enough for large screens.
5. An image whose original is smaller than its display size at 2800px is never stretched into blur. Such images are listed with their original sizes in `agent/CHECKPOINT-5.md` so Steve can supply larger versions.
6. Column counts per breakpoint stay as they are; cards grow rather than multiply.

## Checkpoint 5

Approved by Steve, 2026-09-21.

1. **Image enlargement.** Images may be enlarged up to 1.25× anywhere (`TOLERANCE` in `agent/scripts/image-fit.mjs`). Beyond that they fall back to natural size. `agent/CHECKPOINT-5.md` keeps the table of undersized images, updated for this limit, so larger originals can be supplied later.
2. **Reading measure.** On text-heavy pages only (the policy pages, the accessibility statement, the modern slavery page, and the FAQ and testimonial detail pages), the text column is limited to a comfortable measure of around 75 characters. The limit is in `ch`, so it scales with the type and stays about 75 characters at every width. Page layout, backgrounds and images stay full width. This is the one exception to the no-cap rule in the Checkpoint 4 liquid layout decision.
