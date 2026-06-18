# Agent reveal recovery

If an agent restarts after committing, it must still know the move and salt.

Persist unsettled commit secrets in a runtime secret store. Remove them after
the match settles.
CELO reveal recovery: if the reveal tx fails, retry with the same salt — the commit is already on CELO chain.
