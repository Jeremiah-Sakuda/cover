# Cover round-two browser verification

## Provenance

The coordinator operated an isolated build from **a40f89b** in the in-app browser and supplied the observations below. This packaging pass inspected all six saved screenshots and produced the narrated preview; it did not independently repeat the browser interactions. All application data and payments were synthetic. No PayPal/Gemini requests were made.

The later implementation at **3a76966** adds refund/provider operation IDs to activity receipts and migrates legacy cancelled checkout records into a conservatively reserved expired-checkout state. Those changes passed local tests/build and are not claimed to appear in the a40f89b screenshots. The final judging snapshot includes the later implementation plus these evidence documents.

## Observed browser workflow

- At **375px**, the coordinator found no horizontal page overflow. Important copy and controls reflowed in the tested states.
- With fee consent accepted and no active mandate, payment remained disabled. **Set spending limits** moved focus to the mandate panel.
- The sender enabled the spending mandate, assessed the Acorn invoice-reconciliation proposal, and authorized a simulated $5 hold.
- Mobile proposal selection opened the detail view. The recipient opened the complete proposal before review.
- Attempting an empty charge focused a linked **five-error summary** in the review form. The screenshot shows exact-quote, rationale, next-step, reading and fee-confirmation guidance within the mobile viewport.
- The recipient supplied an exact quote, a content-specific reason and next step, then confirmed reading and the fee. The receipt showed **$5 captured** with quote, rule, rationale and next step.
- The sender appealed; the operator supplied a refund reason. The resulting receipt and appeal both showed **REFUNDED**, and the operator reason remained visible in the persisted application state.

These are coordinator-observed local interactions, not independent user research. The selectable operator role is not evidence of independently staffed dispute review.

## Retained artifacts

| Capture | Evidence |
| --- | --- |
| [Inbox](demo/frames/01-inbox.png) | Desktop queue, explicit simulation mode, held-fee and review-window context |
| [Prerequisite](demo/frames/02-prerequisite.png) | 375px fee agreement, disabled payment and direct spending-limit action |
| [Assessment](demo/frames/03-assessment.png) | Exact source evidence, local-rules attribution and mandate limits |
| [Mobile validation](demo/frames/04-mobile-validation.png) | Visible linked five-error summary within the recipient review form |
| [Capture receipt](demo/frames/05-receipt.png) | Quoted passage, rule, reason, next step and simulated captured fee |
| [Refund](demo/frames/06-refund.png) | Refunded receipt, resolved appeal and retained operator explanation |

[The local narrated preview](demo/README.md) uses those screenshots as edited still scenes, not a continuous recording. Its metadata records the actual capture commit. The original image dimensions are preserved; the video fits them into 1280×720 without cropping. Full narration is available as a transcript.

## Verification limits

The remediation implementation passed 22 domain/adapter tests and a production build. A separate fresh installation from the local npm cache at a40f89b passed the then-current 21 tests/build; final snapshot installation results are recorded in the coordinator's judging manifest. Mocked provider recovery and synthetic labels do not prove live integration or demand.

No full accessibility audit, screen-reader trial, 200% zoom audit, independent participant usability study, live payment, live model comparison, or public YouTube publication is claimed. The repository is now public after the user's explicit approval and the coordinator's successful Git history secret scan; that does not remove the other submission evidence gates.
