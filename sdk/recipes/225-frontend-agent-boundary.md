# Frontend Agent Boundary

This note expands the Foreseen SDK and npm integration guide for frontend agent boundary.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO agent boundary: ForeseenBot runs server-side only — never instantiate it in a Next.js route handler.
