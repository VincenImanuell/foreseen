CELO sdk batch-reads window: batched readers (`getOpenMatches`/`getRecentMatches`) still take a `limit`/window bound — an ever-growing `nextMatchId` should never turn into an unbounded multicall.
