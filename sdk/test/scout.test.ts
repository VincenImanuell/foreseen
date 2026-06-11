import { describe, it, expect } from "vitest";
import { analyze, distributionPct, dominantMove } from "../src/scout.js";
import { Move, type PlayerStats } from "../src/types.js";

describe("distributionPct", () => {
  it("returns all zeros with no data", () => {
    expect(distributionPct([0n, 0n, 0n])).toEqual({ rock: 0, paper: 0, scissors: 0 });
  });

  it("splits a tally into rounded percentages", () => {
    expect(distributionPct([1n, 1n, 2n])).toEqual({ rock: 25, paper: 25, scissors: 50 });
  });

  it("reflects a rock-heavy bias", () => {
    const d = distributionPct([58n, 17n, 25n]);
    expect(d.rock).toBeGreaterThan(d.paper);
    expect(d.rock).toBeGreaterThan(d.scissors);
  });
});

describe("dominantMove", () => {
  it("is null with no history", () => {
    expect(dominantMove([0n, 0n, 0n])).toBeNull();
  });

  it("picks the most-played bucket", () => {
    expect(dominantMove([5n, 1n, 2n])).toBe(Move.Rock);
    expect(dominantMove([1n, 9n, 2n])).toBe(Move.Paper);
    expect(dominantMove([1n, 2n, 9n])).toBe(Move.Scissors);
  });

  it("keeps the earlier bucket on a tie", () => {
    expect(dominantMove([3n, 3n, 0n])).toBe(Move.Rock);
  });
});

function stats(over: Partial<PlayerStats> = {}): PlayerStats {
  return {
    totalMatches: 10n,
    wins: 6n,
    losses: 3n,
    draws: 1n,
    moveCount: [6n, 2n, 2n],
    afterWinMove: [4n, 1n, 1n],
    afterLossMove: [0n, 3n, 0n],
    afterDrawMove: [0n, 0n, 1n],
    lastResult: 1,
    hasHistory: true,
    ...over,
  };
}

describe("analyze", () => {
  it("computes win rate over decided matches only", () => {
    // 6 wins / (6 wins + 3 losses) = 0.666...
    expect(analyze("0x000000000000000000000000000000000000dEaD", stats()).winRate).toBeCloseTo(
      6 / 9,
      5,
    );
  });

  it("suggests the counter to the dominant move", () => {
    const read = analyze("0x000000000000000000000000000000000000dEaD", stats());
    expect(read.dominantMove).toBe(Move.Rock);
    expect(read.suggestedCounter).toBe(Move.Paper);
  });

  it("reads contextual tells", () => {
    const read = analyze("0x000000000000000000000000000000000000dEaD", stats());
    expect(read.tells.afterWin).toBe(Move.Rock);
    expect(read.tells.afterLoss).toBe(Move.Paper);
    expect(read.tells.afterDraw).toBe(Move.Scissors);
  });

  it("offers no read and zero win rate with no history", () => {
    const blank = analyze(
      "0x000000000000000000000000000000000000dEaD",
      stats({
        totalMatches: 0n,
        wins: 0n,
        losses: 0n,
        draws: 0n,
        moveCount: [0n, 0n, 0n],
        afterWinMove: [0n, 0n, 0n],
        afterLossMove: [0n, 0n, 0n],
        afterDrawMove: [0n, 0n, 0n],
        hasHistory: false,
      }),
    );
    expect(blank.winRate).toBe(0);
    expect(blank.dominantMove).toBeNull();
    expect(blank.suggestedCounter).toBeNull();
  });
});
