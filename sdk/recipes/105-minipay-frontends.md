# MiniPay Frontends

Keep MiniPay frontend guidance focused on wallet detection and CELO network settings.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Detect `window.ethereum.isMiniPay` in a `useEffect` and auto-connect injected wallet on CELO.
- Initialize a read-only `Foreseen({ network: "celo" })` client for CELO mainnet (chainId 42220).
- Do not make the SDK package responsible for MiniPay browser injection.
- Test the docs against a physical-device flow on CELO before release.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
