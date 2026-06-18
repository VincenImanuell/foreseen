# Sdk Scouting Policy

This note expands the Foreseen SDK and npm integration guide for sdk scouting policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO scouting policy: always read `analyzeOpponent` before committing on CELO — free, no gas required.
