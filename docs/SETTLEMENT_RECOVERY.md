# Settlement recovery

Financial intent is persisted before dispatch. Transport failure is not proof of financial failure. Only a confirmed provider result closes an obligation. The following is verified with injected responses and mocked HTTP transport, not live PayPal traffic.

| Action / evidence | Application transition | Exposure / next action |
| --- | --- | --- |
| Capture `COMPLETED` | `CAPTURED`; earning pending appeal window | Authorization reservation ends; capture ID retained |
| Capture `PENDING` or transport unknown | `CAPTURE_PENDING`; operation `PENDING` or `UNKNOWN` | Retain $5 exposure; reconcile same operation; never blindly void |
| Capture `DECLINED`, `FAILED`, or `DENIED` | Operation `FAILED`; automatically start a distinct **void** intent | Retain exposure until void confirmation; never retry capture with a new key |
| Void dispatch failed, authorization read is `CREATED` | Replay void with its original request ID within five-hour app cutoff | Read-before-retry; no new void key |
| Authorization read is `VOIDED` or `EXPIRED` | `VOIDED` | Release reservation without another void |
| Authorization read is fully/partially captured, or retry cutoff passed | `VOID_INVESTIGATION` | Retain reservation; inspect provider evidence; no automatic new intent |
| Refund `PENDING` or transport unknown | `REFUND_PENDING`; appeal pending | Earning remains held; capture remains counted until refund confirms |
| Refund `FAILED` / `CANCELLED` | `REFUND_FAILED`; appeal explicitly failed | No refund claimed. Operator investigation required; no automatic replacement refund |
| Refund `COMPLETED`, immediate or after restart/reconciliation | `REFUNDED`; appeal resolved; earning reversed | Refund ID and operator reason retained in receipt |
| Unapproved checkout passes admission deadline | `CHECKOUT_EXPIRED` | Reservation retained while late authorization is unresolved |
| Late checkout confirmation | Authorization immediately voided | Sender Check late approval & release, operator reconcile, and the worker all use the same protection |

The 30-second worker inspects expired checkout orders no more than once per minute. Browser/API reads process local deadlines but do not themselves repeatedly poll PayPal. Older legacy `CANCELLED` checkout records become `CHECKOUT_EXPIRED` on load. An unapproved expired checkout can remain reserved while its provider outcome is unresolved; this conservative state is visible, not a claimed release. A future provider-confirmed closed-order workflow could release that reservation. Unknown operations past the retry cutoff require a real provider investigation; this local build does not invent a successful resolution.

The operator can inspect original operation IDs, provider IDs, statuses and event timestamps under **Activity & payment evidence**. Do not manually edit JSON to claim a release/refund. Retain provider evidence and resolve the real provider state before implementing a new financial intent. Refund failure is a known failure, not endless “pending”; the app deliberately does not manufacture a new refund request as a generic retry.

PayPal's [void endpoint](https://developer.paypal.com/api/payments/v2/authorizations-void) supports an idempotency header and forbids voiding fully captured authorizations. The [capture status schema](https://developer.paypal.com/api/payments/v2/definitions/capture_status/) distinguishes declined, failed, pending and completed states. Consult [authorization details](https://developer.paypal.com/api/payments/v2/authorizations-get) and [refund details](https://developer.paypal.com/api/payments/v2/refunds-get) when gathering provider-backed evidence. The five-hour cutoff is Cover's conservative application policy, not a guarantee of provider retention.
