# Placeholders and missing inputs

| Placeholder | Where | Needed from Steve |
|---|---|---|
| `[MODERN_SLAVERY_TEXT]` | `/modern-slavery` | Modern slavery page content (page and footer link are live, titled "Modern Slavery Statement") |
| Cookie policy text | `/cookies` | Updated wording (existing page ported as is until then) |
| Privacy policy text | `/privacy-policy-2` | Updated wording (existing page ported as is until then) |
| `RESEND_API_KEY`, `RESEND_FROM` | Vercel environment (placeholders in `.env.example`) | Set once Resend is configured. `RESEND_FROM` must be on a domain verified in Resend. Until then, forms show their error state. |
| Meta descriptions | Every page | None exist on live, so none are set. Supply wording if wanted. |
| Larger image originals | 59 files listed in `agent/CHECKPOINT-5.md` (updated for the 1.25× limit) | Originals at least the listed size. Until supplied, 27 uses are enlarged by up to 1.25× and 35 show at natural size above the width listed. |
