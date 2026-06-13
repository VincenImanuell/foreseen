# Bet formatting

The SDK accepts `bet` as a decimal string or bigint:

```ts
await rps.createMatch({ mode: "casual", bet: "0.05" });
```

Use bigint values when preserving exact amounts across backend jobs.
