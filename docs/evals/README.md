# Frozen opportunity assessment comparison

This is a **local rules evaluation**, not evidence of Gemini quality or user validation. The 24 synthetic cases and expected labels were authored during remediation, so they are not independent human ground truth or a held-out benchmark. The case file is now versioned for repeatable future comparisons; changing it requires a new version. Unverified vendor claims and linked pages remain unverified regardless of a recommendation.

```sh
npm run eval
npm run eval -- --write docs/evals/results-local.json
```

The stored [local result](results-local.json) includes source/dataset SHA-256 hashes, every expected and actual label, confusion matrices, false-submit counts, invalid quote counts and timing. Original rules matched **14/24 (58.3%)** developer labels; revised rules matched **22/24 (91.7%)**, with **zero false-submit decisions** and **zero invalid source quotes** on this set. Local execution latency is measured in fractions of a millisecond and is not representative of model/network latency. No claims about general population accuracy follow from these 24 examples.

Two failures are preserved explicitly: the rules miss a relevant supplier-bill matching use case expressed without their vocabulary, and misread research *about* an excluded service as offering that service. Negation and incidental department keywords are improved, not solved generally. The human chooses whether to submit and approves the fee; advice never authorizes money.

To run the same cases against a configured model later:

```sh
node --env-file=.env scripts/evaluate.mjs --gemini --write docs/evals/results-gemini.json
```

This command requires local credentials and makes up to 24 bounded requests. It preserves the model name, provider attribution, fallback count and usage metadata; a fallback must not be counted as Gemini success. Missing credentials stop the command. Review all failures and have independent reviewers label the frozen cases before making claims about AI's incremental value. No Gemini comparison was performed during remediation.
