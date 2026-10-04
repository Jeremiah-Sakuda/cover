# Cover hackathon goal and judging criteria

**Date:** October 3, 2026. **Status:** Competition objective and planning rubric; no judging score or winning outcome is claimed.

## Goal

**The goal is to win first place overall in the PayPal AI Hackathon.** Build and present Cover to compete across all five judging criteria. Use this objective to prioritize work alongside the [product requirements](PRD.md): choose scope that produces the strongest complete, credible, demonstrable experience by the deadline.

An overall win is the primary objective. Special and sponsor prizes are secondary opportunities. A feature earns priority when it improves the judged experience or the evidence behind it; API count and feature count are not success measures by themselves. This objective does not override consent, accurate claims, or the PRD's feasibility gates.

## Official judging criteria

The descriptions below are reproduced from the official-rules text supplied by the user on October 3, 2026. Source: [PayPal AI Hackathon Official Rules, section 6](https://paypalaihackathon.devpost.com/rules). This file records that supplied version; recheck the rules before submission.

Stage One checks baseline viability, theme fit, and reasonable use of the required APIs or SDKs. Submissions that pass proceed to Stage Two. The five criteria below are **equally weighted**, equivalent to 20% each; the supplied rules do not prescribe a numeric scoring scale.

**Technological Implementation**

> How thoroughly and skillfully does the project use PayPal Developer Platform and AI tool(s)? Does the project reflect genuine effort and a working, non-trivial implementation?

**Design**

> Does the project deliver a complete, coherent product experience — not just a technical proof of concept?

**Potential Impact**

> Does the project make a credible, specific case for solving a real problem for a real audience — and does the solution actually address that problem based on what's demonstrated?

**Innovation/Idea**

> How creative and novel is the concept and does the project differ from existing concepts?

**Presentation**

> Does the video clearly demonstrate the project working end-to-end? Does the pitch communicate what problem is solved, who it's for, and why it matters? Is the overall presentation easy to follow?

Ties are resolved by comparing the criteria in the order above, beginning with Technological Implementation. Remaining ties proceed through subsequent criteria; a judges' vote resolves a tie across all criteria.

## Evidence this project should show

The following is our proposed strategy, not additional official judging criteria. Evidence remains to be produced.

| Criterion | Project evidence to prioritize |
| --- | --- |
| Technological Implementation | Demonstrate policy-aware sender decisions, server-enforced budgets, sandbox authorization, human-confirmed review, capture or void, and reconciliation. Prove unattended token use before claiming it; show Payouts only when confirmed. |
| Design | Make the exact review obligation, fee, deadline, waiver, appeal, and financial status clear to both sender and recipient. The entire journey must use the revised review-service pricing consistently. |
| Potential Impact | Validate that founders want the channel and senders accept its terms. Show actual feedback or pilot evidence and acknowledge that Cover does not stop messages sent through other channels. |
| Innovation/Idea | Demonstrate agents deciding whether to purchase bounded access to human review, with explicit delegation and budgets. Explain how this differs from a paid contact form and why the incentives are credible. |
| Presentation | Show an agent skipping an unsuitable opportunity, submitting a suitable one, and the recipient completing a review. Show capture, waiver, and expiry with real sandbox evidence and explain the fee model immediately. |

## Prize strategy

Best Use of Agentic Commerce or Most Creative are secondary outcomes; APIMatic is an optional sponsor opportunity when its generated client or documentation is used by the working sender integration.

The supplied rules permit at most one grand prize plus one sponsor prize, or one honorable mention plus one sponsor prize. Do not plan on stacking a grand prize with an honorable mention. First-place ambition applies to this project even if a specialty award is a natural fit.

## Submission readiness

- A working end-to-end build demonstrates meaningful PayPal and AI use, including the actual role of the model.
- The judge can run or interact with the project through a hosted demo or complete setup instructions.
- The public GitHub repository contains the source, required assets, setup instructions, and an open-source license.
- A public YouTube video shorter than three minutes clearly shows the problem, audience, functioning product, and result.
- Interview findings, evaluation results, sandbox operations, recorded demonstrations, and simulations are accurately labeled.
- Every judging criterion has inspectable evidence; outstanding weaknesses are recorded instead of hidden by a polished pitch.

Use the [shared build schedule](../README.md) and the PRD's acceptance gates to review progress. This document establishes the objective and evaluation lens; it is not evidence of a completed product or a predicted win.
