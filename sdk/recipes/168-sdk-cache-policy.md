# Sdk Cache Policy

This note expands the Foreseen SDK and npm integration guide for sdk cache policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO cache policy: short TTL (30s) for CELO reads; bust on each new CELO block (~5s avg).
