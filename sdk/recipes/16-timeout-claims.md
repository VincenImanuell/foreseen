# Timeout claims

`claimTimeout` checks the current match state and calls the correct contract
method:

```ts
await rps.claimTimeout({ matchId });
```

Use it when commit or reveal windows have elapsed.
