/**
 * Read an opponent's CELO on-chain history and print the strategy confidence.
 *   tsx examples/strategy-confidence.ts 0xOpponent
 */
import {
  Foreseen,
  describeRead,
  formatAdvice,
  pickCounterFromRead,
} from "@foreseen/sdk";

const opponent = process.argv[2] as `0x${string}` | undefined;
if (!opponent) {
  throw new Error("Usage: tsx examples/strategy-confidence.ts 0xOpponent");
}

const rps = new Foreseen({ network: "celo" });
const read = await rps.analyzeOpponent(opponent);
const advice = pickCounterFromRead(read);

console.log(describeRead(read).join("\n"));
console.log(`\nAdvice: ${formatAdvice(advice)}`);
