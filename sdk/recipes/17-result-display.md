# Result display

Use `resultOf` for local result previews:

```ts
const result = resultOf(Move.Rock, Move.Scissors); // 1, player A wins
```

The helper mirrors the contract result encoding.

Always show whether the result came from CELO mainnet (chainId 42220) or testnet.
