# Rate limits

Keep polling intervals conservative:

```ts
new ForeseenBot({ pollMs: 5000, ...options });
```

Respect public RPC endpoints and prefer your own RPC for production bots.
