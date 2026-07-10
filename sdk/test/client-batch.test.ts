/**
 * Unit tests for the CELO SDK batch-read helpers.
 * These tests exercise the pure filtering and decoding logic without making
 * live RPC calls to CELO mainnet (chainId 42220) or Celo Sepolia.
 */
import { describe, it, expect } from "vitest";
import { Move, Mode, MatchState, type MatchView, type PlayerStats } from "../src/types.js";

const PLAYER_A = "0x000000000000000000000000000000000000bEEF" as const;
const PLAYER_B = "0x000000000000000000000000000000000000dEaD" as const;
const EMPTY_COMMIT = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

function makeMatch(id: bigint, overrides: Partial<MatchView> = {}): MatchView {
  return {
    id,
    playerA: PLAYER_A,
    playerB: PLAYER_B,
    bet: BigInt("10000000000000000"), // 0.01 CELO
    mode: Mode.Casual,
    state: MatchState.WaitingForOpponent,
    commitDeadline: 0,
    revealDeadline: 0,
    commitA: EMPTY_COMMIT,
    commitB: EMPTY_COMMIT,
    revealA: Move.None,
    revealB: Move.None,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Pure filter logic mirroring what getOpenMatches does after getMatchesBatch
// ---------------------------------------------------------------------------

function filterOpen(
  matches: MatchView[],
  opts: { limit?: number; excludePlayer?: string } = {},
): MatchView[] {
  const exclude = opts.excludePlayer?.toLowerCase();
  const out: MatchView[] = [];
  for (const m of matches) {
    if (m.state !== MatchState.WaitingForOpponent) continue;
    if (exclude && m.playerA.toLowerCase() === exclude) continue;
    out.push(m);
    if (opts.limit && out.length >= opts.limit) break;
  }
  return out;
}

function filterByPlayer(matches: MatchView[], address: string): MatchView[] {
  const p = address.toLowerCase();
  return matches.filter(
    (m) => m.playerA.toLowerCase() === p || m.playerB.toLowerCase() === p,
  );
}

// ---------------------------------------------------------------------------
// Pure aggregation logic mirroring what getGlobalStats does after
// getRecentMatches — see client.ts getGlobalStats().
// ---------------------------------------------------------------------------

function aggregate(matches: MatchView[]) {
  let settled = 0;
  let cancelled = 0;
  let active = 0;
  let scannedVolumeWei = 0n;
  for (const m of matches) {
    scannedVolumeWei += m.bet;
    if (m.state === MatchState.Settled) settled += 1;
    else if (m.state === MatchState.Cancelled) cancelled += 1;
    else active += 1;
  }
  return { scanned: matches.length, settled, cancelled, active, scannedVolumeWei };
}

const ZERO_STATS: PlayerStats = {
  totalMatches: 0n,
  wins: 0n,
  losses: 0n,
  draws: 0n,
  moveCount: [0n, 0n, 0n],
  afterWinMove: [0n, 0n, 0n],
  afterLossMove: [0n, 0n, 0n],
  afterDrawMove: [0n, 0n, 0n],
  lastResult: 0,
  hasHistory: false,
};

/** Mirrors getPlayerStatsBatch's per-slot fallback: failed multicall results become ZERO_STATS, keeping the array aligned 1:1 with the input addresses. */
function decodeStatsBatch(
  addresses: string[],
  results: Array<{ status: "success" | "failure"; result?: PlayerStats }>,
): PlayerStats[] {
  return results.map((res) => (res.status === "success" && res.result ? res.result : ZERO_STATS));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CELO open-match filter logic (getOpenMatches post-batch)", () => {
  it("returns only WaitingForOpponent matches", () => {
    const matches = [
      makeMatch(0n, { state: MatchState.WaitingForOpponent }),
      makeMatch(1n, { state: MatchState.Scouting }),
      makeMatch(2n, { state: MatchState.Settled }),
      makeMatch(3n, { state: MatchState.WaitingForOpponent }),
    ];
    const open = filterOpen(matches);
    expect(open.map((m) => m.id)).toEqual([0n, 3n]);
  });

  it("respects the limit option and returns early", () => {
    const matches = Array.from({ length: 10 }, (_, i) => makeMatch(BigInt(i)));
    expect(filterOpen(matches, { limit: 3 })).toHaveLength(3);
  });

  it("excludes matches where excludePlayer is playerA", () => {
    const mine = makeMatch(0n, { playerA: PLAYER_A });
    const theirs = makeMatch(1n, { playerA: PLAYER_B });
    const open = filterOpen([mine, theirs], { excludePlayer: PLAYER_A });
    expect(open).toHaveLength(1);
    expect(open[0]!.id).toBe(1n);
  });

  it("excludes playerA case-insensitively", () => {
    const mine = makeMatch(0n, { playerA: PLAYER_A });
    const open = filterOpen([mine], { excludePlayer: PLAYER_A.toUpperCase() });
    expect(open).toHaveLength(0);
  });

  it("returns empty list when all matches are settled on CELO", () => {
    const matches = [
      makeMatch(0n, { state: MatchState.Settled }),
      makeMatch(1n, { state: MatchState.Cancelled }),
    ];
    expect(filterOpen(matches)).toHaveLength(0);
  });
});

describe("CELO player-match filter logic (getMatchesByPlayer post-batch)", () => {
  it("returns matches where player is playerA or playerB", () => {
    const asA = makeMatch(0n, { playerA: PLAYER_A, playerB: PLAYER_B });
    const asB = makeMatch(1n, { playerA: PLAYER_B, playerB: PLAYER_A });
    const unrelated = makeMatch(2n, {
      playerA: "0x0000000000000000000000000000000000000001",
      playerB: "0x0000000000000000000000000000000000000002",
    });
    const result = filterByPlayer([asA, asB, unrelated], PLAYER_A);
    expect(result.map((m) => m.id)).toEqual([0n, 1n]);
  });

  it("is case-insensitive on address comparison", () => {
    const m = makeMatch(0n, { playerA: PLAYER_A.toUpperCase() as typeof PLAYER_A });
    expect(filterByPlayer([m], PLAYER_A.toLowerCase())).toHaveLength(1);
  });

  it("returns empty when player has no CELO matches in the scan window", () => {
    const matches = [makeMatch(0n), makeMatch(1n)];
    expect(filterByPlayer(matches, "0x0000000000000000000000000000000000000099")).toHaveLength(0);
  });

  it("includes matches in all states (not just open)", () => {
    const states = [
      MatchState.WaitingForOpponent,
      MatchState.Scouting,
      MatchState.Revealing,
      MatchState.Settled,
      MatchState.Cancelled,
    ];
    const matches = states.map((s, i) => makeMatch(BigInt(i), { state: s }));
    expect(filterByPlayer(matches, PLAYER_A)).toHaveLength(states.length);
  });
});

describe("MatchView shape for CELO matches", () => {
  it("bet is stored in wei (bigint), not CELO string", () => {
    const m = makeMatch(0n);
    expect(typeof m.bet).toBe("bigint");
    expect(m.bet).toBe(10000000000000000n);
  });

  it("pot is 2× the bet (both players stake the same amount)", () => {
    const m = makeMatch(0n, { bet: 50000000000000000n });
    expect(m.bet * 2n).toBe(100000000000000000n);
  });

  it("a fresh open match has no commits and Move.None reveals", () => {
    const m = makeMatch(0n);
    expect(m.commitA).toBe(EMPTY_COMMIT);
    expect(m.commitB).toBe(EMPTY_COMMIT);
    expect(m.revealA).toBe(Move.None);
    expect(m.revealB).toBe(Move.None);
  });
});

describe("CELO global-stats aggregation logic (getGlobalStats post-scan)", () => {
  it("buckets matches into settled/cancelled/active", () => {
    const matches = [
      makeMatch(0n, { state: MatchState.Settled }),
      makeMatch(1n, { state: MatchState.Cancelled }),
      makeMatch(2n, { state: MatchState.WaitingForOpponent }),
      makeMatch(3n, { state: MatchState.Scouting }),
      makeMatch(4n, { state: MatchState.Revealing }),
      makeMatch(5n, { state: MatchState.Settled }),
    ];
    const agg = aggregate(matches);
    expect(agg.scanned).toBe(6);
    expect(agg.settled).toBe(2);
    expect(agg.cancelled).toBe(1);
    expect(agg.active).toBe(3);
  });

  it("sums bet across the scanned window regardless of state", () => {
    const matches = [
      makeMatch(0n, { bet: 10n, state: MatchState.Settled }),
      makeMatch(1n, { bet: 20n, state: MatchState.Cancelled }),
      makeMatch(2n, { bet: 30n, state: MatchState.WaitingForOpponent }),
    ];
    expect(aggregate(matches).scannedVolumeWei).toBe(60n);
  });

  it("returns all zeros for an empty scan window", () => {
    const agg = aggregate([]);
    expect(agg).toEqual({ scanned: 0, settled: 0, cancelled: 0, active: 0, scannedVolumeWei: 0n });
  });
});

describe("CELO player-stats batch decode logic (getPlayerStatsBatch post-multicall)", () => {
  it("keeps the result array aligned 1:1 with the input addresses", () => {
    const addresses = [PLAYER_A, PLAYER_B, "0x0000000000000000000000000000000000000099"];
    const results: Array<{ status: "success" | "failure"; result?: PlayerStats }> = [
      { status: "success", result: { ...ZERO_STATS, totalMatches: 5n, hasHistory: true } },
      { status: "failure" },
      { status: "success", result: { ...ZERO_STATS, totalMatches: 2n, hasHistory: true } },
    ];
    const decoded = decodeStatsBatch(addresses, results);
    expect(decoded).toHaveLength(3);
    expect(decoded[0]!.totalMatches).toBe(5n);
    expect(decoded[2]!.totalMatches).toBe(2n);
  });

  it("falls back to zero stats (not a dropped slot) on a failed multicall entry", () => {
    const decoded = decodeStatsBatch([PLAYER_A], [{ status: "failure" }]);
    expect(decoded).toHaveLength(1);
    expect(decoded[0]).toEqual(ZERO_STATS);
    expect(decoded[0]!.hasHistory).toBe(false);
  });

  it("returns an empty array for an empty address list", () => {
    expect(decodeStatsBatch([], [])).toEqual([]);
  });
});
