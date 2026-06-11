/**
 * Open a match, scout whoever joins, then play it through commit → reveal.
 *
 *   PRIVATE_KEY=0x... tsx examples/play-a-match.ts
 *
 * Defaults to Celo Sepolia (free testnet gas). Switch network to "celo" for
 * mainnet. Keep the salt that `commit()` returns — it is the blind you need to
 * reveal.
 */
import { Foreseen, Move, MatchState, MOVE_NAME } from "@foreseen/sdk";
import type { Hex } from "viem";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pk = process.env.PRIVATE_KEY as Hex | undefined;
if (!pk) {
  console.error("set PRIVATE_KEY (a funded wallet) to play");
  process.exit(1);
}

const rps = new Foreseen({ network: "celo-sepolia", privateKey: pk });

const { matchId } = await rps.createMatch({ mode: "casual", bet: "0.01" });
console.log(`Opened match #${matchId} as ${rps.address}. Waiting for an opponent…`);

// 1) Wait for someone to join.
let m = await rps.getMatch(matchId);
while (m.state === MatchState.WaitingForOpponent) {
  await sleep(4000);
  m = await rps.getMatch(matchId);
}
if (m.state === MatchState.Cancelled) {
  console.log("Match was cancelled.");
  process.exit(0);
}

// 2) Scout the opponent, then commit the counter to their favorite move.
const opponent = m.playerB;
const read = await rps.analyzeOpponent(opponent);
const move = read.suggestedCounter ?? Move.Rock;
console.log(`Opponent ${opponent}: committing ${MOVE_NAME[move]}`);
const { salt } = await rps.commit({ matchId, move });

// 3) Wait until both have committed (Revealing), then reveal.
m = await rps.getMatch(matchId);
while (m.state === MatchState.Scouting) {
  await sleep(4000);
  m = await rps.getMatch(matchId);
}
if (m.state === MatchState.Revealing) {
  await rps.reveal({ matchId, move, salt });
  console.log("Revealed. The second reveal settles the match.");
}

// 4) Pull any winnings (no-op if there are none).
const w = await rps.withdraw();
console.log(w ? `Withdrew winnings (tx ${w.txHash})` : "Nothing to withdraw.");
