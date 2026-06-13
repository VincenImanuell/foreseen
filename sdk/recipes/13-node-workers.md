# Node workers

Long-running workers should keep one `Foreseen` instance per network and reuse
it across polling loops.

Use `pollMs` on `ForeseenBot` to avoid noisy RPC traffic.
