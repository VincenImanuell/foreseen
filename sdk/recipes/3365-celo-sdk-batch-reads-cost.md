CELO sdk batch-reads cost: batching N `getMatch` reads into one multicall cuts N public-CELO-RPC round-trips to 1, which matters on rate-limited Forno endpoints during a busy lobby poll.
