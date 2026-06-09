import {
  bytesToHex,
  encodePacked,
  keccak256,
  type Address,
  type Hex,
} from "viem";

// ---- On-chain enums (must match RPSCore.sol v2 exactly) -------------------

export enum Move {
  None = 0,
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

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

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MOVES: { value: Move; label: string; emoji: string }[] = [
  { value: Move.Rock, label: "Rock", emoji: "🪨" },
  { value: Move.Paper, label: "Paper", emoji: "📄" },
  { value: Move.Scissors, label: "Scissors", emoji: "✂️" },
];

export function moveLabel(m: Move): string {
  return MOVES.find((x) => x.value === m)?.label ?? "—";
}

export function moveEmoji(m: Move): string {
  return MOVES.find((x) => x.value === m)?.emoji ?? "❔";
}

// Match windows (seconds) — must match the contract constants.
export const COMMIT_WINDOW_SECONDS = 90;
export const REVEAL_WINDOW_SECONDS = 90;

// ---- Match shape decoded from getMatch() ----------------------------------

export type RpsMatch = {
  playerA: Address;
  bet: bigint;
  playerB: Address;
  commitDeadline: bigint;
  revealDeadline: bigint;
  mode: Mode;
  state: MatchState;
  commitA: Hex;
  commitB: Hex;
  revealA: Move;
  revealB: Move;
};

/** Normalize the struct viem returns from getMatch(). */
export function toRpsMatch(raw: any): RpsMatch {
  return {
    playerA: raw.playerA,
    bet: BigInt(raw.bet),
    playerB: raw.playerB,
    commitDeadline: BigInt(raw.commitDeadline),
    revealDeadline: BigInt(raw.revealDeadline),
    mode: Number(raw.mode) as Mode,
    state: Number(raw.state) as MatchState,
    commitA: raw.commitA,
    commitB: raw.commitB,
    revealA: Number(raw.revealA) as Move,
    revealB: Number(raw.revealB) as Move,
  };
}

const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/** Has this side sealed a move yet (commit != 0)? */
export function hasCommitted(commit?: Hex): boolean {
  return !!commit && commit !== ZERO_HASH;
}

// ---- On-chain behavioral stats (RPSStats.getStats) ------------------------

export type RpsStats = {
  totalMatches: bigint;
  wins: bigint;
  losses: bigint;
  draws: bigint;
  moveCount: [bigint, bigint, bigint];
  afterWinMove: [bigint, bigint, bigint];
  afterLossMove: [bigint, bigint, bigint];
  afterDrawMove: [bigint, bigint, bigint];
};

export function toRpsStats(raw: any): RpsStats {
  const trip = (a: any): [bigint, bigint, bigint] => [
    BigInt(a[0]),
    BigInt(a[1]),
    BigInt(a[2]),
  ];
  return {
    totalMatches: BigInt(raw.totalMatches),
    wins: BigInt(raw.wins),
    losses: BigInt(raw.losses),
    draws: BigInt(raw.draws),
    moveCount: trip(raw.moveCount),
    afterWinMove: trip(raw.afterWinMove),
    afterLossMove: trip(raw.afterLossMove),
    afterDrawMove: trip(raw.afterDrawMove),
  };
}

/** Percentage split (0..100) of a 3-bucket move tally. */
export function distributionPct(
  counts: [bigint, bigint, bigint],
): [number, number, number] {
  const total = Number(counts[0] + counts[1] + counts[2]);
  if (total === 0) return [0, 0, 0];
  return [
    Math.round((Number(counts[0]) / total) * 100),
    Math.round((Number(counts[1]) / total) * 100),
    Math.round((Number(counts[2]) / total) * 100),
  ];
}

/** Index (0..2) of the most-played bucket, or -1 if no data. */
export function dominantMove(counts: [bigint, bigint, bigint]): number {
  const total = counts[0] + counts[1] + counts[2];
  if (total === 0n) return -1;
  let best = 0;
  for (let i = 1; i < 3; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

// ---- Commit-reveal crypto --------------------------------------------------

/** Fresh, cryptographically-random 32-byte salt. */
export function randomSalt(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * The exact commitment RPSCore expects:
 *   keccak256(abi.encodePacked(msg.sender, move, salt))
 * Binding the commit to the sender prevents commit-stealing.
 */
export function computeCommit(player: Address, move: Move, salt: Hex): Hex {
  return keccak256(
    encodePacked(["address", "uint8", "bytes32"], [player, move, salt]),
  );
}

// ---- Reveal-secret persistence (the salt+move you must keep to reveal) -----

type Secret = { move: Move; salt: Hex };

function secretKey(chainId: number, matchId: bigint, player: Address): string {
  return `foreseen:secret:${chainId}:${matchId.toString()}:${player.toLowerCase()}`;
}

export function saveSecret(
  chainId: number,
  matchId: bigint,
  player: Address,
  secret: Secret,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    secretKey(chainId, matchId, player),
    JSON.stringify(secret),
  );
}

export function loadSecret(
  chainId: number,
  matchId: bigint,
  player: Address,
): Secret | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(secretKey(chainId, matchId, player));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { move: Number(parsed.move) as Move, salt: parsed.salt as Hex };
  } catch {
    return null;
  }
}

// ---- Outcome helpers (client-side, for display only) ----------------------

/** 0 = draw, 1 = A wins, 2 = B wins. Mirrors RPSCore._result. */
export function resultOf(a: Move, b: Move): 0 | 1 | 2 {
  if (a === b) return 0;
  if (
    (a === Move.Rock && b === Move.Scissors) ||
    (a === Move.Paper && b === Move.Rock) ||
    (a === Move.Scissors && b === Move.Paper)
  ) {
    return 1;
  }
  return 2;
}

export function shortAddress(addr?: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
