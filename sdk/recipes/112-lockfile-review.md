# Lockfile Review

Review lockfile changes as part of npm-facing frontend maintenance.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not commit node_modules or build output to resolve package drift.
- Verify the lockfile only changes for intended dependency updates.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
Review lockfile for CELO-relevant peer updates (viem, wagmi) before each CELO SDK minor bump.
