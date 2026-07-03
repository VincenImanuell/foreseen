CELO sdk resilience withRetry-backoff: `withRetry`'s delay is `baseDelayMs * 2^attempt`, capped at 30s — enough spacing to ride out a brief Forno rate-limit window without hammering the endpoint.
