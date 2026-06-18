# Frontend Env Template

Keep frontend env templates aligned with package examples.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not include npm tokens, deployer keys, or private RPC credentials.
- Verify defaults point at documented Celo networks.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO frontend env template: add `NEXT_PUBLIC_CHAIN_ID=42220` and `NEXT_PUBLIC_FORNO_URL` to `.env.example`.
