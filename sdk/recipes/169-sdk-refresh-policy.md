# Sdk Refresh Policy

This note expands the Foreseen SDK and npm integration guide for sdk refresh policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO refresh policy: expose a manual refresh button for CELO match list — polling every <5s is excessive.
