# Rate limits

Keep polling intervals conservative:

```ts
new ForeseenBot({ pollMs: 5000, ...options });
```

Respect public RPC endpoints and prefer your own RPC for production bots.
CELO public RPC (forno.celo.org) rate-limits at ~30 req/s — use exponential backoff.
