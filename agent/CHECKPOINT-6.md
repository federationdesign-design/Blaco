# Checkpoint 6: image enlargement limit and reading measure

Both Checkpoint 5 decisions are recorded in `agent/DECISIONS.md`.

## 1. Images may be enlarged up to 1.25×

- `TOLERANCE = 1.25` in `agent/scripts/image-fit.mjs`, as asked. The layout check allows the same, plus rounding (1.255).
- The measurement grid is finer than before: 17 widths, every 80 to 160px from 1024px. Each image now fills its box for as long as the limit allows.
- `content/image-fit.json` records the **last measured width at which an image is still within the limit**. `app/globals.css` shows it at natural size from 1px above that width. So an image fills its box at every measured width within the limit, and never goes past 1.25× between measurements.
- The script refuses to run if `globals.css` lacks a rule for any width it uses.
- Checked on the home page's first slide (a 1024×768 original): at 1280px it fills the hero at exactly 1.25×, and from 1281px it holds at natural size.

**Result.** Of the 62 undersized image uses at 2800px:

- **27** are now enlarged by no more than 1.25× and fill their box at every width, up to and including 2800px. These are mostly gallery photos and the larger slides and backgrounds.
- **35** would need more than 1.25×. They fill their box up to the width listed and show at natural size above it. Below 1440px this affects only:
  - `2020/10/wren-exterior.jpg` (1000×700): Wren hero, fills up to 1152px.
  - `2021/02/blaco-hill-farm.jpg` and `2020/08/blaco-hill-farm.jpg` (1024×768): the first home slide and the About and Contact heroes, fill up to 1280px.

  Everything else fills up to at least 1760px.

The table in `agent/CHECKPOINT-5.md` is updated for the new limit, with how each image shows now and the original size needed to fill its box at 2800px without enlargement. `PLACEHOLDERS.md` points to it.

## 2. Reading measure on text-heavy pages

- **Pages:** the policy pages (Cookies, Privacy, Disclaimer), the accessibility statement, the modern slavery page, and all 28 FAQ and testimonial detail pages.
- **How:** the text column (`.prose`, and on detail pages the header and answer) is limited to `--measure: 73ch`. Everything else on those pages stays full width: sections, green bands, the contact block, images, the header and the footer. Narrow columns, such as the accessibility statement's room-by-room lists, are unaffected.
- **Why 73ch:** a Baskervville `0` (which sets the `ch` unit) is wider than the average character, so 73ch gives the target. I tuned it by counting the characters on every full line of body text (`agent/scripts/measure-check.mjs`):

| Viewport | 768 | 1280 | 1920 | 2800 |
|---|---|---|---|---|
| Full lines measured | 113 | 113 | 124 | 124 |
| Average characters per line | 75 | 75 | 75 | 75 |
| Longest line | 88 | 88 | 88 | 88 |

Because `ch` follows the font size, the measure grows with the type and stays at 75 characters from 768px to 2800px. At 390px the screen is narrower than the measure, so text runs gutter to gutter as before.

## Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm run build` | Succeeds, 59 pages |
| `:global` audit, em dashes, `max-width` media queries | Clean. The only `max-width` rules are the two global image overflow guards and the two approved reading measures. |
| Content parity (`agent/PARITY.md`) | 58 live pages, 0 unexplained differences |
| URL parity | 68 URLs pass (61 pages, 7 redirects) |
| Phase 4 checks | 16 of 16 pass |
| Layout checks | Every page at 360, 390, 1280, 1920 and 2800px: no horizontal overflow, no tap target under 44px, no image enlarged more than 1.25× |
| Old domain | None |

**Screenshots** (`agent/screenshots/`): every template at 390, 1280 and 2800px, retaken. Also the cookie banner, the preferences panel, the form states and the open mobile menu. For the reading measure, see `policy-*`, `accessibility-*`, `modern-slavery-*`, `post-faq-*` and `post-testimonial-*`.

## Note

An earlier run of the checks was pointed by mistake at port 3111, which turned out to be another local project of yours, and showed failures. Those results are void. Every result above comes from this build, served on port 4817.
