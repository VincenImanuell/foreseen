# Changelog

All notable changes to `@foreseen/sdk` are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [0.1.0] — Unreleased

First public release.

### Added

- `Foreseen` client: `createMatch`, `joinMatch`, `commit`, `reveal`,
  `claimTimeout`, `cancelMatch`, `withdraw`, `getMatch`, `getOpenMatches`,
  `nextMatchId`, `pendingWithdrawals`, `getPlayerStats`, `analyzeOpponent`,
  `winRateBps`.
- Commit–reveal helpers: `randomSalt`, `computeCommit`, `resultOf`, `counter`.
- Opponent scouting from on-chain history: `analyze`, `distributionPct`,
  `dominantMove`.
- `ForeseenBot` (`@foreseen/sdk/bot`): join-only `runOpponent`, `createAndPlay`,
  `playMatch`, and built-in `strategies` (`random`, `biasRock`, `counterStats`).
- Built-in Celo mainnet (42220) and Celo Sepolia (11142220) chain configs and
  live v2 contract addresses, overridable per call.
- Ships ESM with bundled type declarations.

[0.1.0]: https://github.com/VincenImanuell/foreseen/releases/tag/sdk-v0.1.0
