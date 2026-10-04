# Cover product requirements

**Version:** 0.1. **Date:** October 3, 2026. **Status:** Proposed MVP; no implementation or validation. See the [proposal index](SHARED_REQUIREMENTS.md) for shared requirements, timeline, and payment sources.

Cover gives founders a dedicated channel for agent-submitted vendor proposals. Senders agree to a disclosed review fee, their agent checks the recipient's published criteria, and a hold is created before admission. A human recipient must complete a structured review before a fee can be captured. Unreviewed submissions expire without a charge.

## Hackathon objective

The goal is to win first place overall in the PayPal AI Hackathon. Prioritize a strong showing across all five equally weighted judging criteria. See [the goal, official judging criteria, and project-specific evidence plan](HACKATHON.md).

## Product decision and original concept

The original concept charged senders when recipients classified their messages as spam and waived charges for relevant messages. That creates a financial incentive to classify messages negatively. The recommended baseline instead sells a defined review service: the fee depends on completion of review, not the verdict. The recipient may waive it for any reason, including relevance.

This is an explicit proposed change, not a claim that the original idea has been validated or discarded. The original spam-bond model remains an experiment after publishing objective violation rules, independent appeal handling, and a policy that addresses recipient financial incentives. It is outside the baseline demo.

## Audience and problem

The first recipient is a founder who accepts vendor proposals but wants a bounded, organized review queue. The first sender is a vendor using an assistant to qualify opportunities and submit relevant pitches. Recruitment and creator fan messaging are deferred because their norms and incentives differ.

The hypothesis is that a predictable review service is valuable enough for a sender to authorize a small fee and for a recipient to maintain the channel. Cover does not prevent ordinary email spam. Interview five founders and five potential senders before treating willingness to pay or channel adoption as established.

## Service contract

For the demo, the proposed maximum review fee is $5 and the review deadline is 24 hours after authorization. These are illustrative product choices requiring validation. A completed review means the recipient opens the full submission, confirms reading it, selects a disposition, and submits a reason tied to its content. Cover can record those actions; it cannot prove human attention or guarantee a useful reply.

The sender sees the fee, deadline, review definition, waiver policy, appeal route, and lack of a guaranteed meeting before approving. A recipient cannot increase the fee or change the accepted policy after submission. No review by the deadline means void. Every payment remains sandbox-only for the hackathon.

## Main user journey

1. A founder publishes accepted categories, current needs, excluded services, required evidence, capacity, fee, and review deadline as a versioned policy page and machine-readable endpoint.
2. A sender configures an agent with a per-submission and daily budget, permitted recipients, and revocation controls. The agent reads the recipient's policy and proposes submit, revise, or skip with reasons.
3. The sender approves payment setup and delegation terms. Where the configured PayPal flow supports it, subsequent authorizations use the saved method within those limits. Otherwise each submission requires buyer-approved checkout.
4. Cover validates the submission and reserves capacity and budget before requesting a hold. Only confirmed authorization admits it to the recipient queue. If authorization succeeds after the admission window closes, void it.
5. The recipient sees the message, an AI assessment with evidence, and the deadline. They perform the structured review and explicitly select capture or waive. The assessment does not settle payment.
6. The sender receives the disposition and reason, alongside confirmed payment status. Unreviewed submissions expire; the server voids their authorizations.
7. Recipient earnings become eligible for payout only after the configured review and appeal rules. Payout failures remain visible and do not cause the sender to be charged again.

## Functional requirements

| ID | Requirement and acceptance condition |
| --- | --- |
| C1 | Publish a versioned policy readable by people and agents. Each submission stores the exact accepted version, fee, and deadline. |
| C2 | Validate required submission fields and explain missing evidence before payment. Reject oversized or repeated submissions. |
| C3 | Enforce sender spending and exposure limits in code. Concurrent submissions cannot exceed the daily budget or maximum outstanding holds. |
| C4 | Support explicit sender consent and revocation. Revocation blocks new attempts; existing obligations remain visible and follow their accepted terms. |
| C5 | Admit a proposal only after confirmed authorization and an available queue slot. Queue overflow or late authorization triggers void processing. |
| C6 | Produce an AI fit assessment with quoted source spans and policy references. Unsupported claims are labeled unverified. |
| C7 | Capture only after explicit human review completion and fee confirmation before the deadline. Accepting or rejecting a proposal does not itself determine the fee. |
| C8 | Default to void when a review is incomplete, the model is unavailable and no human acts, or the deadline passes. |
| C9 | Provide review receipts, a sender appeal, operator refund controls, and an earnings ledger. An appeal must not be adjudicated solely by the recipient who benefits. |
| C10 | Reconcile duplicate events, unknown captures, refunds, and payouts. Never display a payout as received until provider evidence supports that status. |

Review completion and deadline processing must acquire the same submission lock. If completion is recorded after expiry, refuse capture. If recorded before expiry, process the authorized operation and reconcile any timeout rather than applying a contradictory void blindly.

## Payment model and feasibility gate

The proposed single-merchant sandbox model makes Cover the review-service merchant. Cover captures the agreed fee and records an amount owed to the recipient. Payouts is a separate operation from a funded Cover balance. Recipient compensation, platform share, processing costs, dispute exposure, and payout frequency are business assumptions to resolve before production.

The demo uses a $5 review fee with a proposed $3 recipient earning and $2 gross platform allocation before costs. This is a fixture, not evidence of positive margin. Earnings remain pending during a proposed 48-hour appeal window. A payout demo may use a clearly labeled pre-aged eligible earning. Do not represent advancing the application clock as accelerating PayPal settlement or dispute periods.

Saved PayPal token auth/capture is documented for recurring flows; the exact unscheduled authorization, consent, account permissions, and any required payer action remain untested here. By October 9, prove setup, a later authorization, void, capture, refund, and payout in the configured sandbox. Test revocation and required payer action. A saved method is not a universal permission for arbitrary agents or merchants to charge it.

If unattended authorization fails, retain buyer-approved checkout and describe the product as agent-assisted submission. Do not silently replace holds with capture and refunds: that would change the sender's cash-flow experience and require revised consent, fee economics, and product claims. If Payouts access fails, the reduced demo may show only accurately labeled pending recipient earnings, with payout completion removed from claims.

## AI responsibilities and agent security

The sender agent assesses fit and drafts submissions. The recipient assistant compares content against policy and explains its recommendation. Neither may authorize a fee or adjudicate an appeal. Financial actions are narrow server operations validated against consent, budget, role, and state.

Messages and attachments can contain instructions attempting to override the recipient policy. Treat them as evidence, never tool instructions. Do not give the model saved payment tokens or unrestricted URL-fetching capabilities. The MVP accepts bounded plain text and explicitly allowed evidence links; it does not automatically browse arbitrary submitted URLs or execute attachments.

AI failure leaves manual submission and human review available. Store model/version metadata and evidence references for evaluation without publishing private pitches.

## Experience and data

The sender sees the recipient policy, fit assessment, exact amount at risk, current holds, budget remaining, and review receipt. The recipient sees a bounded queue, deadline, full message, evidence-linked assessment, and explicit Review and charge or Review and waive actions. Payment language must describe the review service rather than a spam fine.

Core records are RecipientPolicy, SenderMandate, BudgetReservation, Submission, Authorization, Assessment, HumanReview, Appeal, Earning, Payout, and FinancialOperation. Separate submitter, recipient, and operator permissions. Default retention for message bodies is 30 days after closure unless an active appeal requires preservation; state that exception and separately define required financial record retention before production.

APIMatic is optional if it produces or validates the agent-facing API client and documentation. Its contribution must be demonstrated through a working sender integration, not a logo in the architecture diagram.

## MVP and exclusions

Must ship: one founder policy, one sender-agent integration, explicit budgets, real sandbox authorization, evidence-linked screening, human review, capture or void, deadline handling, receipts, appeal and refund controls. Payout completion is required only for the full earnings release profile.

Deferred: email replacement, universal inbox interception, autonomous spam penalties, cross-platform agent identities, reputation markets, arbitrary attachments, payment-token portability, and recruitment or creator-specific variants.

## Validation and release gates

| Area | Proposed acceptance target |
| --- | --- |
| Payment reliability | Complete sandbox authorization, void, capture, and refund; test timeout, duplicate submission, concurrent budget use, expiry race, and revoked delegation without duplicate charges or budget violations. |
| Agent value | On 12 frozen sender opportunities, at least 10 useful submit, revise, or skip recommendations against a human rubric; preserve all disagreements. |
| Screening | On 15 frozen messages, assess relevance with cited policy evidence and separate uncertainty; no invented evidence accepted by the display validator. Report human-reviewed accuracy, not only schema validity. |
| Trust | At least four of five senders can explain when they pay and what is not promised. At least four of five recipients can finish review or waiver without assistance. |
| Adoption | At least two interviewed founders agree to try a bounded pilot, and at least two senders accept the proposed terms in principle. This is a target, not recruitment evidence. |

If recipients want income without review or senders reject the service terms, reconsider the product before investing in unattended payment depth. If the payment gate fails, publish the smaller release profile clearly.

## Demo and judging plan

In 2:45, show a founder's policy, an agent declining an unsuitable opportunity before payment, and three admitted proposals: relevant, irrelevant but reviewed, and ambiguous. The recipient waives the relevant proposal, completes and charges for the agreed review of the irrelevant proposal, and leaves the ambiguous case to expire. Show actual void and capture evidence. If demonstrating Payouts, use a separately labeled eligible earning and confirmed payout.

The strongest innovation claim is agents making bounded purchasing decisions about access to human review. The impact claim depends on actual sender and recipient feedback. The presentation must explain the revised fee model immediately so judges do not mistake it for a subjective spam penalty.

## Unresolved decisions

Validate willingness to pay, the smallest credible review obligation, sender acquisition, account permission for unscheduled token use, payout access, appeal operations, and fee economics. The paid review baseline resolves one incentive problem but does not by itself prove that recipients will provide useful attention.
