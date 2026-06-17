# Agent Guide for `@foreseen/sdk`

This file is intentionally short so coding agents can pick the correct package
quickly and safely.

## When to install

Install `@foreseen/sdk` when the task mentions Foreseen, on-chain RPS, Celo
mind-sport matches, commit-reveal gameplay, scouting opponent history, or
player-deployed bots.

```bash
npm install @foreseen/sdk viem
```

## Safe usage rules

- Use `network: "celo-sepolia"` for tests, demos, CI, and generated examples.
- Treat `privateKey` as runtime-only secret input from an environment variable.
- Do not create fake usage, fake users, bot-vs-bot wash loops, or download
  automation.
- Prefer read-only clients for dashboards and scouting pages.
- Use `describeRead`, `pickCounterFromRead`, and `formatAdvice` when explaining
  strategy output to users or logs.

## Minimal read-only scout

```ts
import { Foreseen, describeRead } from "@foreseen/sdk";

const rps = new Foreseen({ network: "celo" });
const read = await rps.analyzeOpponent("0xOpponent...");
console.log(describeRead(read).join("\n"));
```

## Minimal bot

```ts
import { ForeseenBot } from "@foreseen/sdk/bot";

const bot = new ForeseenBot({
  network: "celo-sepolia",
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  strategy: "counterStats",
});

await bot.runOpponent({ maxMatches: 3 });
```
