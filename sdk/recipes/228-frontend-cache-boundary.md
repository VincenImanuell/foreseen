# Frontend Cache Boundary

This note expands the Foreseen SDK and npm integration guide for frontend cache boundary.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO cache boundary: SWR keys must include CELO chainId — avoids stale testnet data showing in mainnet UI.
