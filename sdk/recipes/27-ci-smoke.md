# CI smoke test

Use read-only calls in CI:

```ts
const rps = new Foreseen({ network: "celo-sepolia" });
await rps.nextMatchId();
```

Avoid funded transaction tests in public CI unless secrets are protected.
