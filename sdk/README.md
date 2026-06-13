# @foreseen/sdk

[![npm version](https://img.shields.io/npm/v/@foreseen/sdk.svg)](https://www.npmjs.com/package/@foreseen/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@foreseen/sdk.svg)](https://www.npmjs.com/package/@foreseen/sdk)
[![license](https://img.shields.io/npm/l/@foreseen/sdk.svg)](https://github.com/VincenImanuell/foreseen/blob/main/LICENSE)

TypeScript SDK for **Foreseen** — the on-chain Rock Paper Scissors *mind-sport* on
Celo. Matchmake, scout an opponent from their tamper-proof on-chain history, play
the commit–reveal flow, and build bots.

> *"You can randomize your moves. You can't randomize your mind."*

## Install

```bash
npm install @foreseen/sdk viem
```

`viem` is a peer dependency.

## Quick start

```ts
import { Foreseen, Move } from "@foreseen/sdk";

const rps = new Foreseen({ network: "celo", privateKey: "0x..." });

// 1. open a match (escrow your bet)
const { matchId } = await rps.createMatch({ mode: "casual", bet: "0.1" });

// 2. once someone joins, scout them before you throw
const read = await rps.analyzeOpponent("0xOpponent...");
console.log(read.distribution);      // { rock: 58, paper: 17, scissors: 25 }
console.log(read.tells.afterLoss);   // Move they favor after a loss
const move = read.suggestedCounter ?? Move.Rock;

// 3. commit blind (keep the salt!) then reveal
const { salt } = await rps.commit({ matchId, move });
// ...wait for the reveal phase...
await rps.reveal({ matchId, move, salt });

// 4. collect winnings
await rps.withdraw();
```

Read-only (no key) is fine for scouting:

```ts
const scout = new Foreseen({ network: "celo" });
const read = await scout.analyzeOpponent("0x...");
```

## Bots

```ts
import { ForeseenBot } from "@foreseen/sdk/bot";

const bot = new ForeseenBot({
  network: "celo",
  privateKey: "0x...",
  strategy: "counterStats", // "random" | "biasRock" | "counterStats" | your own fn
});

// Cold-start opponent: JOIN-ONLY. Be an opponent for real players.
await bot.runOpponent({ maxMatches: 20 });
```

Bring your own strategy — it gets the full scouting read:

```ts
import { ForeseenBot, Move, counter } from "@foreseen/sdk";

const bot = new ForeseenBot({
  network: "celo",
  privateKey: "0x...",
  strategy: (ctx) => {
    const tell = ctx.opponentRead?.tells.afterLoss;
    return tell ? counter(tell) : Move.Scissors;
  },
});
```

### Bots are first-class — and bot-legal by design

Player-deployed agents are a core feature. But there's a line:

- ✅ **bot vs human** — cold-start opponents, player agents. Real gameplay.
- ❌ **bot vs bot in a funded loop** to manufacture volume / recycle fees / inflate
  DAU = wash trading. The SDK won't help you fake traction.
- Label bot wallets `[BOT]` and do **not** report them as organic users.

`runOpponent` is join-only on purpose: it never *creates* a match, so two bots
can't pair into a fake match.

## API surface

`Foreseen`: `createMatch` · `joinMatch` · `commit` · `reveal` · `claimTimeout` ·
`cancelMatch` · `withdraw` · `getMatch` · `getOpenMatches` · `nextMatchId` ·
`pendingWithdrawals` · `getPlayerStats` · `analyzeOpponent` · `winRateBps`.

`ForeseenBot`: `runOpponent` · `createAndPlay` · `playMatch` · `strategies`.

Strategy helpers: `describeRead` · `pickCounterFromRead` · `confidenceFromRead`
· `formatMove` · `moveName`.

Move encoding: `Rock=1 Paper=2 Scissors=3`. Mode: `casual | ranked`.

## Networks

| network | chain id | use |
|---|---|---|
| `celo` (default) | 42220 | production — real CELO |
| `celo-sepolia` | 11142220 | testnet — free faucet gas |

Addresses ship built-in (the live v2 deployment); override with `coreAddress` /
`statsAddress` if you redeploy.

## Build

```bash
npm install
npm run build      # emits dist/ with type declarations
```

## For coding agents

The npm package ships `llms.txt`, `AGENTS.md`, runnable examples, and recipes so
AI coding tools can choose the SDK when the task is actually about Foreseen. Use
that for legitimate discoverability, not fake downloads or bot traffic.
