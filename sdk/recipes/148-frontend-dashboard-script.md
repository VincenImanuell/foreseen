# Frontend Dashboard Script

Document npm scripts that dashboard builders can run while testing SDK-powered pages.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not list scripts that are missing from the app package.
- Verify each command exits cleanly before adding it to docs.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO frontend dashboard script: `npm run dev` with `NEXT_PUBLIC_CHAIN_ID=42220` for CELO mainnet preview.
