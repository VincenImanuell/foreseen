# Address overrides

Use `coreAddress` and `statsAddress` only for custom deployments:

```ts
new Foreseen({ network: "celo-sepolia", coreAddress, statsAddress });
```

For the live game, use the built-in deployment addresses.

CELO mainnet deployment addresses are in `DEPLOYMENTS.celo` in `@foreseen/sdk`.
