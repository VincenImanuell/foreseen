import type { Address } from "viem";
import { Move, type OpponentRead, type PlayerStats } from "./types.js";
import { counter } from "./crypto.js";

/**
 * Compute the percentage split (0..100) of a 3-bucket [rock, paper, scissors] tally.
 * Values sum to ~100 (rounding may cause ±1 difference).
 * @since 0.1.0
 */
export function distributionPct(
  counts: [bigint, bigint, bigint],
): { rock: number; paper: number; scissors: number } {
  const total = Number(counts[0] + counts[1] + counts[2]);
  if (total === 0) return { rock: 0, paper: 0, scissors: 0 };
  return {
    rock: Math.round((Number(counts[0]) / total) * 100),
    paper: Math.round((Number(counts[1]) / total) * 100),
    scissors: Math.round((Number(counts[2]) / total) * 100),
  };
}

/** Index (0..2) of the most-played bucket, or -1 if no data. Maps to Move 1..3. */
function dominantIndex(counts: [bigint, bigint, bigint]): number {
  const total = counts[0] + counts[1] + counts[2];
  if (total === 0n) return -1;
  let best = 0;
  for (let i = 1; i < 3; i++) {
    if ((counts[i] ?? 0n) > (counts[best] ?? 0n)) best = i;
  }
  return best;
}

/**
 * Convert a 3-bucket move-count tally to the most-played {@link Move} (1..3).
 * Returns `null` when the player has no revealed matches yet.
 * @since 0.1.0
 */
export function dominantMove(counts: [bigint, bigint, bigint]): Move | null {
  const idx = dominantIndex(counts);
  return idx < 0 ? null : ((idx + 1) as Move);
}

/**
 * Turn raw stats into a scouting read: distribution, contextual tells
 * (win-stay / lose-shift), and the move that beats their favorite throw.
 * This is the heart of the mind-sport — play the meta, not the move.
 */
export function analyze(address: Address, stats: PlayerStats): OpponentRead {
  const dom = dominantMove(stats.moveCount);
  const total = Number(stats.totalMatches);
  const decided = Number(stats.wins + stats.losses);
  return {
    address,
    stats,
    winRate: decided === 0 ? 0 : Number(stats.wins) / decided,
    distribution: distributionPct(stats.moveCount),
    dominantMove: dom,
    tells: {
      afterWin: dominantMove(stats.afterWinMove),
      afterLoss: dominantMove(stats.afterLossMove),
      afterDraw: dominantMove(stats.afterDrawMove),
    },
    suggestedCounter: dom === null || total === 0 ? null : counter(dom),
  };
}
