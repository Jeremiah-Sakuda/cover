# Shared hackathon planning requirements

Planning reference retained from the project suite. Current Cover implementation, setup commands, and limitations are in [README.md](README.md). These requirements and validation targets are not claims that the corresponding evidence has been produced.

## Original proposal context

The three proposals below were drafted as alternative hackathon entries. The user subsequently requested implementation of all three in parallel. The original research plans and feasibility gates remain useful; they are not completed validation results.

| Project | Proposed MVP | Main feasibility question | Judging opportunity |
| --- | --- | --- | --- |
| [Harambee](https://github.com/Jeremiah-Sakuda/harambee) | Group commitments and approved cost revisions for one merchant's reservations | Can multiple payments and a reservation recover coherently from partial failure? | Overall prize, PayPal + AI, AG Grid |
| [Cover](PRD.md) | Agent-submitted proposals with an agreed fee for completed human review | Will senders and recipients accept the rules and use this channel? | Agentic Commerce, creativity, APIMatic |
| [Walkthrough](https://github.com/Jeremiah-Sakuda/walkthrough) | Paid apartment verification with fresh evidence and explicit uncertainty | Can a verifier produce useful evidence at a viable price? | Impact, demo delivery, Bryntum |

Harambee is the recommended first project because it has the clearest path to a complete demo. Cover's recommended baseline changes spam penalties into an agreed review service. Walkthrough's recommended baseline charges for verification and defers rental-deposit handling. Both PRDs preserve the original concepts as gated extensions so those changes are explicit and reversible product decisions.

## Competition objective

The goal for the selected project is to win first place overall in the PayPal AI Hackathon. Each separate project includes the official judging criteria and a project-specific evidence plan:

- [Harambee goal and judging criteria](https://github.com/Jeremiah-Sakuda/harambee/blob/main/HACKATHON.md)
- [Cover goal and judging criteria](HACKATHON.md)
- [Walkthrough goal and judging criteria](https://github.com/Jeremiah-Sakuda/walkthrough/blob/main/HACKATHON.md)

## Shared delivery requirements

The supplied hackathon rules require meaningful PayPal and AI use, a functional build accessible to judges, a public GitHub repository with an open-source license, and a public YouTube demonstration shorter than three minutes. The supplied deadline is November 12, 2026 at 3:00 p.m. EST; judging access must remain available through December 15. Implementation, design, impact, innovation, and presentation are equally weighted. A project may win a grand prize or an honorable mention, plus one sponsor prize. Recheck these requirements before submission against the [official rules](https://paypalaihackathon.devpost.com/rules). The latest fetch during drafting encountered a browser verification page; the supplied rules and earlier review are the source for this summary.

Use sandbox money throughout the hackathon demo. Clearly distinguish real sandbox API activity, application fixtures, recorded evidence, and simulated failures. A fixture reservation may be a working local reservation system but must not be presented as a real cabin booking. No judge should need to supply real money or a paid model key.

## Common engineering requirements

- Keep PayPal credentials and saved payment tokens on the server. Treat model inputs, uploaded evidence, and agent messages as untrusted content. Models cannot invoke unrestricted payment operations.
- Use integer minor units for money and one currency, USD, in the MVP. Compute fees and totals in code. Models propose interpretations, never authoritative transaction amounts or payment outcomes.
- Store each financial operation before dispatch with a stable operation identifier. Use provider idempotency where supported, database uniqueness, and reconciliation after timeouts. A network timeout is an unknown result, not permission to charge again.
- Verify webhook authenticity, deduplicate events, and reconcile provider state when notifications arrive late or out of order. Browser callbacks alone cannot mark a payment complete.
- Keep authorization, capture, void, refund, and payout statuses separate. A requested refund or void is not a confirmed release, and bank display timing is outside the application's control.
- Provide role-based access, bounded AI retries, rate limits, accessible keyboard controls, text labels for status, and usable layouts at 375 px and desktop widths. Each product specifies additional controls.
- Keep personal content and financial metadata out of public logs and examples. Use consented or synthetic demo material. Define retention and deletion before accepting real user data.
- Budget and measure model latency, token usage, and provider cost. If AI fails, offer manual input or review; never silently approve a financial transition.

These are proposed implementation requirements, not claims about existing software. Each PRD lists additional acceptance cases. Keep development examples separate from the frozen evaluation set, and report failed cases alongside successes.

## Shared build sequence

| Dates in 2026 | Deliverable for the selected project |
| --- | --- |
| October 3 to 9 | Interview target users; prove critical sandbox operations; decide the payment recipient, pricing, and release profile |
| October 10 to 18 | Complete one journey with persistence, real sandbox payments, AI contribution, and basic recovery |
| October 19 to 27 | Add failure cases, evidence views, sponsor integration if useful, and accessibility checks |
| October 28 to November 5 | Freeze evaluation cases, run user sessions, record limitations, and stabilize the judge build |
| November 6 to 11 | Produce a 2:45 video, verify clean setup and public access, document sources and license, submit early |
| November 12 to December 15 | Preserve the submitted build and maintain judge access |

Dates are planning targets, subject to capacity. No spending, deployment, account enrollment, or outreach is authorized by these documents themselves.

## Payment references and limits

PayPal documents two-step authorization and capture, recommends capture within the three-day honor period, and describes a 29-day authorization window with reauthorization. Actual account behavior and failure cases must be tested; an authorization does not guarantee later collection. [Authorization and capture](https://developer.paypal.com/v5/checkout/auth-capture/)

PayPal documents saved-token auth/capture and merchant-initiated flows for recurring payments. This is evidence for a feasibility test, not confirmation of Cover's unscheduled use case or account permissions. [Saved payment methods](https://developer.paypal.com/platforms/checkout/standard/customize/save-payment-methods-for-recurring-payments/)

Payouts requires eligible business access and a funded balance covering payouts and fees. A capture and a payout are separate operations. [Payouts requirements](https://www.paypal.com/us/business/make-payments/mass-payments?locale.x=en_XC)

## Progress record

October 3: Created these planning documents. No customer interviews, sandbox transactions, model evaluations, or product builds have occurred for these proposals. Future work should give the selected project its own implementation status and repository. Documentation checks do not establish product feasibility.
