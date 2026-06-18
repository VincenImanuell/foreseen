# Frontend Secret Boundary

This note expands the Foreseen SDK and npm integration guide for frontend secret boundary.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO secret boundary: localStorage key for CELO reveal salt must include chainId 42220 to avoid testnet collision.
