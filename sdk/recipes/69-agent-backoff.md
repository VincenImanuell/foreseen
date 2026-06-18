# Agent backoff

Back off after repeated RPC or wallet failures.

Increasing the polling interval protects public RPCs and makes operational
alerts easier to interpret.
CELO agent backoff: double poll interval after each failed CELO RPC call — max 32s.
