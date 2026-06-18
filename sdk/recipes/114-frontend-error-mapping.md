# Frontend Error Mapping

Map SDK errors to frontend messages that explain what the user can do next.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not expose low-level provider errors as the only UI text.
- Verify rejected wallet, failed read, and timeout states separately.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO frontend error mapping: 'WRONG_CHAIN' → 'Please switch to CELO mainnet (chainId 42220)'.
