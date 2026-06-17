# `@foreseen/sdk` examples

Small, runnable scripts that show the SDK end to end. They import the published
package (`@foreseen/sdk`); from inside this repo you can also point them at a
local build (`npm run build` in `sdk/`).

## Run them

These use top-level `await` and TypeScript, so the quickest runner is
[`tsx`](https://github.com/privatenumber/tsx):

```bash
npm i -g tsx           # or: npx tsx <file>

# read-only — no key, mainnet reads
tsx examples/scout.ts 0xOpponentAddress
tsx examples/list-open-matches.ts

# needs a funded wallet (defaults to Celo Sepolia testnet)
PRIVATE_KEY=0x... tsx examples/play-a-match.ts
PRIVATE_KEY=0x... tsx examples/run-bot-opponent.ts
```

| File | Key? | What it shows |
| --- | --- | --- |
| `scout.ts` | no | Read an opponent's on-chain distribution, tells, and suggested counter. |
| `list-open-matches.ts` | no | List matches waiting for an opponent. |
| `play-a-match.ts` | yes | Open → scout → commit → reveal → withdraw, the full lifecycle. |
| `run-bot-opponent.ts` | yes | A join-only cold-start opponent bot using the `counterStats` strategy. |
| `strategy-confidence.ts` | no | Print an opponent read with confidence and counter advice. |
| `read-only-dashboard.ts` | no | Generate compact scouting summaries for multiple players. |
| `agent-scouting-loop.ts` | no | Scan open matches and print counter advice for join-only agents. |

## Focused helper imports

Apps that only need labels, advice, or local commit helpers can import subpaths:

```ts
import { computeCommit } from "@foreseen/sdk/crypto";
import { pickCounterFromRead } from "@foreseen/sdk/strategy";
```

## Honesty note

Bots playing **real players** (cold-start opponents, player-deployed agents) are
a first-class feature. Running bots against **each other** in a funded loop to
manufacture volume, fees, or DAU is wash trading — don't. Label bot wallets
`[BOT]` and never report them as organic users.
