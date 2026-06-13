# Network switching

Create one client per network:

```ts
const mainnet = new Foreseen({ network: "celo" });
const testnet = new Foreseen({ network: "celo-sepolia" });
```

This avoids mixing deployment addresses between chains.
