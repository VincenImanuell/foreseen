# SDK RPC timeout

RPC timeouts should be handled separately from contract reverts.

Timeouts can often be retried or routed to another RPC. Reverts usually require
fixing state, inputs, or timing.
