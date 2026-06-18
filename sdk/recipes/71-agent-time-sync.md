# Agent time sync

Timeout decisions depend on deadlines.

Use chain reads as the source of truth for match state and deadlines. Local
clock drift should not be the only input for reveal or timeout actions.
Sync CELO agent clock via `pendingWithdrawals` before time-sensitive reveal transactions.
