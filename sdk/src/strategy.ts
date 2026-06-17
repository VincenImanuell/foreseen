import { counter } from "./crypto.js";
import { Move, MOVE_NAME, type OpponentRead } from "./types.js";

/**
 * Confidence tier for a scouting read. "none" = no history, "high" = strong sample.
 * @since 0.1.0
 */
export type ScoutingConfidence = "none" | "low" | "medium" | "high";

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

export function moveName(move: Move | null | undefined): string {
  return move ? MOVE_NAME[move] ?? "Unknown" : "Unknown";
}

export function formatMove(move: Move | null | undefined): string {
  return move ? `${MOVE_EMOJI[move]} (${moveName(move)})` : "unknown";
}

export function confidenceFromRead(read: OpponentRead): ScoutingConfidence {
  const matches = Number(read.stats.totalMatches);
  if (matches === 0 || !read.dominantMove) return "none";
  const share = dominantShare(read);
  if (matches >= 24 && share >= 46) return "high";
  if (matches >= 10 && share >= 40) return "medium";
  return "low";
}

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

export function formatAdvice(advice: StrategyAdvice): string {
  const confidence =
    advice.confidence === "none" ? "no history" : `${advice.confidence} confidence`;
  return `${formatMove(advice.move)} | ${confidence}: ${advice.reason}`;
}

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
