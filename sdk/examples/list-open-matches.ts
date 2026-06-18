/**
 * List open matches waiting for an opponent — read-only, no key needed.
 *
 *   tsx examples/list-open-matches.ts
 */
import { Foreseen, Mode } from "@foreseen/sdk";
import { formatEther } from "viem";

const rps = new Foreseen({ network: "celo" });
const open = await rps.getOpenMatches({ limit: 10 });

if (open.length === 0) {
  console.log("No open matches right now — create one to get the ball rolling.");
  process.exit(0);
}

const totalCelo = open.reduce((sum, m) => sum + m.bet, 0n);
console.log(`${open.length} open match(es) — ${formatEther(totalCelo)} CELO total at stake:`);
for (const m of open) {
  const mode = m.mode === Mode.Ranked ? "ranked" : "casual";
  console.log(`  #${m.id}  ${formatEther(m.bet)} CELO  ${mode}  opened by ${m.playerA}`);
}
