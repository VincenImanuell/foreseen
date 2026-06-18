# Npm Files Review

This note expands the Foreseen SDK and npm integration guide for npm files review.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO npm files review: confirm `dist/`, `sdk/src/abi.ts`, and recipe index are in npm `files`.
