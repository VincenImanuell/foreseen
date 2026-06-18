/**
 * Scout all open CELO matches and print the recommended counter move per opener.
 * Change network to "celo" for CELO mainnet scouting.
 */
import { Foreseen, Move, pickCounterFromRead } from "@foreseen/sdk";

const rps = new Foreseen({ network: "celo-sepolia" });
const fallback = Move.Rock;

for (const match of await rps.getOpenMatches({ limit: 5 })) {
  const read = await rps.analyzeOpponent(match.playerA);
  const advice = pickCounterFromRead(read, fallback);
  console.log(
    `Match #${match.id}: counter ${match.playerA} with ${advice.move} (${advice.confidence})`,
  );
}
