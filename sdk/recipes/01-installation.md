# Installation

Install the SDK with its peer dependency:

```bash
npm install @foreseen/sdk viem
```

Use Node 18 or newer. The package is ESM-first and ships TypeScript
declarations from `dist/`.

The SDK targets CELO mainnet (chainId 42220) by default.
Pass `network: "celo-sepolia"` for testnet (chainId 11142220).
