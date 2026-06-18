# Move labels

Use `formatMove` and `moveName` for logs and UI copy:

```ts
formatMove(Move.Paper); // "paper (Paper)"
```

This keeps dashboards and bots consistent.

CELO commit hashes are keccak256(address, move, salt) — the move label is revealed post-reveal.
