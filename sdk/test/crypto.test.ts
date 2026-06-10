import { describe, it, expect } from "vitest";
import type { Address, Hex } from "viem";
import { randomSalt, computeCommit, resultOf, counter } from "../src/crypto.js";
import { Move } from "../src/types.js";

const PLAYER: Address = "0x000000000000000000000000000000000000dEaD";
const SALT: Hex = `0x${"11".repeat(32)}`;

describe("computeCommit", () => {
  it("matches the on-chain keccak256(abi.encodePacked(player, move, salt)) vector", () => {
    // Golden vector: keep RPSCore and the SDK in lockstep. If the contract's
    // commitment scheme changes, this must change with it.
    expect(computeCommit(PLAYER, Move.Rock, SALT)).toBe(
      "0x45034ee8f80f2c732f2dfc5ecfe27b2fa3480b831e92e569f66767a60addf8ff",
    );
  });

  it("is deterministic for the same inputs", () => {
    expect(computeCommit(PLAYER, Move.Paper, SALT)).toBe(computeCommit(PLAYER, Move.Paper, SALT));
  });

  it("changes when the move, salt, or player changes", () => {
    const base = computeCommit(PLAYER, Move.Rock, SALT);
    expect(computeCommit(PLAYER, Move.Paper, SALT)).not.toBe(base);
    expect(computeCommit(PLAYER, Move.Rock, `0x${"22".repeat(32)}`)).not.toBe(base);
    expect(computeCommit("0x000000000000000000000000000000000000bEEF", Move.Rock, SALT)).not.toBe(
      base,
    );
  });

  it("returns a 0x-prefixed 32-byte hash", () => {
    expect(computeCommit(PLAYER, Move.Scissors, SALT)).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("resultOf", () => {
  it("calls equal moves a draw", () => {
    expect(resultOf(Move.Rock, Move.Rock)).toBe(0);
    expect(resultOf(Move.Paper, Move.Paper)).toBe(0);
    expect(resultOf(Move.Scissors, Move.Scissors)).toBe(0);
  });

  it("awards A the three winning matchups", () => {
    expect(resultOf(Move.Rock, Move.Scissors)).toBe(1);
    expect(resultOf(Move.Paper, Move.Rock)).toBe(1);
    expect(resultOf(Move.Scissors, Move.Paper)).toBe(1);
  });

  it("awards B the three losing matchups", () => {
    expect(resultOf(Move.Scissors, Move.Rock)).toBe(2);
    expect(resultOf(Move.Rock, Move.Paper)).toBe(2);
    expect(resultOf(Move.Paper, Move.Scissors)).toBe(2);
  });
});

describe("counter", () => {
  it("returns the move that beats the input", () => {
    expect(counter(Move.Rock)).toBe(Move.Paper);
    expect(counter(Move.Paper)).toBe(Move.Scissors);
    expect(counter(Move.Scissors)).toBe(Move.Rock);
  });

  it("actually wins against the move it counters", () => {
    for (const m of [Move.Rock, Move.Paper, Move.Scissors]) {
      expect(resultOf(counter(m), m)).toBe(1);
    }
  });
});

describe("randomSalt", () => {
  it("is a 0x-prefixed 32-byte hex string", () => {
    expect(randomSalt()).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("does not repeat across calls", () => {
    expect(randomSalt()).not.toBe(randomSalt());
  });
});
