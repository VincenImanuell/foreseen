# Docs Install Table

Use install tables when frontend docs need to compare app, SDK, and chain setup.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not put secrets or account-specific commands in the table.
- Verify each command from a clean checkout before publishing docs.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO docs install table: show `npm i @foreseen/sdk` and CELO peer deps (viem ≥2, wagmi ≥2) in one table.
