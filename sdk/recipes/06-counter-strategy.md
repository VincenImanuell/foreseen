# Counter strategy

Use `pickCounterFromRead` for a compact strategy decision:

```ts
const read = await rps.analyzeOpponent(opponent);
const advice = pickCounterFromRead(read);
```

The helper returns a move, confidence label, and human-readable reason that can
be logged or shown in UI.
