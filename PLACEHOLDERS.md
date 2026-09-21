# Placeholders and missing inputs

| Placeholder | Where | Needed from Steve |
|---|---|---|
| `[MODERN_SLAVERY_TEXT]` | `/modern-slavery` (Phase 4) | Modern slavery page content |
| Cookie policy text | `/cookies` | Updated wording (existing page ported as is until then) |
| Privacy policy text | `/privacy-policy-2` | Updated wording (existing page ported as is until then) |
| `RESEND_API_KEY`, `RESEND_FROM` | Vercel environment | Set once Resend is configured |
| Missing background image | 14 pages, "We are open year round" / "We have availability" panels | `2020/08/family-celebration-...-PGN6JPD-scaled.jpg` returns 404 on the live site, so live visitors see only the green gradient. The library has `...-scaled-1.jpg`, which may be the intended image. Not used until Steve confirms. |
