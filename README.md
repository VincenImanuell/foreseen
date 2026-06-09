# Foreseen 👁️

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
sdk/         # @foreseen/sdk — TypeScript SDK + bot module  (coming soon)
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
| `RPSCore` | [`0xcbdF1F8B2bfC2b482A63CdFA4e20077EEb3D1f80`](https://celoscan.io/address/0xcbdF1F8B2bfC2b482A63CdFA4e20077EEb3D1f80) |
| `RPSStats` | [`0x50dF5d5924dA98Ab8e84329d47048c54094c16D8`](https://celoscan.io/address/0x50dF5d5924dA98Ab8e84329d47048c54094c16D8) |
| `RPSRanked` | [`0x7a5B97Ad9aa3E98Ca2f8e63312Fc70e52ed869D5`](https://celoscan.io/address/0x7a5B97Ad9aa3E98Ca2f8e63312Fc70e52ed869D5) |
| `RPSSoulbound` | [`0x1cCE5ecE0E7F8fb5C6523293E87d70C11Fb5A45A`](https://celoscan.io/address/0x1cCE5ecE0E7F8fb5C6523293E87d70C11Fb5A45A) |
| `RPSTreasury` | [`0x81A445ec7fC8d41956b2a8811b57597b3e1Fc985`](https://celoscan.io/address/0x81A445ec7fC8d41956b2a8811b57597b3e1Fc985) |

The full 5-contract system, wired and writer-locked to `RPSCore`. Full record in [`deployments/celo-mainnet.json`](deployments/celo-mainnet.json).

### Celo Sepolia (testnet · chain ID `11142220`)

| Contract | Address |
|---|---|
| `RPSCore` | [`0x208f098639059dF8E19a4F6836908b3cc56CdFf9`](https://celo-sepolia.blockscout.com/address/0x208f098639059dF8E19a4F6836908b3cc56CdFf9) |
| `RPSStats` | [`0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7`](https://celo-sepolia.blockscout.com/address/0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7) |

Both verified on Blockscout. `RPSCore` feeds `RPSStats` on settlement and the stats recorder is permanently locked to `RPSCore`, so player stats are tamper-proof. Full record in [`deployments/celo-sepolia.json`](deployments/celo-sepolia.json).

## Status

The full v1 contract system (Core, Stats, Ranked, Soulbound, Treasury) is **live on Celo mainnet** and the Next.js dapp is wired to it. SDK + bot ecosystem next. See the design doc in `Foreseen_Brainstorm.md`.

---

*A mind sport. Rock-Paper-Scissors is just the costume.*
