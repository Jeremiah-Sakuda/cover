# Cover

[Browser verification and preview](docs/BROWSER_QA.md)

**Good proposals deserve a considered response.** Cover is a working local hackathon MVP for agent-assisted vendor introductions. A sender consents to a $5 review fee, the server enforces their budget, and a recipient earns the fee only after completing a structured human review. No review by the deadline means release of the authorization.

The default experience is fully simulated and requires no credentials. Optional Gemini assessment and genuine PayPal **sandbox** checkout adapters are connected to the application, but have **not been exercised with real credentials**. This is not yet a submission-ready proof of PayPal integration or validated demand.

## Run it

Requires Node.js 22. `npm ci` installs the locked dependencies.

```sh
npm ci
npm run dev
```

Open [Cover at localhost:5172](http://127.0.0.1:5172). The API is at `http://127.0.0.1:3102`. `npm run dev` starts both processes and stops both on interruption.

```sh
npm test
npm run build
npm start
```

`npm start` serves the built app and API together at [localhost:3102](http://127.0.0.1:3102). Run one backend at a time. Development uses React + Vite, with a Node HTTP API and atomic JSON persistence. Fonts use Google Fonts with local fallbacks.

State persists in `data/cover-demo.json`. Use **Payments & receipts → Operator → Reset demonstration** and confirm to return to three synthetic seeded proposals. Alternatively, stop the server and delete that file. No application data or secrets belong in Git. The server binds to loopback. Do not expose this demo to the public internet; demo roles are selectable, not authenticated identities.

## A three-minute demonstration

1. Open **Your review policy**: $5, 24 hours, published criteria, explicit review definition, waiver, no guaranteed meeting, and appeal route.
2. Open **Sender agent**, switch to Sender, set budgets, accept and enable the mandate. Check a draft's fit. Try text offering “lead lists” to see a skip recommendation before payment. The default rules engine is clearly labeled; configure Gemini for model-backed assessments.
3. Accept the exact fee and submit. In demo mode, the hold is simulated. In sandbox mode, open the supplied PayPal approval link, approve with a sandbox buyer, then press **Check authorization**. Only server-confirmed authorizations can be reviewed.
4. Switch to Recipient, open a full proposal, quote an exact passage, give a content-specific reason, confirm reading, and choose **Review & charge** or **Review & waive**. Disposition never determines the fee.
5. Open **Payments & receipts**. Switch to Operator and advance the simulation by 25 hours. Unreviewed holds become released. This changes only the application clock, not PayPal settlement.
6. For a captured review, switch to Sender and appeal in its receipt. Switch to Operator, give an independent reason, and refund. The earning is put on hold, then reversed when refund confirmation arrives.

## Optional providers

Copy `.env.example` to `.env` and restart the backend. Never commit `.env`.

### PayPal sandbox

Set `PAYMENT_MODE=paypal-sandbox`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET` from a PayPal developer sandbox app. Set `APP_URL` to the browser origin (`http://127.0.0.1:5172` for dev, `http://127.0.0.1:3102` for the production build).

Sandbox uses a separate empty state file. The server creates Orders v2 `AUTHORIZE` orders, obtains buyer approval, confirms authorization server-side, and uses Payments v2 for capture, void, and refund. It never uses the live API host. Approval redirects alone cannot confirm payment. Saved payment methods and unattended charges are not implemented; each proposal requires buyer approval.

Financial requests are recorded before dispatch and use stable request IDs. Unknown results retain their reserved exposure and require operator reconciliation. Confirmed provider results determine the visible state. A capture in progress is never blindly voided at expiry. Unknown operations older than five hours with no provider ID require manual provider investigation rather than assuming PayPal still retains an idempotency key. The application polls deadlines while running and processes overdue items on reads/restart. Late checkout authorization is voided rather than admitted.

No webhooks are accepted. Reconciliation uses authenticated server-side API calls. No payouts are implemented; $3 recipient earnings are an internal, pending ledger allocation. No earnings are claimed as received. Multi-merchant settlement, payout eligibility, provider failures, dispute workflows and actual sandbox lifecycle behavior remain release gates.

References: [Orders v2](https://developer.paypal.com/api/orders/v2), [Payments v2](https://developer.paypal.com/api/payments/v2), [authorization and capture](https://developer.paypal.com/checkout/delay-capture/).

### Gemini

Set `GEMINI_API_KEY` and `GEMINI_MODEL` to a model available to your account that supports `generateContent` and JSON output. The connected fit endpoint and submission workflow send only the bounded proposal and published policy. The assessment is stored on the submitted proposal, including provider/model, latency and token usage when supplied. External calls may incur your provider's charges; no calls were made during development.

Each call has a 10-second timeout, 800 output-token cap, no retries and no model tools. Every displayed quote must be an exact substring of the proposal and reference an existing policy rule. Invalid output or provider failure falls back to labeled local rules, leaving manual review available. Vendor claims remain unverified. Linked pages are never fetched. The model never receives payment credentials or controls a financial action.

Reference: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output). Monetary model-cost estimates are not implemented; token usage is preserved without an invented cost estimate.

## API and sender integration

The browser sender workflow is the working integration. `GET /api/policy` is public machine-readable policy. Other endpoints use an HttpOnly SameSite session cookie selected by `POST /api/session` with `{ "role": "sender" }`. This is deliberately local demo identity switching. All mutations require `Content-Type: application/json`, `X-Cover-Client: web`, and an allowed Origin when supplied; no cross-origin permission is granted.

| Endpoint | Role | Purpose |
| --- | --- | --- |
| `GET /api/state` | Any demo role | Persistent workspace state |
| `POST /api/mandate` | Sender | Explicit consent and integer-cent budgets |
| `POST /api/mandate/revoke` | Sender | Block new submissions |
| `POST /api/assess` | Sender | Bounded proposal assessment |
| `POST /api/submissions` | Sender | Requires `Idempotency-Key`, exact accepted policy/fee, consent |
| `POST /api/submissions/:id/confirm` | Sender | Confirm PayPal authorization through server API |
| `POST /api/submissions/:id/open` | Recipient | Record opening the full proposal |
| `POST /api/submissions/:id/review` | Recipient | Quote, reason, disposition, read confirmation, fee action |
| `POST /api/submissions/:id/appeal` | Sender | Appeal a captured review within 48 hours |
| `POST /api/submissions/:id/refund` | Operator | Reasoned refund of a confirmed capture |
| `POST /api/submissions/:id/reconcile` | Operator | Check an unknown operation with original request ID |
| `POST /api/demo/reset` | Operator, demo only | Requires `{"confirmation":"RESET DEMO"}`; restores synthetic fixtures |
| `POST /api/demo/advance` | Operator, demo only | Advance 1–72 application hours |

A single serialized mutation queue covers capacity, budget, review and expiry. Exact policy terms are copied into each submission. Duplicate content and reused keys with changed payloads are rejected. Amounts are integer cents. Request size and per-IP rate bounds are enforced. API role checks prohibit recipient refunds and sender capture.

## Checks and limits

`npm test` exercises consent/revocation, concurrent budgets, idempotency, mandatory review evidence, explicit capture consent, waiver, expiry races, unknown capture reconciliation, appeals/refunds, persistence, prompt-injection-like text, unsafe evidence URL schemes, and simulation-only time controls. `npm run build` produces the production bundle. GitHub Actions runs tests and build on each push/PR.

Current release is **a single-process local demonstration**. JSON persistence is atomic but not a multi-process transactional database. Local role switching does not establish identity, privacy boundaries between multiple senders, or independent operator staffing. All state is synthetic; 30-day message retention and financial retention policies are documented requirements but not an automated deletion implementation. Webhook delivery, email notifications, payouts, production identity, migrations, distributed locking, AI evaluations and customer interviews are not complete. No production payments or customer data should be accepted.

See [PRD.md](PRD.md), [HACKATHON.md](HACKATHON.md), and [SHARED_REQUIREMENTS.md](SHARED_REQUIREMENTS.md) for original goals and outstanding evidence gates. The October 3 PRD's proposal status describes the planning baseline, not this implementation's current state. MIT licensed.
