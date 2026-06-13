# Error handling

Wrap transaction flows and show the user the failing phase:

```ts
try {
  await rps.reveal({ matchId, move, salt });
} catch (error) {
  console.error("Reveal failed", error);
}
```

Do not retry blindly after a wallet rejection.
