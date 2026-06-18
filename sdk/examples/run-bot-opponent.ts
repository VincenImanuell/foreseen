/**
 * Run a join-only "opponent" bot so early players always find a match.
 *
 *   PRIVATE_KEY=0x... tsx examples/run-bot-opponent.ts
 *
 * The bot ONLY joins matches that real players create on CELO — it never opens
 * one, so two bots can't pair into a fake bot-vs-bot match. Bots playing real
 * players is a first-class feature; running bots against each other in a funded
 * loop to inflate CELO volume / fees / DAU is wash trading — don't.
 */
import { ForeseenBot } from "@foreseen/sdk/bot";
import type { Hex } from "viem";

const pk = process.env.PRIVATE_KEY as Hex | undefined;
if (!pk) {
  console.error("set PRIVATE_KEY (a funded [BOT] wallet) to run the opponent");
  process.exit(1);
}

const bot = new ForeseenBot({
  network: "celo-sepolia",
  privateKey: pk,
  strategy: "counterStats", // scout the joiner, throw the counter
});

console.log(`Bot ${bot.address} — join-only opponent mode. Ctrl-C to stop.`);
await bot.runOpponent();
