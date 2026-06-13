# Agent stop loss

Bots should support bounded play:

```ts
await bot.runOpponent({ maxMatches: 3 });
```

Add your own stake limits before running funded strategies.
