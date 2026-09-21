# Placeholders and missing inputs

| Placeholder | Where | Needed from Steve |
|---|---|---|
| `[MODERN_SLAVERY_TEXT]` | `/modern-slavery` (Phase 4) | Modern slavery page content |
| Cookie policy text | `/cookies` | Updated wording (existing page ported as is until then) |
| Privacy policy text | `/privacy-policy-2` | Updated wording (existing page ported as is until then) |
| `RESEND_API_KEY`, `RESEND_FROM` | Vercel environment | Set once Resend is configured |
| Missing background image | 14 pages, Guest Reviews band | Resolved at Checkpoint 2: `-scaled-1.jpg` is used. Steve to judge it in the Checkpoint 3 screenshots. |
| Enquiry form sending | Every form (posts to `/api/enquiry`) | Built in Phase 4. Until then, submitting a form returns a 404. |
| Meta descriptions | Every page | None exist on live, so none are set. Supply wording if wanted. |
| Image alt text | Galleries and cards | Live alts are empty. The port derives them from file names (see CHECKPOINT-3.md, question 4). |
