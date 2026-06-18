# Sdk Readonly Snippet

This note expands the Foreseen SDK and npm integration guide for sdk readonly snippet.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO read-only snippet: `const f = new Foreseen()` uses CELO mainnet 42220 defaults — no key required.
