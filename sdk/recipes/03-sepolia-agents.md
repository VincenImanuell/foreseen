# Sepolia agents

Use Celo Sepolia for bot and agent testing:

```ts
const rps = new Foreseen({
  network: "celo-sepolia",
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
});
```

Never commit test keys. Keep them in local environment variables or CI secrets.

Switch to CELO mainnet for production: `network: "celo"` (chainId 42220).
