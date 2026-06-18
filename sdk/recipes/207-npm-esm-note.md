# Npm Esm Note

This note expands the Foreseen SDK and npm integration guide for npm esm note.

Guidance:

- Prefer read-only flows unless a signer is required.
- Use Celo Sepolia for funded testing.
- Keep private keys, salts, and mnemonics out of source control.
- Avoid fake downloads, fake usage, and bot-vs-bot volume loops.
- Link users to examples or recipes that match the task directly.
CELO ESM note: @foreseen/sdk is ESM-only — import in CJS projects via dynamic `import()` on CELO builds.
