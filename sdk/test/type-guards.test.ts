/**
 * Tests for CELO SDK Move and MatchState type guards.
 * All helpers are pure functions — no RPC, no CELO mainnet connection needed.
 */
import { describe, it, expect } from "vitest";
import {
  Move,
  MatchState,
  isPlayableMove,
  isMoveNone,
  matchIsOpen,
  matchIsCommitting,
  matchIsRevealing,
  matchIsSettled,
  matchIsCancelled,
  matchIsActive,
  matchIsFinal,
} from "../src/types.js";

const ALL_STATES = [
  MatchState.None,
  MatchState.WaitingForOpponent,
  MatchState.Scouting,
  MatchState.Revealing,
  MatchState.Settled,
  MatchState.Cancelled,
] as const;

const ALL_MOVES = [Move.None, Move.Rock, Move.Paper, Move.Scissors] as const;

describe("isPlayableMove — CELO move validity guard", () => {
  it("accepts Rock, Paper, Scissors", () => {
    expect(isPlayableMove(Move.Rock)).toBe(true);
    expect(isPlayableMove(Move.Paper)).toBe(true);
    expect(isPlayableMove(Move.Scissors)).toBe(true);
  });

  it("rejects Move.None (uncommitted / zero)", () => {
    expect(isPlayableMove(Move.None)).toBe(false);
  });

  it("rejects out-of-range numbers", () => {
    expect(isPlayableMove(4)).toBe(false);
    expect(isPlayableMove(99)).toBe(false);
    expect(isPlayableMove(-1)).toBe(false);
  });

  it("exactly three moves are playable on CELO", () => {
    const playable = ALL_MOVES.filter(isPlayableMove);
    expect(playable).toHaveLength(3);
  });
});

describe("isMoveNone — CELO uncommitted sentinel guard", () => {
  it("returns true only for Move.None", () => {
    expect(isMoveNone(Move.None)).toBe(true);
  });

  it("returns false for every playable move", () => {
    expect(isMoveNone(Move.Rock)).toBe(false);
    expect(isMoveNone(Move.Paper)).toBe(false);
    expect(isMoveNone(Move.Scissors)).toBe(false);
  });

  it("isMoveNone and isPlayableMove are mutually exclusive across all moves", () => {
    for (const m of ALL_MOVES) {
      expect(isMoveNone(m) && isPlayableMove(m)).toBe(false);
    }
  });
});

describe("CELO MatchState single-state guards", () => {
  it("matchIsOpen — true only for WaitingForOpponent", () => {
    const trueStates = ALL_STATES.filter((s) => matchIsOpen({ state: s }));
    expect(trueStates).toEqual([MatchState.WaitingForOpponent]);
  });

  it("matchIsCommitting — true only for Scouting", () => {
    const trueStates = ALL_STATES.filter((s) => matchIsCommitting({ state: s }));
    expect(trueStates).toEqual([MatchState.Scouting]);
  });

  it("matchIsRevealing — true only for Revealing", () => {
    const trueStates = ALL_STATES.filter((s) => matchIsRevealing({ state: s }));
    expect(trueStates).toEqual([MatchState.Revealing]);
  });

  it("matchIsSettled — true only for Settled", () => {
    const trueStates = ALL_STATES.filter((s) => matchIsSettled({ state: s }));
    expect(trueStates).toEqual([MatchState.Settled]);
  });

  it("matchIsCancelled — true only for Cancelled", () => {
    const trueStates = ALL_STATES.filter((s) => matchIsCancelled({ state: s }));
    expect(trueStates).toEqual([MatchState.Cancelled]);
  });
});

describe("CELO MatchState composite guards", () => {
  it("matchIsActive covers exactly WaitingForOpponent, Scouting, Revealing", () => {
    const active = ALL_STATES.filter((s) => matchIsActive({ state: s }));
    expect(active).toEqual([
      MatchState.WaitingForOpponent,
      MatchState.Scouting,
      MatchState.Revealing,
    ]);
  });

  it("matchIsFinal covers exactly Settled and Cancelled", () => {
    const final = ALL_STATES.filter((s) => matchIsFinal({ state: s }));
    expect(final).toEqual([MatchState.Settled, MatchState.Cancelled]);
  });

  it("matchIsActive and matchIsFinal are mutually exclusive across all states", () => {
    for (const s of ALL_STATES) {
      const both = matchIsActive({ state: s }) && matchIsFinal({ state: s });
      expect(both).toBe(false);
    }
  });

  it("every non-None state is covered by exactly one of active or final", () => {
    const nonNone = ALL_STATES.filter((s) => s !== MatchState.None);
    for (const s of nonNone) {
      const covered = matchIsActive({ state: s }) || matchIsFinal({ state: s });
      expect(covered).toBe(true);
    }
  });
});
