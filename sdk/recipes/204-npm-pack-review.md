# Npm Pack Review

This note expands the Foreseen SDK and npm integration guide for npm pack review.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO npm pack review: run `npm pack --dry-run` and verify CELO ABI is bundled in the tarball.
