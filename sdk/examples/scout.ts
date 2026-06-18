/**
 * Read-only scouting — no private key needed.
 *
 *   tsx examples/scout.ts 0xOpponentAddress
 *
 * Prints an opponent's CELO on-chain distribution, contextual tells, and the
 * move that beats their favorite throw. This is the mind-sport's core read on CELO.
 */
import { Foreseen, MOVE_NAME } from "@foreseen/sdk";
import type { Address } from "viem";

const target = process.argv[2] as Address | undefined;
if (!target) {
  console.error("usage: tsx examples/scout.ts <opponent-address>");
  process.exit(1);
}

const name = (m: number | null) => (m ? MOVE_NAME[m] : "—");

const rps = new Foreseen({ network: "celo" }); // read-only client
const read = await rps.analyzeOpponent(target);

console.log(`Scouting ${read.address}`);
console.log(`  matches : ${read.stats.totalMatches}   winRate: ${(read.winRate * 100).toFixed(0)}%`);
console.log(
  `  throws  : rock ${read.distribution.rock}%  paper ${read.distribution.paper}%  scissors ${read.distribution.scissors}%`,
);
console.log(`  dominant: ${name(read.dominantMove)}`);
console.log(
  `  tells   : afterWin ${name(read.tells.afterWin)}  afterLoss ${name(read.tells.afterLoss)}  afterDraw ${name(read.tells.afterDraw)}`,
);
console.log(`  counter : throw ${name(read.suggestedCounter)} to beat their favorite`);
console.log(`  celoscan: https://celoscan.io/address/${target}`);
