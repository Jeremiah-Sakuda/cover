# Cover — panel assessment

**60.7/100**, averaging three independent mock judges. Individual totals: **60–61/100**. Evaluated commit: `138276ab3867090b1b3772ba0e7d00062b510844`. This is not an official result or prize prediction.

Cover demonstrates a coherent paid-review transaction: explicit spending consent, published terms, a human review, and capture or release. All three judges valued separating payment from whether the recipient likes the proposal. The weakest part of the case is whether senders will pay for the resulting review and recipients can deliver useful attention at the proposed price. Actual PayPal/Gemini execution and a recorded pitch are also missing.

## Independent scorecards

Each criterion is /10 with equal weight. Total = 2 × sum. Means use unrounded values and are displayed to one decimal.

| Judge | Technology | Design | Impact | Innovation | Presentation | Total /100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [Technical](technical.md) | 6.0 | 7.0 | 5.5 | 6.5 | 5.5 | 61 |
| [Product/design](design.md) | 6.0 | 7.0 | 5.5 | 6.5 | 5.5 | 61 |
| [Impact/innovation](impact.md) | 6.5 | 7.0 | 5.0 | 6.5 | 5.0 | 60 |
| **Panel mean** | **6.2** | **7.0** | **5.3** | **6.5** | **5.3** | **60.7** |

No reviewer saw another review before submitting scores. The impact judge was less persuaded by review quality and willingness to pay; the technical/design judges gave more credit to the working lifecycle and materials. The range indicates agreement on this rubric, not a statistical interval. All three marked readiness conditional.

## What was demonstrated

- The technical judge ran **12 passing tests**, a successful build, and an isolated HTTP lifecycle covering consent, submission, review/capture, appeal and refund, plus session/role/origin/content-type checks. The impact judge also ran the tests. No clean dependency installation was performed.
- The design judge completed the same central service flow in the browser, inspected 390px mobile behavior, refunded the reviewed proposal, and released the remaining holds by advancing the demo clock. Five screenshots support [the design report](design.md).
- The coordinator independently reran all five technical fixtures. See [the domain/adapter reproduction script](technical-repro.mjs) and [the isolated HTTP script](technical-http-repro.mjs). Both accept a source-root argument. Provider responses in the former are mocks; the latter uses simulated payments and disposable local data.
- No actual payment or model-provider requests were made. Connected adapter source is present; successful external operation remains unverified.

## First fixes and evidence to collect

| Priority | Finding and evidence | Smallest convincing resolution |
| --- | --- | --- |
| P1 | **A failed void dispatch can remain stuck.** The actual adapter with mocked transport produced one failed void attempt, repeated authorization reads, and an indefinitely reserved $5 `VOID_PENDING` state. [Void lookup](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/server/payments.mjs#L24). | Distinguish an unexecuted operation from a still-unknown result. Provide safe recovery using the retained operation identifier when supported, and actionable investigation when it is not. Verify the lifecycle against sandbox before claiming reliable release. |
| P1 | **A known failed capture is treated as unknown pending.** A mocked documented `DECLINED` result leaves `CAPTURE_PENDING` and reserved budget after reconciliation. [Completion mapping](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/server/store.mjs#L23). | Classify provider results by action: success, pending, terminal failure and transport uncertainty. Resolve the underlying authorization before releasing exposure. The moderator checked the fixture against the [official capture schema](https://developer.paypal.com/api/payments/v2/definitions/capture_status/). This is a reproduced reducer defect, not a real PayPal incident. |
| P1 | **Late-checkout recovery is implemented in the API but absent from the UI.** Expired checkout becomes `CANCELLED`; the API permits confirmation and void, while controls only cover awaiting/pending states. [Confirmation behavior](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/server/store.mjs#L50). | Expose a check-and-release action or worker for late authorization. This is source-inferred, not browser-reproduced; validate the exact delayed approval path before treating it as confirmed runtime evidence. |
| P1 | **Mobile error recovery and prerequisites are hard to find.** The observed review error appeared roughly 1,600px above the visible form; the disabled payment action offered no adjacent explanation of the missing mandate. [Interface](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/src/main.jsx#L26). | Put errors beside fields, focus the invalid field/summary, and place spending-limit setup before payment or provide a direct visible link. Recheck with an unfamiliar sender on a narrow screen. |
| P2 | **A reconciled refund leaves an appeal pending.** Mocked response loss followed by completed refund produces payment `REFUNDED`, earning `REVERSED`, appeal `REFUND_PENDING`. [Refund state](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/server/store.mjs#L54). | Put appeal closure in the shared confirmed-refund transition; test immediate and reconciled success. Show the operator's explanation in the receipt. |
| P2 | **Retry equality omits material fields.** Changing price, category and evidence URL under the same idempotency key silently returns the old proposal because the hash covers company/title/body only. [Fingerprint](https://github.com/Jeremiah-Sakuda/cover/blob/138276ab3867090b1b3772ba0e7d00062b510844/server/store.mjs#L16). | Separate content deduplication from a complete normalized request fingerprint, including accepted terms. This observation did not produce a duplicate charge. |

No P0 was assigned: the supported simulated lifecycle completed. Fixing these issues requires focused state and interaction changes, not a new infrastructure platform.

## Product and AI evidence

The impact judge reproduced a generic rejection triggering a simulated charge when accompanied by an exact short quote and confirmations. That is a limitation of the review-quality promise, not proof of a consent bypass. Pilot a few proposals with real senders and recipients; ask senders to rate usefulness, retain negative feedback, and measure recipient review time and appeal handling. Explain what distinguishes an inadequate review from an unwelcome decision.

Both technical and impact judges found that local screening rejects a proposal saying it **does not** sell lead lists. The impact judge also found that irrelevant catering offered to a finance team could receive a submit recommendation. These are labeled keyword-fallback limitations, not observed Gemini failures. Run a frozen contextual-fit evaluation against actual Gemini output, including negation, irrelevant keywords, ambiguity and misleading claims; compare human correction effort to the baseline.

Pitch the implemented product as agent-assisted review purchasing. The current sender chooses what to submit and each sandbox purchase requires buyer approval; autonomous opportunity discovery and unattended purchasing were not demonstrated. Keep internal $3 earnings distinct from a payout.

## Readiness and next iteration

The original repository was independently confirmed **private**. MIT licensing and local run instructions are present. A public repository and a public video under three minutes remain submission gaps; hosting is optional under the [official rules](https://paypalaihackathon.devpost.com/rules). All judges consider provider-use evidence insufficient to assure stage-one passage; that determination belongs to the organizer.

Recommended order: fix settlement recovery and late authorization handling; correct mobile errors/prerequisites; show one genuine sandbox authorization/capture/refund and a separate expiry/void with one actual Gemini assessment; collect a small set of useful-review observations; record the focused demo and publish the submission. Keep the single-recipient scope until its value is demonstrated.

Full feedback: [technical](technical.md), [design](design.md), [impact/innovation](impact.md). Each scorecard has JSON alongside it. This panel assessed Cover on its own; no comparison with sibling projects informed its scores.
