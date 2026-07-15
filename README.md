# Foreseen 👁️

🏆 **Top 26 of 314 projects — Celo Proof of Ship (Games & Interactive)**

[![npm version](https://img.shields.io/npm/v/@foreseen/sdk.svg)](https://www.npmjs.com/package/@foreseen/sdk)
[![Contracts CI](https://github.com/VincenImanuell/foreseen/actions/workflows/ci.yml/badge.svg)](https://github.com/VincenImanuell/foreseen/actions/workflows/ci.yml)
[![SDK CI](https://github.com/VincenImanuell/foreseen/actions/workflows/sdk.yml/badge.svg)](https://github.com/VincenImanuell/foreseen/actions/workflows/sdk.yml)
[![Frontend CI](https://github.com/VincenImanuell/foreseen/actions/workflows/frontend.yml/badge.svg)](https://github.com/VincenImanuell/foreseen/actions/workflows/frontend.yml)

> *"See the move before it's made."*

**Foreseen is a competitive mind sport** — a game of reading, predicting, and outplaying the person across from you — built on-chain on the **Celo** network and played through **MiniPay**.

It wears Rock-Paper-Scissors as a disguise. The three moves are deliberately trivial: a minimal, universally understood decision primitive anyone can play in seconds. But the throw is not the game. The game is everything *around* it — patterns, tells, baiting, bluffing, and scouting an opponent's mind from their permanent on-chain history.

Built for the **Proof of Ship (POS) — Games & Interactive** program on Celo.

---

## Not gambling — a game of skill

**Foreseen is a competitive mind-sport, not a game of chance.** The distinction is deliberate and structural:

- **Skill, not luck.** You win by *out-reading* your opponent — their move distribution, win-stay / lose-shift habits, timing tells, and bluffs. There is **no random number generator** anywhere in the protocol; no outcome is left to chance.
- **No house, no dealer.** The smart contract is a neutral referee. It escrows a **peer-to-peer** stake between two players and pays the winner. The protocol never bets against you and has no stake in who wins.
- **Provably fair.** Commit–reveal means neither side can see or react to the other's move, and every result is verifiable on-chain — no hidden edge, no manipulation.
- **Merit, not money.** Soulbound rank badges (Bronze → Legend) prove skill and cannot be bought, sold, or transferred.
- **Transparent fee.** The small settlement fee funds player rewards and development — it is not a casino margin.

Optional CELO stakes make matches competitive: a wager on **your own skill**, the same way chess or esports prize play does. Play responsibly and stake only what you can afford to lose.

---

## This is not Rock-Paper-Scissors

Basic RPS is a coin flip. Foreseen is a skill game wearing one as a costume:

- The moves are simple **on purpose** — three throws keep the barrier to entry at zero. All the depth lives in the **meta**, where simple choices can't hide a mind.
- You don't win by guessing. You win by **out-reading** your opponent: their move distribution, what they throw after a win or a loss, how long they hesitate, how they react to a taunt.
- Every ranked match writes to a **tamper-proof behavioral profile** that anyone can scout *before* they ever face you. On-chain history can't be hidden or faked.

> *"You can randomize your moves. You can't randomize your mind."*

## The mind-sport layer (this is the actual game)

- **Behavioral profiling** — tamper-proof on-chain stats: move distribution and contextual patterns (the win-stay / lose-shift signal), with time-range filters that expose tilt and strategy shifts.
- **Tells from timestamps** — block timestamps turn hesitation into data: a fast commit reads as conviction, a slow one as second-guessing.
- **Scouting** — study any opponent's full history before the match starts. Reputation is permanent and verifiable.
- **Bluffing & psychology** — on-chain taunts and confidence raises become part of the read, not just flavor.
- **Ranked progression** — soulbound rank badges (Bronze → Legend) that prove skill, not luck or money.
- **An engine, not a clone** — an open SDK + bot ecosystem so players build agents that play the *meta*, not the moves.

## Why it can only exist on-chain

A mind sport needs a single source of truth. If a server could fake or hide stats, the entire read collapses.

- **Tamper-proof stats & tells** — behavioral data stored immutably; a player's history is permanent and unforgeable
- **Commit–reveal** — fair, refereeless play where neither side can react to the other's choice
- **Soulbound rank badges** (ERC-5192) — achievements that can't be bought or transferred
- **Trustless prize pools** — tournament funds held by the contract, not a wallet

## Tech stack

| Layer | Tooling |
|---|---|
| Smart contracts | Foundry (Solidity 0.8.28) |
| Network | Celo **mainnet** (chain `42220`) · Sepolia testnet for dev |
| SDK | TypeScript + viem |
| Frontend | Next.js + wagmi + viem + MiniPay |

> Production is live on **Celo mainnet**; development uses Celo Sepolia testnet with free public RPCs.

## Repository layout

```
contracts/   # Foundry smart contracts (RPSCore, RPSStats, RPSRanked, RPSSoulbound, RPSTreasury)
frontend/    # Next.js + wagmi + MiniPay dapp (live on Celo mainnet)
sdk/         # @foreseen/sdk — TypeScript SDK + bot module (published on npm)
```

## Getting started (contracts)

```bash
cd contracts
forge build
forge test
```

Copy `.env.example` to `.env` and fill in your testnet values before deploying to Celo Sepolia.

## Deployments

### Celo mainnet (production · chain ID `42220`)

| Contract | Address |
|---|---|
| `RPSCore` | [`0x4DFc92FF97378D0F5E82d44EB968cb7793C5b90e`](https://celoscan.io/address/0x4DFc92FF97378D0F5E82d44EB968cb7793C5b90e) |
| `RPSStats` | [`0x0f5F94A4f5C72CAc4D6E69a6DD89341c7b1a475A`](https://celoscan.io/address/0x0f5F94A4f5C72CAc4D6E69a6DD89341c7b1a475A) |
| `RPSRanked` | [`0x8230D28C9a8Fbda2490F830c6cBc1cE3056096cb`](https://celoscan.io/address/0x8230D28C9a8Fbda2490F830c6cBc1cE3056096cb) |
| `RPSSoulbound` | [`0x0bF75Da1E76df7c7619d1Beb738DD34b96EDd8b6`](https://celoscan.io/address/0x0bF75Da1E76df7c7619d1Beb738DD34b96EDd8b6) |
| `RPSTreasury` | [`0xFF81B19dE799e828f3b76bC3240896Fa73d22540`](https://celoscan.io/address/0xFF81B19dE799e828f3b76bC3240896Fa73d22540) |

The full 5-contract system (v2, matchmaking-first), wired and writer-locked to `RPSCore`. Players matchmake, scout, then commit — see the flow in [`contracts/src/RPSCore.sol`](contracts/src/RPSCore.sol). Full record in [`deployments/celo-mainnet.json`](deployments/celo-mainnet.json).

### Celo Sepolia (testnet · chain ID `11142220`)

| Contract | Address |
|---|---|
| `RPSCore` | [`0x208f098639059dF8E19a4F6836908b3cc56CdFf9`](https://celo-sepolia.blockscout.com/address/0x208f098639059dF8E19a4F6836908b3cc56CdFf9) |
| `RPSStats` | [`0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7`](https://celo-sepolia.blockscout.com/address/0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7) |

Both verified on Blockscout. `RPSCore` feeds `RPSStats` on settlement and the stats recorder is permanently locked to `RPSCore`, so player stats are tamper-proof. Full record in [`deployments/celo-sepolia.json`](deployments/celo-sepolia.json).

## Status

The full v1 contract system (Core, Stats, Ranked, Soulbound, Treasury) is **live on Celo mainnet**, the Next.js dapp is wired to it, and `@foreseen/sdk` is published on npm with a bot module. See the design doc in `Foreseen_Brainstorm.md`.

---

*A mind sport. Rock-Paper-Scissors is just the costume.*
