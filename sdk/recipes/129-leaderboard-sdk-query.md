# Leaderboard Sdk Query

Use SDK query helpers consistently for leaderboard routes.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not mix hand-rolled ABI reads with package helpers in the same view without a reason.
- Check ranking labels against the SDK return shape.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO leaderboard SDK query: `getPlayerStats(address)` returns CELO on-chain win/loss/draw directly.
