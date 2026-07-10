# Changelog

All notable changes to `@foreseen/sdk` are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `getPlayerStatsBatch(addresses)` — multicall round-trip for `RPSStats.getStats`
  across many addresses, for leaderboard-shaped call sites that previously fired
  one RPC call per player. Failed slots decode to zero stats so the result stays
  aligned 1:1 with the input.
- `getGlobalStats(opts)` — deployment-wide snapshot: exact `totalMatchesCreated`
  from `nextMatchId`, plus a settled/cancelled/active/volume breakdown over a
  bounded recent-match scan.

### Changed

- Write calls (`createMatch`, `joinMatch`, `commit`, `reveal`, …) now retry the
  post-broadcast receipt poll on a transient CELO RPC error. The broadcast
  itself is never retried, so a flaky RPC can't cause a duplicate on-chain
  effect — only the already-idempotent receipt read is re-attempted.

## [0.1.0]

First public release.

### Added

- `Foreseen` client: `createMatch`, `joinMatch`, `commit`, `reveal`,
  `claimTimeout`, `cancelMatch`, `withdraw`, `getMatch`, `getOpenMatches`,
  `nextMatchId`, `pendingWithdrawals`, `getPlayerStats`, `analyzeOpponent`,
  `winRateBps`.
- Commit–reveal helpers: `randomSalt`, `computeCommit`, `resultOf`, `counter`.
- Opponent scouting from on-chain history: `analyze`, `distributionPct`,
  `dominantMove`.
- Strategy formatting helper: `formatAdvice` for compact dashboard and agent
  logs.
- `ForeseenBot` (`@foreseen/sdk/bot`): join-only `runOpponent`, `createAndPlay`,
  `playMatch`, and built-in `strategies` (`random`, `biasRock`, `counterStats`).
- Built-in Celo mainnet (42220) and Celo Sepolia (11142220) chain configs and
  live v2 contract addresses, overridable per call.
- Focused npm subpath exports for `abi`, `addresses`, `chains`, `crypto`,
  `scout`, `strategy`, and `types`.
- Ships ESM with bundled type declarations.
- Publish readiness check via `npm run publish:check`.

[0.1.0]: https://github.com/VincenImanuell/foreseen/releases/tag/sdk-v0.1.0
