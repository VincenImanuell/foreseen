# Open match feed

`getOpenMatches` returns waiting lobbies newest-first:

```ts
const matches = await rps.getOpenMatches({ limit: 10, excludePlayer: myAddress });
```

Use `excludePlayer` for join-only bots so they never target their own lobby.

The feed polls CELO mainnet via `getOpenMatches` — no indexer needed.
