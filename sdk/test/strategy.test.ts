import { describe, expect, it } from "vitest";
import {
  confidenceFromRead,
  describeRead,
  formatAdvice,
  formatMove,
  moveName,
  pickCounterFromRead,
} from "../src/strategy.js";
import { analyze } from "../src/scout.js";
import { Move, type PlayerStats } from "../src/types.js";

const ADDRESS = "0x000000000000000000000000000000000000dEaD";

function stats(over: Partial<PlayerStats> = {}): PlayerStats {
  return {
    totalMatches: 30n,
    wins: 18n,
    losses: 9n,
    draws: 3n,
    moveCount: [18n, 7n, 5n],
    afterWinMove: [11n, 4n, 3n],
    afterLossMove: [2n, 6n, 1n],
    afterDrawMove: [1n, 1n, 1n],
    lastResult: 1,
    hasHistory: true,
    ...over,
  };
}

describe("strategy helpers", () => {
  it("formats move labels for agent logs", () => {
    expect(moveName(Move.Paper)).toBe("Paper");
    expect(formatMove(Move.Scissors)).toBe("scissors (Scissors)");
    expect(formatMove(null)).toBe("unknown");
  });

  it("grades a strong scouting profile as high confidence", () => {
    expect(confidenceFromRead(analyze(ADDRESS, stats()))).toBe("high");
  });

  it("grades sparse history as low confidence", () => {
    const read = analyze(
      ADDRESS,
      stats({
        totalMatches: 3n,
        wins: 1n,
        losses: 1n,
        draws: 1n,
        moveCount: [1n, 1n, 1n],
      }),
    );
    expect(confidenceFromRead(read)).toBe("low");
  });

  it("falls back when there is no revealed history", () => {
    const advice = pickCounterFromRead(null, Move.Scissors);
    expect(advice.move).toBe(Move.Scissors);
    expect(advice.confidence).toBe("none");
  });

  it("picks the counter to the dominant move", () => {
    const advice = pickCounterFromRead(analyze(ADDRESS, stats()));
    expect(advice.move).toBe(Move.Paper);
    expect(advice.reason).toContain("Rock");
  });

  it("formats compact strategy advice for dashboards", () => {
    const advice = pickCounterFromRead(analyze(ADDRESS, stats()));
    expect(formatAdvice(advice)).toContain("paper (Paper)");
    expect(formatAdvice(advice)).toContain("high confidence");
  });

  it("formats no-history advice distinctly", () => {
    const advice = pickCounterFromRead(null, Move.Rock);
    expect(formatAdvice(advice)).toContain("no history");
    expect(formatAdvice(advice)).toContain("rock (Rock)");
  });

  it("builds compact scouting lines for dashboards and bots", () => {
    const lines = describeRead(analyze(ADDRESS, stats()));
    expect(lines[0]).toContain("revealed matches");
    expect(lines.join("\n")).toContain("Suggested counter");
    expect(lines.join("\n")).toContain("After losses");
  });
});
