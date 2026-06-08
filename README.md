# Foreseen 👁️

> *"See the move before it's made."*

On-chain **Rock Paper Scissors** built on the **Celo** network and playable through **MiniPay** — reimagined as a mind sport. Foreseen turns a game of luck into a game of reading your opponent, with a tamper-proof **psychology & stats layer**, **ranked progression**, and **tournament brackets**, all settled trustlessly on-chain.

Built for the **Proof of Ship (POS) — Games & Interactive** program on Celo.

---

## Why on-chain

Mind games require trustless truth. If a server could fake stats, the entire psychology layer would collapse.

- **Tamper-proof stats & tells** — move distribution, contextual patterns, and timestamp tells stored immutably
- **Commit–reveal** — the only fair way to play RPS without a trusted referee
- **Soulbound rank badges** (ERC-5192) — achievements that can't be bought or transferred
- **Trustless prize pools** — tournament funds held by the contract, not a wallet

## Core features (v1)

- **Psychology / stats layer** — public on-chain stats with time-range filters and anomaly detection
- **Streak & rank** — Bronze → Silver → Gold → Platinum → Legend, as a soulbound NFT
- **Tournament brackets** — 4-player mini tournaments, winner-takes-most
- **Timestamp tells** — block timestamps reveal hesitation and decision confidence
- **SDK + bots** — open `@foreseen/sdk` with a first-class, player-deployable bot ecosystem

## Tech stack

| Layer | Tooling |
|---|---|
| Smart contracts | Foundry (Solidity 0.8.28) |
| Network | Celo **Sepolia testnet** |
| SDK | TypeScript + viem |
| Frontend | Next.js + wagmi + viem + MiniPay |

> Development runs entirely on **testnet** with free public RPCs and faucets.

## Repository layout

```
contracts/   # Foundry smart contracts (RPSCore, RPSStats, RPSRanked, RPSSoulbound, RPSTreasury)
sdk/         # @foreseen/sdk — TypeScript SDK + bot module  (coming soon)
frontend/    # Next.js + MiniPay app                        (coming soon)
```

## Getting started (contracts)

```bash
cd contracts
forge build
forge test
```

Copy `.env.example` to `.env` and fill in your testnet values before deploying to Celo Sepolia.

## Status

🚧 Early development — smart contracts in progress. See the design doc in `Foreseen_Brainstorm.md`.

---

*Rock. Paper. Scissors. Psychology.*
