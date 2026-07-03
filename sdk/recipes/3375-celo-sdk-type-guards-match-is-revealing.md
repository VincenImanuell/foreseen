CELO sdk type-guards matchIsRevealing: `matchIsRevealing(match)` marks `MatchState.Revealing` — the only state where `reveal` is valid; outside it a reveal tx will just revert on-chain.
