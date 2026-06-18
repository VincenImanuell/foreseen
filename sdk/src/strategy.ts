import { counter } from "./crypto.js";
import { Move, MOVE_NAME, type OpponentRead } from "./types.js";

/**
 * Confidence tier for a scouting read. "none" = no history, "high" = strong sample.
 * @since 0.1.0
 */
export type ScoutingConfidence = "none" | "low" | "medium" | "high";

/**
 * The output of {@link pickCounterFromRead}: the recommended move, how
 * confident the recommendation is, and a human-readable reason string.
 * @since 0.1.0
 */
export interface StrategyAdvice {
  move: Move;
  confidence: ScoutingConfidence;
  reason: string;
}

const MOVE_EMOJI: Record<Move, string> = {
  [Move.None]: "-",
  [Move.Rock]: "rock",
  [Move.Paper]: "paper",
  [Move.Scissors]: "scissors",
};

function dominantShare(read: OpponentRead): number {
  const { rock, paper, scissors } = read.distribution;
  return Math.max(rock, paper, scissors);
}

/** Return the human-readable name for a move (e.g. "Rock"). Falls back to "Unknown". */
export function moveName(move: Move | null | undefined): string {
  return move ? MOVE_NAME[move] ?? "Unknown" : "Unknown";
}

export function formatMove(move: Move | null | undefined): string {
  return move ? `${MOVE_EMOJI[move]} (${moveName(move)})` : "unknown";
}

/**
 * Derive a {@link ScoutingConfidence} tier from a scouting read.
 * Requires ≥24 matches and a ≥46% dominant share for "high".
 * @since 0.1.0
 */
export function confidenceFromRead(read: OpponentRead): ScoutingConfidence {
  const matches = Number(read.stats.totalMatches);
  if (matches === 0 || !read.dominantMove) return "none";
  const share = dominantShare(read);
  if (matches >= 24 && share >= 46) return "high";
  if (matches >= 10 && share >= 40) return "medium";
  return "low";
}

/**
 * Pick the recommended counter move from a CELO on-chain scouting read.
 * Falls back to `fallback` (default Rock) when there is no CELO history.
 * @param read - The opponent's scouting read from `analyzeOpponent` on CELO, or null.
 * @param fallback - Move to play when the read has no dominant pattern on CELO.
 * @returns A {@link StrategyAdvice} with the recommended move and reasoning.
 * @since 0.1.0
 */
export function pickCounterFromRead(
  read: OpponentRead | null | undefined,
  fallback: Move = Move.Rock,
): StrategyAdvice {
  if (!read?.dominantMove) {
    return {
      move: fallback,
      confidence: "none",
      reason: `No revealed history yet; using ${moveName(fallback)} as fallback.`,
    };
  }

  const move = read.suggestedCounter ?? counter(read.dominantMove);
  const confidence = confidenceFromRead(read);
  return {
    move,
    confidence,
    reason: `${moveName(move)} counters their ${moveName(read.dominantMove)} lean (${dominantShare(read)}% share).`,
  };
}

/** Format a {@link StrategyAdvice} as a single display string (move + confidence + reason). */
export function formatAdvice(advice: StrategyAdvice): string {
  const confidence =
    advice.confidence === "none" ? "no history" : `${advice.confidence} confidence`;
  return `${formatMove(advice.move)} | ${confidence}: ${advice.reason}`;
}

/**
 * Format a CELO scouting read as an array of human-readable bullet lines.
 * Useful for displaying in CLI tools, Telegram bots, MiniPay UIs, or agent reasoning traces.
 * Each line is a self-contained sentence suitable for logging or UI display on CELO.
 * @param read - An {@link OpponentRead} from `analyzeOpponent` or `analyze`.
 * @since 0.1.0
 */
export function describeRead(read: OpponentRead): string[] {
  const advice = pickCounterFromRead(read);
  const lines = [
    `${read.address} has ${read.stats.totalMatches.toString()} revealed matches.`,
    `Distribution: rock ${read.distribution.rock}%, paper ${read.distribution.paper}%, scissors ${read.distribution.scissors}%.`,
    `Dominant throw: ${formatMove(read.dominantMove)}.`,
    `Suggested counter: ${formatAdvice(advice)}.`,
  ];

  if (read.tells.afterWin) {
    lines.push(`After wins they lean ${formatMove(read.tells.afterWin)}.`);
  }
  if (read.tells.afterLoss) {
    lines.push(`After losses they lean ${formatMove(read.tells.afterLoss)}.`);
  }
  if (read.tells.afterDraw) {
    lines.push(`After draws they lean ${formatMove(read.tells.afterDraw)}.`);
  }

  return lines;
}
