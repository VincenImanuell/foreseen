# Ci Npm Build

Keep CI package builds aligned with frontend expectations.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not publish from a workflow that skipped typecheck or build.
- Verify release workflows run on the package directory that owns `package.json`.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO CI npm build: add `NEXT_PUBLIC_CHAIN_ID=42220` env var in CI for CELO mainnet builds.
