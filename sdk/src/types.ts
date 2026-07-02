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

/**
 * Lifecycle state of a CELO match, as returned by `RPSCore.getMatch`.
 * Transitions: None → WaitingForOpponent → Scouting → Revealing → Settled.
 * Any state can transition to Cancelled (timeout or manual cancel).
 * @since 0.1.0
 */
export enum MatchState {
  None = 0,
  WaitingForOpponent = 1,
  Scouting = 2,
  Revealing = 3,
  Settled = 4,
  Cancelled = 5,
}

/**
 * Human-readable display names for {@link Move} enum values on CELO.
 * Key 0 is "None" (invalid move). Keys 1–3 map to Rock/Paper/Scissors.
 */
export const MOVE_NAME: Record<number, string> = {
  0: "None",
  1: "Rock",
  2: "Paper",
  3: "Scissors",
};

/**
 * String alias for {@link Mode} — accepted anywhere a Mode enum value is.
 * `"casual"` = no rank stake on CELO; `"ranked"` = updates soulbound badge.
 */
export type ModeName = "casual" | "ranked";

export function modeToEnum(m: ModeName | Mode): Mode {
  if (typeof m === "number") return m;
  return m === "ranked" ? Mode.Ranked : Mode.Casual;
}

/**
 * Normalized view of a match returned by `Foreseen.getMatch`.
 * @since 0.1.0
 */
export interface MatchView {
  id: bigint;
  playerA: Address;
  playerB: Address;
  /** Stake in wei — each player puts in this amount of CELO. */
  bet: bigint;
  mode: Mode;
  state: MatchState;
  /** Unix timestamp (seconds) by which both players must commit on CELO. */
  commitDeadline: number;
  /** Unix timestamp (seconds) by which both players must reveal on CELO. */
  revealDeadline: number;
  commitA: Hex;
  commitB: Hex;
  revealA: Move;
  revealB: Move;
}

/**
 * Tamper-proof on-chain behavioral profile from `RPSStats.getStats`.
 * All counters are bigints to preserve exact on-chain values.
 * @since 0.1.0
 */
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
  /** 0=none, 1=win, 2=loss, 3=draw — last match outcome from RPSStats on CELO. */
  lastResult: number;
  /** True if the player has at least one revealed match recorded on CELO. */
  hasHistory: boolean;
}

// ---------------------------------------------------------------------------
// Type guards and state helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when `m` is a playable move (Rock, Paper, or Scissors).
 * Excludes `Move.None` (value 0) which is never a valid committed throw on CELO.
 * @since 0.2.0
 */
export function isPlayableMove(m: number): m is Move.Rock | Move.Paper | Move.Scissors {
  return m === Move.Rock || m === Move.Paper || m === Move.Scissors;
}

/**
 * Returns true when `m` is exactly `Move.None` (the zero/uncommitted sentinel on CELO).
 * Useful for checking whether a reveal slot is still empty after settlement.
 * @since 0.2.0
 */
export function isMoveNone(m: number): m is Move.None {
  return m === Move.None;
}

/**
 * Returns true when the match is open for a second player to join on CELO.
 * @since 0.2.0
 */
export function matchIsOpen(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.WaitingForOpponent;
}

/**
 * Returns true when the match is in the commit (scouting) window on CELO.
 * Both players have joined; neither has committed a move yet.
 * @since 0.2.0
 */
export function matchIsCommitting(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.Scouting;
}

/**
 * Returns true when the match is in the reveal window on CELO.
 * At least one player has committed; both must reveal before the deadline.
 * @since 0.2.0
 */
export function matchIsRevealing(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.Revealing;
}

/**
 * Returns true when the CELO match has settled — pot has been distributed.
 * @since 0.2.0
 */
export function matchIsSettled(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.Settled;
}

/**
 * Returns true when the CELO match was cancelled (no opponent joined, or
 * the opener cancelled before anyone joined).
 * @since 0.2.0
 */
export function matchIsCancelled(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.Cancelled;
}

/**
 * Returns true when the CELO match is still ongoing (not settled or cancelled).
 * Covers WaitingForOpponent, Scouting, and Revealing states.
 * @since 0.2.0
 */
export function matchIsActive(m: Pick<MatchView, "state">): boolean {
  return (
    m.state === MatchState.WaitingForOpponent ||
    m.state === MatchState.Scouting ||
    m.state === MatchState.Revealing
  );
}

/**
 * Returns true when the CELO match has reached a terminal state
 * (Settled or Cancelled) and no further on-chain moves are possible.
 * @since 0.2.0
 */
export function matchIsFinal(m: Pick<MatchView, "state">): boolean {
  return m.state === MatchState.Settled || m.state === MatchState.Cancelled;
}

/**
 * The scouting read: what you study before committing on CELO.
 * Derived from on-chain `RPSStats` data — tamper-proof and public.
 * @since 0.1.0
 */
export interface OpponentRead {
  address: Address;
  stats: PlayerStats;
  /** Win rate over decided (non-draw) matches, in the range 0..1. */
  winRate: number;
  /** Percentage split (0..100) over rock/paper/scissors from CELO history. */
  distribution: { rock: number; paper: number; scissors: number };
  /** Most-played move overall, or null if no CELO history. */
  dominantMove: Move | null;
  /** What they most often throw after a win / loss / draw on CELO. */
  tells: { afterWin: Move | null; afterLoss: Move | null; afterDraw: Move | null };
  /** The move that beats their dominant throw, or null if no CELO history. */
  suggestedCounter: Move | null;
}
