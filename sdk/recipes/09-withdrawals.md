# Withdrawals

Foreseen stores winnings, refunds, and timeout claims in pending withdrawals.

```ts
const amount = await rps.pendingWithdrawals(address);
if (amount > 0n) await rps.withdraw();
```

`withdraw()` returns `null` when there is nothing to collect.

CELO winnings accumulate in `pendingWithdrawals` until `withdraw()` is called.
