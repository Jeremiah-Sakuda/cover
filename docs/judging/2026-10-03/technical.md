# Cover — independent technical judge

**Pinned commit:** `138276ab3867090b1b3772ba0e7d00062b510844`  
**Judge:** Technical / PayPal + AI implementation  
**Assessment date:** October 3, 2026 (local)  
**Artifact:** `/private/tmp/paypal-judge-20261003/cover`  
**Result:** **61/100**, with **conditional** stage-one readiness. This is a simulated assessment, not an organizer decision or prize prediction.

Cover is a substantial, coherent local prototype of a $5 paid human-review service. Its strongest technical choice is separating relevance assessment, human review, and financial authority. Its main judging weakness is the gap between a well-exercised simulation and demonstrated PayPal-plus-model operation. Recovery defects also affect the specific promise that an unreviewed hold can be released reliably.

## Scope and verification

I evaluated only the assigned frozen Cover source, its own documents and bundled preview, without reading peer reviews or other repositories. The snapshot reuses dependencies through a symlink. **A clean dependency installation was not performed.** Original repository visibility was supplied as PRIVATE by the coordinator; I did not independently query GitHub. No recorded video was supplied.

Observed on Node `v22.22.3`:

- `npm test`: **12/12 pass**. These cover meaningful domain cases, including consent, budget concurrency, an expiry race, an unknown capture and persistence; see `test/workflow.test.mjs:12–23`.
- `npm run build`: **passes**, Vite 6.4.3, 23 modules; generated JavaScript is 252.79 kB, 77.83 kB gzip.
- `node technical-repro.mjs /absolute/path/to/cover`: **five fixture observations reproduced**, detailed below. All data is in memory. The sandbox payment adapter is exercised with a replacement `fetch`; it never contacts PayPal. Fixture credentials are invented strings.
- `node technical-http-repro.mjs /absolute/path/to/cover`: **passes** an independent loopback server flow on port 33992 with disposable JSON state: sender consent → submission → recipient review/capture → sender appeal → operator refund. It also confirms missing-session 401, wrong-role 403, disallowed-origin 403 and incorrect-content-type 415. The server was stopped and its temporary state removed. Initial sandbox restrictions prevented binding; the approved local-only rerun passed.

Both portable scripts are beside this report and accept the source root as their first argument. The HTTP script accepts an optional second argument for the port. I checked only the official PayPal capture-status documentation externally; this was documentation access, not a provider API call. I did not touch the design judge's port 3202 or shared demo state. No source edits, external provider calls, real credentials, live financial transactions or model charges were made. The build regenerated only generated build output.

Design assessment here uses `docs/preview.png` and interface source, not an independently operated browser. The repository's `docs/BROWSER_QA.md:3–12` is author-supplied evidence and was not treated as my own browser verification. Live Gemini quality, sandbox lifecycle compatibility, production identity and market demand remain **unverified**.

## Independent scores

| Criterion | Score /10 |
|---|---:|
| Technological Implementation | 6.0 |
| Design | 7.0 |
| Potential Impact | 5.5 |
| Innovation / Idea | 6.5 |
| Presentation | 5.5 |
| **Equal-weight total** | **61/100** |

**Technological Implementation — 6.0.** The working depth earns solid prototype credit: consent and integer-cent budgets precede admission; serialized mutations prevent tested budget races; policy snapshots preserve accepted terms; financial operations are saved before dispatch; and unknown capture outcomes are held rather than blindly voided (`server/store.mjs:17–31,40–55`). The HTTP layer actually enforces its demo roles and mutation boundaries (`server/index.mjs:21–46`). PayPal Orders/Payments and Gemini adapters are connected source implementations, not just roadmap boxes (`server/payments.mjs:5–29`; `server/assessment.mjs:13–20`). However, default AI is regex-based, live provider behavior is explicitly untested, and the mocked recovery failures below undermine complete settlement handling. The score rewards nontrivial local work without treating mocked provider results as integration proof. A multi-region database or enterprise authentication is not needed to improve this hackathon score; a small verified sandbox lifecycle and correct recovery states are.

**Design — 7.0.** The supplied screenshot presents a consistent visual hierarchy, restrained palette, recognizable inbox/detail arrangement and immediately legible fee/window metrics. Source shows unusually complete consent and receipt language: no guaranteed meeting, a review-based fee, waiver, an appeal route and simulation/provider labels (`src/main.jsx:24–42`). Review quote, reason and explicit fee confirmation are aligned with the actual backend checks. The earnings display explicitly says no payouts are connected. These are stronger than a collection of disconnected screens. I withhold a higher score because I did not personally verify browser behavior or accessibility, the expired-checkout recovery route is missing from the interface, and pending/failed outcome copy can strand a user. All roles still inhabit a recipient-oriented workspace, which is workable for a demo but less clear as a sender experience.

**Potential Impact — 5.5.** There is a specific, understandable transaction: a vendor purchases a bounded opportunity for a founder to review a proposal, not a promised sale. Capacity and budgets make the workflow concrete. Published exclusions could reduce wasted paid submissions. But the project supplies no interviews, willingness-to-pay evidence or measured review quality; these are correctly identified as future gates (`PRD.md:88–108`; `README.md:89`). Requiring a quoted passage and a 20-character reason proves recorded actions, not useful attention, and the policy candidly admits that limitation (`src/main.jsx:40`; `server/store.mjs:52`). The $3 recipient / $2 gross platform split is an illustrative allocation, not validated economics. The impact case depends on both sides choosing this channel and accepting its dispute burden. I make no market-size or competitor claim.

**Innovation / Idea — 6.5.** The distinctive mechanism within this artifact is policy-aware selection before a consented fee, followed by payment tied to review completion regardless of whether the recipient likes the proposal. Server-enforced exposure limits, immutable terms and evidence-linked assessment give that mechanism more substance than a pay button alone. However, the implemented sender integration is a human-operated form with recommendations; it does not independently seek opportunities or purchase access. An excluded assessment can still be submitted by the sender, and the default assessment uses keywords (`server/assessment.mjs:8–11`; `src/main.jsx:39`). The next persuasive innovation evidence is showing that a model changes a purchasing recommendation usefully on difficult cases, not expanding the number of APIs. No claim of market-wide novelty is made.

**Presentation — 5.5.** The README gives executable setup commands, a clear six-step demonstration, honest provider limitations, API roles and scope boundaries (`README.md:9–37,43–89`). The screenshot and documented synthetic fixtures make the intended result easy to understand. A judge can run the local product without keys, which is valuable. But a written demonstration script is not an under-three-minute recorded end-to-end demonstration, and no real sandbox capture/void/refund or model-backed decision evidence is provided. Planning documents should not be mistaken for completed milestones. Missing public repository access is recorded separately as a submission requirement gap; it is not used as a blanket score reduction across all criteria.

## Findings and exact reproductions

**F1 — P1: failed void has no application recovery path. Observed with the actual sandbox adapter and mocked transport.** In the portable script, authorize a fixture, advance an injected clock by 25 hours, and make the first `/void` call fail before the provider receives it. Return `CREATED` for subsequent authorization reads. Two reconciliations produce **one void POST, two authorization GETs, `VOID_PENDING`, and 500 cents still reserved**. `server/payments.mjs:24` only checks the authorization; it never retries an unexecuted void. `server/store.mjs:29` suppresses repeat settlement for any existing operation, and expiry only acts on `AUTHORIZED` (`:33`). This is financially conservative, but the ordinary “no review → release” flow can remain stuck after a transient failure. Add an explicit recovery transition based on authoritative authorization state, with safe retry of the same operation where permitted, and an actionable investigation state when retry is unsafe. Verify the provider behavior in sandbox before claiming reliable expiry recovery.

**F2 — P1: known unsuccessful settlement results are represented as unknown pending results. Observed mapping with a mocked response; real provider responses unverified.** Return `{id:'C',status:'DECLINED'}` from capture and its lookup. `DECLINED` is a supported status in the [official PayPal capture-status schema](https://developer.paypal.com/api/payments/v2/definitions/capture_status/), checked during this review. The resulting state remains **`CAPTURE_PENDING`, provider status `DECLINED`, held budget 500 cents** after reconciliation. `server/store.mjs:23` turns every non-`COMPLETED` result into `UNKNOWN`; `:33` then excludes that capture from expiry. This conflates a pending result with a known failure and offers no resolution. Introduce action-specific response classification and test pending, failed, successful and transport-unknown outcomes. Do not simply release the budget on a failed capture: first resolve whether the authorization still needs voiding. This finding demonstrates the reducer's behavior; it does not claim a real sandbox DECLINED response was obtained.

**F3 — P1: late checkout confirmation exists in the API but disappears in the UI. Source-inferred, not browser reproduced.** `server/store.mjs:33` changes an expired awaiting-approval order to `CANCELLED`. Its `confirm` method intentionally accepts `CANCELLED`, verifies authorization and voids it after the deadline (`:50`). But the sender's “Check authorization” control only renders for `AWAITING_APPROVAL` (`src/main.jsx:32`), while operator reconciliation only renders for pending/unknown states (`:37`). If authorization completes after the checkout expires, the normal interface supplies no way to trigger that protective confirmation/void. Add a late-checkout check/release action or reconciliation job; demonstrate buyer approval arriving after the deadline and a confirmed release.

**F4 — P2: refund reconciliation leaves contradictory appeal status. Observed.** Capture a proposal, appeal it, make refund dispatch throw, then return a completed refund from reconciliation. Result: **payment `REFUNDED`, earning `REVERSED`, appeal `REFUND_PENDING`**. `server/store.mjs:54` updates the appeal only during initial refund execution, while the common completion path (`:23–27`) and reconciliation (`:55`) omit it. The UI displays that stale value (`src/main.jsx:35`). Move appeal completion into the shared confirmed-refund transition and test both immediate and reconciled success, including restart between them.

**F5 — P2: changed retry payload is silently accepted. Observed.** Submit a proposal under one key, then retry the key with different pricing, evidence URL and category but unchanged company/title/body. The call succeeds and returns the first proposal with old pricing and category. `server/store.mjs:16` hashes only three fields; `:42` uses that hash for key equality. This contradicts `README.md:83`'s broad changed-payload rejection statement and can mislead a sender correcting material terms. Separate duplicate-content detection from a complete normalized request fingerprint. Include all material proposal and accepted-policy fields in retry equality, preserving exact retries while rejecting changed requests. The reproduced behavior does **not** create a second charge.

**F6 — P2: the local fit check mistakes an exclusion denial for an offer. Observed limitation.** “We do not sell lead lists. We build invoice reconciliation software for finance teams.” returns **skip / Outside the brief** because the exclusion regex in `server/assessment.mjs:9–11` has no context. This is acceptable as a labeled fallback, but demonstrates why default fixtures do not establish AI value. Preserve the explicit fallback label, add this and similar negation/irrelevant-keyword cases to a frozen evaluation set, and compare human judgments against configured Gemini output. Evidence substring checks (`:18`) prevent fabricated quotations; they do not establish reasoning accuracy.

## Strengths to preserve and priorities

Preserve the server-owned budget/consent boundary, exact policy snapshots, record-before-dispatch operation IDs, no-blind-void treatment of unknown captures, quote-backed review receipts, and honest simulation/payout language. Keep the simple single-process deployment for this hackathon; distributed infrastructure is not the priority.

No P0 is assigned: the tested core **simulation** works. The highest-leverage improvements are:

1. **P1 — Produce real integration evidence.** Run one sandbox buyer approval/authorization, capture, void and refund and one configured Gemini assessment. Save sanitized operation IDs, outcomes and model metadata; include a network interruption and reconciliation. No such calls were made in this review.
2. **P1 — Repair F1/F2 settlement recovery.** Add a small explicit state table and fixture tests for failed void dispatch, pending-to-success, known failure and unknown results. Ensure UI wording and exposure match the state.
3. **P1 — Expose F3 late-checkout recovery.** Make the existing protective API reachable and prove a late authorization is released.
4. **P1 — Complete submission evidence.** Make the intended submission repository public and record a public video under three minutes. Demonstrate the finished lifecycle; clearly distinguish simulation, genuine sandbox events and model output. Verify setup in a clean dependency installation.
5. **P2 — Fix F4 appeal closure and F5 request fingerprinting.** These are small corrections with direct receipt/consent value, not infrastructure projects.
6. **P2 — Demonstrate why AI is needed.** Run the planned frozen recommendation set, preserve errors and compare against the current local-rule baseline; show one difficult decision in the pitch.
7. **P2 — Validate the review contract with a few users.** Ask senders when they expect to pay and recipients what counts as a useful review. Record actual feedback rather than claiming the fee or incentives are validated.

## Readiness, questions and next iteration

**Stage one: conditional.** The local build, theme fit and coherent demo are demonstrated. Reasonable use of the required APIs is plausible in source, but live integration has insufficient observed evidence. That is a mock evidence assessment, not an automatic disqualification. Setup instructions and MIT licensing are present (`README.md:9–28`; `LICENSE:1–10`). Known submission gaps are the coordinator-confirmed private original repository and absent recorded public YouTube demo. Public hosting is not assumed necessary. Payouts and unattended payment are honestly excluded, so their absence alone is not treated as a hackathon defect.

My three questions for the builder:

1. Can you show one genuine sandbox authorization-to-capture/refund and authorization-to-void lifecycle, including recovery after a response is lost?
2. Which sender decisions improve measurably with Gemini over the default keyword rules, and what happens on a wrong recommendation?
3. What evidence suggests senders will pay $5 for this review obligation, and how will an independent operator distinguish an inadequate review from an unwelcome verdict?

The smallest credible next iteration is to fix the settlement and appeal transitions, expose late-checkout recovery, and record one compact sandbox-plus-Gemini journey. Retain the local single-merchant scope and pending internal earnings. Add a small frozen assessment set and a few candid user observations, then complete the public repository/video requirements. That would resolve the largest evidence gaps without expanding the product.
