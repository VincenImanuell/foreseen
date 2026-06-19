# CELO SDK Recipes

One-liner, copy-pasteable notes for building on **Foreseen** — commit-reveal Rock-Paper-Scissors
on **CELO mainnet (chainId 42220)** — with the [`@foreseen/sdk`](https://www.npmjs.com/package/@foreseen/sdk).

Each file is a single focused recipe named `NNNN-celo-sdk-<category>-<aspect>.md`. They are intentionally
small so they are easy to scan, grep, and lift into real integration code.

## How to use

```bash
# find every recipe about a topic
grep -rl "minipay" sdk/recipes/

# read one
cat sdk/recipes/1352-celo-sdk-wallet-minipay-flag.md
```

## Categories

Recipes span the full RPS integration surface on CELO:

- **Chain & RPC** — viem `celo` config, Forno endpoints, ~1s block time, finality, L2-migration awareness, Celoscan links, Multicall3.
- **Fees & gas** — CIP-64 fee-currency txs, whitelist lookup, token gas estimation, balance precheck, native fallback, MiniPay cUSD defaulting.
- **Wallets** — injected/MiniPay/Valora detection, add/switch chain, EIP-1193 events, viem wallet vs public client split, read-only fallback.
- **SDK DX** — tree-shaking, named exports, typed errors, input validation, JSDoc examples, semver, bigint serialization, AbortSignal.
- **Reads & data** — leaderboard, scouting, open matches, event logs, pagination, caching, multicall batching.
- **Quality** — testing, mocking, a11y, i18n, security/validation, CI/deploy, docs/onboarding.

## Conventions

- Topics target the published SDK and the on-chain contracts (`RPSCore`, `RPSStats`, `RPSRanked`); recipes
  never alter contract logic.
- All examples assume CELO mainnet 42220 unless a recipe says otherwise.
