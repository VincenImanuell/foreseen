import type { Address, Hex } from "viem";

/**
 * On-chain Move encoding (RPSCore.Move). None=0 is never a valid play.
 * @since 0.1.0
 */
export enum Move {
  None = 0,
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

/** Game mode — Casual has no rank stakes; Ranked updates soulbound badges.
 * @since 0.1.0
 */
export enum Mode {
  Casual = 0,
  Ranked = 1,
}

export enum MatchState {
  None = 0,
  WaitingForOpponent = 1,
  Scouting = 2,
  Revealing = 3,
  Settled = 4,
  Cancelled = 5,
}

export const MOVE_NAME: Record<number, string> = {
  0: "None",
  1: "Rock",
  2: "Paper",
  3: "Scissors",
};

export type ModeName = "casual" | "ranked";

export function modeToEnum(m: ModeName | Mode): Mode {
  if (typeof m === "number") return m;
  return m === "ranked" ? Mode.Ranked : Mode.Casual;
}

/** Normalized view of a match (from getMatch). */
export interface MatchView {
  id: bigint;
  playerA: Address;
  playerB: Address;
  bet: bigint;
  mode: Mode;
  state: MatchState;
  commitDeadline: number;
  revealDeadline: number;
  commitA: Hex;
  commitB: Hex;
  revealA: Move;
  revealB: Move;
}

/** Tamper-proof on-chain behavioral profile (from RPSStats.getStats). */
export interface PlayerStats {
  totalMatches: bigint;
  wins: bigint;
  losses: bigint;
  draws: bigint;
  /** [rock, paper, scissors] tallies. */
  moveCount: [bigint, bigint, bigint];
  afterWinMove: [bigint, bigint, bigint];
  afterLossMove: [bigint, bigint, bigint];
  afterDrawMove: [bigint, bigint, bigint];
  lastResult: number;
  hasHistory: boolean;
}

/** The scouting read: what you study before committing. */
export interface OpponentRead {
  address: Address;
  stats: PlayerStats;
  /** 0..1 */
  winRate: number;
  /** Percentage split (0..100) over rock/paper/scissors. */
  distribution: { rock: number; paper: number; scissors: number };
  /** Most-played move overall, or null if no history. */
  dominantMove: Move | null;
  /** What they most often throw after a win / loss / draw. */
  tells: { afterWin: Move | null; afterLoss: Move | null; afterDraw: Move | null };
  /** The move that beats their dominant throw, or null if no history. */
  suggestedCounter: Move | null;
}
