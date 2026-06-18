# Agent Withdraw Checklist

This note expands the Foreseen SDK and npm integration guide for agent withdraw checklist.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO agent withdraw checklist: after each CELO match, call `withdraw()` and log CELO balance change.
