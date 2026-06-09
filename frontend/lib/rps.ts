import {
  bytesToHex,
  encodePacked,
  keccak256,
  type Address,
  type Hex,
} from "viem";

// ---- On-chain enums (must match RPSCore.sol exactly) ----------------------

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
  Revealing = 2,
  Settled = 3,
  Cancelled = 4,
}

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

export const REVEAL_TIMEOUT_SECONDS = 5 * 60;

// ---- Match shape decoded from getMatch() ----------------------------------

export type RpsMatch = {
  playerA: Address;
  playerB: Address;
  commitA: Hex;
  commitB: Hex;
  revealA: Move;
  revealB: Move;
  bet: bigint;
  createdAt: bigint;
  joinedAt: bigint;
  revealDeadline: bigint;
  mode: Mode;
  state: MatchState;
};

/** Normalize the tuple/struct that viem returns from getMatch() / matches(). */
export function toRpsMatch(raw: any): RpsMatch {
  return {
    playerA: raw.playerA,
    playerB: raw.playerB,
    commitA: raw.commitA,
    commitB: raw.commitB,
    revealA: Number(raw.revealA) as Move,
    revealB: Number(raw.revealB) as Move,
    bet: BigInt(raw.bet),
    createdAt: BigInt(raw.createdAt),
    joinedAt: BigInt(raw.joinedAt),
    revealDeadline: BigInt(raw.revealDeadline),
    mode: Number(raw.mode) as Mode,
    state: Number(raw.state) as MatchState,
  };
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
