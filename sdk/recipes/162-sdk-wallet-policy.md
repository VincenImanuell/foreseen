# Sdk Wallet Policy

This note expands the Foreseen SDK and npm integration guide for sdk wallet policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO wallet policy: never store CELO private keys in env vars checked into source control.
