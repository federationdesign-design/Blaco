# Checkpoint 4: new features and full verification

## Checkpoint 3 changes (recorded in DECISIONS.md)

| # | Change | Done |
|---|---|---|
| 1 | Baskervville stack | `app/globals.css` declares exactly `font-family: 'Baskervville', Georgia, "Times New Roman", serif;` on `body` and `h1` to `h6`. Everything else inherits it. The `--font-serif` token is gone. `next/font` registers the family under the literal name `Baskervville`. The browser reports the computed family as `Baskervville, Georgia, "Times New Roman", serif`, and the font loads. |
| 2 | DVD removed | Home: "DVD Player" removed from the facilities sentence, and its amenity dropped. Accessibility statement: removed from the five cottage lists, which now read "Digital TV". No "DVD" remains in the content or the build. |
| 3 | About page | Toggles now give the FAQ pages' answers where they differed: towels and linen, pets (all except Cuckoo), child friendly (the "ad" typo is fixed), wifi and parking. "12 self catering properties" becomes "eleven", and the counter becomes 11. |
| 4 | Cancellation FAQ | Now reads "...by emailing victoria@blacohillcottages.co.uk. Depending on how close to your arrival date you cancel, you may lose your deposit. Make sure you let us know with plenty of time." This also shows on `/about/faq`. |
| 5 | Alt text | I looked at all 87 content images one by one and wrote what each shows (`content/alt-text.json`). Nothing is derived from file names, and the build fails any image without reviewed alt text. Several file names are misleading: `wren-master.jpg` is a sitting room, `leave.jpg` is a camper van and `arrive.jpg` is a car roof box. Card images and home slider photos now carry this alt text too. Background images and review avatars stay decorative. |
| 6 | Green bands | The dark wash under white text is kept. |

## Phase 4 features

**Cookie consent (brief 6)**

- Ported from `~/Sites/LHM/app/components/cookies`: `consent.ts`, `CookieConsentProvider.tsx`, `Analytics.tsx` and `CookieBanner.tsx`. The logic is unchanged: localStorage record with a version number, Accept all / Reject all / Manage preferences, a footer "Cookie settings" control, and GA cookies cleared when consent is withdrawn.
- Changes for this repo:
  - The storage key is `blaco-cookie-consent`.
  - The policy link goes to `/cookies`.
  - The CSS is mobile first. LHM used `max-width` queries, which the brief forbids.
  - The settings button uses a CSS Module class, not LHM's inline style.
  - Every control is at least 44px.
  - The first-visit bar is a labelled region rather than `aria-modal`, because the page behind it stays usable.
- GA4 `G-TN54HGV0ME` is only rendered after analytics consent. Checked in a browser: no request to Google before a choice, a request after Accept all, and none after Reject all.

**Enquiry forms (brief 7)**

- Every form keeps its live fields and required flags:
  - Name, Email Address and Message on the quick form.
  - Name, Telephone, Email Address and Message on Contact, Booking request and Ask a question.
- Each form's live success message is ported from the Divi settings, for example "We aim to reply within 24hrs please check your junk mail just in case!".
- `app/api/enquiry/route.ts` sends through Resend to `victoria@blacohillcottages.co.uk`. The visitor's address is the reply-to. The email includes the form title and the page it was sent from.
- Server-side validation (`app/lib/enquiry.ts`) is shared with the browser: required fields, email and phone format, and length limits.
- Honeypot field: posts that fill it get a success response and are not sent.
- Works without JavaScript: a plain form post redirects back to the page with the result.
- Success, error and field-error states are announced to screen readers and focused. Screenshots: `form-390-errors`, `form-390-sent`, `form-390-error`.
- Environment: `RESEND_API_KEY` and `RESEND_FROM`, with placeholders in `.env.example`. With placeholder or missing keys, the route logs the problem and the form shows its error state with the phone number.

**Other**

- `/modern-slavery` uses the general content template with `[MODERN_SLAVERY_TEXT]`, and is linked from the footer as "Modern Slavery Statement".
- `app/sitemap.ts` lists all 59 pages (none of the redirected URLs). `app/robots.ts` allows crawling, disallows `/api/`, and points to the sitemap.
- PDF map: superseded by Checkpoint 1 decision 4 (the rendered JPG). No PDF is published.

## Verification (brief section 8)

| Check | Result |
|---|---|
| `./node_modules/.bin/tsc --noEmit` | Clean |
| `npm run build` | Succeeds: 59 pages, `/sitemap.xml` and `/robots.txt` static, `/api/enquiry` dynamic |
| `:global` audit | Clean |
| Em dashes | None in code, content or docs |
| `max-width` media queries | None |
| Screenshots | `agent/screenshots/`: every template at 390px and 1280px, plus the cookie banner and preferences at both widths, the three form states and the open mobile menu. 38 files. |
| Layout | No horizontal overflow on any page at 360, 390, 1280 or 2800px. Every tap target is at least 44px (including the banner), apart from links inside running text. |
| Content parity | `agent/PARITY.md`: 58 live pages, **0 unexplained differences**. Every approved change is listed as intended with its decision. The rule for `/about` only accepts words from the old toggle answers leaving and words from the FAQ pages arriving. |
| URL parity | 68 URLs: every live URL returns 200 or its decided 308 redirect. `/modern-slavery`, `/sitemap.xml` and `/robots.txt` return 200. |
| Old domain | No `blacohillcottages.co.uk/wp-content` or `dev.blacohillcottages.co.uk` in `app/`, `content/`, `public/` or the build output |
| Section 9 | All pass. No DVD anywhere, Swallow sleeps 5, no `enquiries@`, all five FAQs present with the approved wording |
| Phase 4 checks (`agent/scripts/phase4-checks.mjs`) | 16 of 16 pass: GA4 gating, stored choices, footer reopen, server validation, honeypot, clean failure without keys, no-JavaScript redirect staying on the site, sitemap, robots, modern slavery page and footer link |

Scripts: `npm run content` (rebuild content), `npm run parity` (content and URL parity), `npm run screenshots`, `node agent/scripts/phase4-checks.mjs`. The last three run against `next start`.

## For Steve

1. **Resend.** Set `RESEND_API_KEY` and `RESEND_FROM` in Vercel. `RESEND_FROM` must use a domain verified in Resend (out of scope for me). A real send has not been tested, because there is no key.
2. **Modern slavery.** I used "Modern Slavery Statement" for the page title and footer link. Change it if you prefer something else. The body is still `[MODERN_SLAVERY_TEXT]`.
3. **About page.** The "Do you have parking on site?" toggle ("parking for up to 10 cars") has no FAQ page, so it stays as it is on live. The About toggles also don't include the four newer FAQs (travel insurance, refunds, cancellation, internet speeds). Say if you want them added.
4. **Cookie and privacy policies** are still the live text, awaiting your wording. The privacy policy says the site uses Google Analytics, which is now true again but only with consent.
5. **Spam.** The honeypot is the only spam guard. If spam gets through after launch, the next step would be rate limiting or a CAPTCHA.
