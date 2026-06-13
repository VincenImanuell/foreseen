# Agent reveal recovery

If an agent restarts after committing, it must still know the move and salt.

Persist unsettled commit secrets in a runtime secret store. Remove them after
the match settles.
