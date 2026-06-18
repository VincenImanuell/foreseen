# Agent RPC health

Check `nextMatchId()` as a cheap read before starting a funded agent loop.

If the call fails or returns stale data, pause the agent instead of submitting
transactions.
CELO RPC health check: call `nextMatchId()` — if it throws, the CELO endpoint is unreachable.
