# Agent stop loss

Bots should support bounded play:

```ts
await bot.runOpponent({ maxMatches: 3 });
```

Add your own stake limits before running funded strategies.
CELO agent stop-loss: cap maximum CELO stake per match and halt if cumulative loss exceeds threshold.
