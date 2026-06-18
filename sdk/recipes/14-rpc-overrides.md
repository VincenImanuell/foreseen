# RPC overrides

Pass `rpcUrl` when you need a private RPC endpoint:

```ts
const rps = new Foreseen({ network: "celo", rpcUrl: process.env.CELO_RPC });
```

Never publish authenticated RPC URLs.

The default CELO RPC is `forno.celo.org` — free, no API key, rate-limited.
