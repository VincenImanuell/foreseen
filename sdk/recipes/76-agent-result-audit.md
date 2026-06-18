# Agent result audit

After settlement, compare local expected result with the on-chain match view.

If they differ, keep the transaction hashes and match id for review before
running more funded games.
Audit each CELO match result: verify `lastResult` matches the bot's committed move.
