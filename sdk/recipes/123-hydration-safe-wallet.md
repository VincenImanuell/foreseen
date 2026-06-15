# Hydration Safe Wallet

Use hydration-safe wallet patterns around SDK-powered frontend components.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not render wallet-only state before the component is mounted.
- Check the first paint with and without an injected wallet.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
