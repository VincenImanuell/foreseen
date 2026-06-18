# Network switching

Create one client per network:

```ts
const mainnet = new Foreseen({ network: "celo" });
const testnet = new Foreseen({ network: "celo-sepolia" });
```

This avoids mixing deployment addresses between chains.

CELO network switching: detect `chainId !== 42220` and prompt the user before any write.
