/**
 * Tests for CELO SDK error classification and retry helpers.
 * All pure logic — no RPC, no CELO mainnet required.
 */
import { describe, it, expect, vi } from "vitest";
import { isRetryableError, classifyError, withRetry } from "../src/errors.js";

// ---------------------------------------------------------------------------
// isRetryableError
// ---------------------------------------------------------------------------

describe("isRetryableError — CELO transient network detection", () => {
  it("recognises timeout messages", () => {
    expect(isRetryableError(new Error("Request timeout"))).toBe(true);
    expect(isRetryableError(new Error("ETIMEDOUT connecting to CELO RPC"))).toBe(true);
    expect(isRetryableError(new Error("connection timed out"))).toBe(true);
  });

  it("recognises node-style connection errors", () => {
    expect(isRetryableError(new Error("ECONNRESET"))).toBe(true);
    expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true);
    expect(isRetryableError(new Error("ENOTFOUND"))).toBe(true);
    expect(isRetryableError(new Error("socket hang up"))).toBe(true);
  });

  it("recognises rate-limit responses from public CELO RPC", () => {
    expect(isRetryableError(new Error("rate limit exceeded"))).toBe(true);
    expect(isRetryableError(new Error("too many requests"))).toBe(true);
    expect(isRetryableError(new Error("HTTP 429"))).toBe(true);
  });

  it("recognises fetch-level errors", () => {
    expect(isRetryableError(new Error("fetch failed"))).toBe(true);
    expect(isRetryableError(new Error("Failed to fetch"))).toBe(true);
    expect(isRetryableError(new Error("network error"))).toBe(true);
  });

  it("does not retry hard CELO failures", () => {
    expect(isRetryableError(new Error("User rejected the request"))).toBe(false);
    expect(isRetryableError(new Error("execution reverted: invalid state"))).toBe(false);
    expect(isRetryableError(new Error("insufficient funds for gas on CELO"))).toBe(false);
    expect(isRetryableError(new Error("Some unrelated error"))).toBe(false);
  });

  it("handles non-Error values", () => {
    expect(isRetryableError("timeout")).toBe(true);
    expect(isRetryableError("user rejected")).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// classifyError
// ---------------------------------------------------------------------------

describe("classifyError — CELO error kind tagging", () => {
  it("classifies network errors as 'network'", () => {
    expect(classifyError(new Error("ECONNRESET"))).toBe("network");
    expect(classifyError(new Error("timeout"))).toBe("network");
  });

  it("classifies wallet rejections and insufficient funds as 'wallet'", () => {
    expect(classifyError(new Error("User rejected the request"))).toBe("wallet");
    expect(classifyError(new Error("user denied transaction signature"))).toBe("wallet");
    expect(classifyError(new Error("insufficient funds for CELO bet"))).toBe("wallet");
  });

  it("classifies on-chain reverts as 'revert'", () => {
    expect(classifyError(new Error("execution reverted"))).toBe("revert");
    expect(classifyError(new Error("call revert exception"))).toBe("revert");
  });

  it("classifies unknown errors as 'unknown'", () => {
    expect(classifyError(new Error("something weird happened"))).toBe("unknown");
    expect(classifyError("raw string error")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// withRetry
// ---------------------------------------------------------------------------

describe("withRetry — exponential back-off for CELO RPC calls", () => {
  it("returns the result immediately on success", async () => {
    const fn = vi.fn().mockResolvedValue(42);
    expect(await withRetry(fn, { baseDelayMs: 0 })).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on transient errors and succeeds on the 2nd attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValue("ok");
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("exhausts retries and re-throws the last transient error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("timeout"));
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })).rejects.toThrow("timeout");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry hard errors — propagates on first failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("execution reverted"));
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })).rejects.toThrow("execution reverted");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry callback with attempt number", async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValue("done");
    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 0, onRetry });
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("uses default maxAttempts=3 when not specified", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    await expect(withRetry(fn, { baseDelayMs: 0 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
