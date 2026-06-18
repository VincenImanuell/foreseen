# Open Match List Render

Use package reads to render open-match lists without forcing wallet connection.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not treat unavailable reads as empty data without an error state.
- Verify loading, empty, and populated list states.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO open match list: cache `getOpenMatches` result 30s — CELO block time is ~5s but list changes slowly.
