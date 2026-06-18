# Sdk Confidence Policy

This note expands the Foreseen SDK and npm integration guide for sdk confidence policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO confidence policy: only counter when `confidence` ≥ 0.55 — below threshold, randomize on CELO.
