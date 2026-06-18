# Sdk Winrate Policy

This note expands the Foreseen SDK and npm integration guide for sdk winrate policy.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO win-rate policy: `wins / (wins + losses + draws)` gives win-rate — draws count toward denominator on CELO.
