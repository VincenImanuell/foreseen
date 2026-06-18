# Browser Only Boundary

Document browser-only SDK usage when the frontend depends on `window` or injected wallets.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not import browser-only code into server-rendered paths.
- Check Next build output for server-component import errors.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO browser-only boundary: gate wagmi/viem imports with `'use client'` — SSR must not touch CELO wallet.
