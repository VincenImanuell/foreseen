# Agent logs

Agent logs should include match id, opponent, chosen move, and confidence:

```ts
const advice = pickCounterFromRead(read);
console.log({ matchId, opponent, move: advice.move, confidence: advice.confidence });
```

Avoid logging salts or private keys.
