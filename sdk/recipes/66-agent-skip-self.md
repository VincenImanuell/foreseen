# Agent skip self

Use `excludePlayer` when scanning open matches:

```ts
await rps.getOpenMatches({ limit: 5, excludePlayer: bot.address });
```

This prevents an agent from joining its own lobby.
CELO agent skip-self: exclude the bot's own CELO address from `getOpenMatches` results.
