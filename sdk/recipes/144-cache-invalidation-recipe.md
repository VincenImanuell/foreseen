# Cache Invalidation Recipe

Document cache invalidation after SDK-backed actions update on-chain state.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not leave old match data visible after a successful transaction.
- Invalidate match, profile, and leaderboard reads where appropriate.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
