# Deferred provider verification

No PayPal or Gemini credentials were configured for remediation. All completed checks were local or mocked. The user is configuring credentials separately; no live provider execution or successful sandbox money movement is claimed.

When credentials are ready, use a separate sandbox state file and synthetic proposals. Never use production credentials. Follow README setup, confirm the mode label, and preserve a sanitized evidence record for each step:

1. Sender approves an `AUTHORIZE` sandbox order; server confirms the exact USD $5 authorization.
2. Recipient supplies a policy rule, exact passage, content-specific reason and next step, then explicitly charges. Preserve authorization/capture IDs and confirmed statuses.
3. Sender appeals. Operator records the refund reason. Preserve refund ID/status, reversed earning and resolved appeal.
4. For another authorized proposal, complete a waiver or let its real deadline pass and verify void. Demo time controls cannot accelerate sandbox deadlines.
5. Exercise a response-loss recovery in a controlled test environment; verify one financial effect and stable request ID. Separately approve an order after its application admission window closes and confirm immediate release.
6. Run one genuine Gemini assessment, then the frozen comparison command in `docs/evals/README.md`. Preserve model, provider, latency, usage, exact quotes, fallback count and every failure.

Evidence records should include application commit, timestamp, environment, scenario, operation/request ID, sanitized provider ID, observed provider response status, final local state and explicit verification method. Never include access tokens, credentials, buyer personal information or full sensitive provider responses. Tests using fixture IDs do not satisfy these provider evidence gates.

Public source visibility and public video publication remain separate submission gates. A local edited demonstration preview is useful presentation material but does not establish a public YouTube submission or real provider operation.
