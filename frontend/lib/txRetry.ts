import type { Hex, PublicClient } from "viem";

// Mirrors the classification the @foreseen/sdk bot uses for CELO RPC
// resilience (isRetryableError/classifyError/withRetry) — kept local since
// the published SDK build doesn't export that module yet. Only ever wraps
// read-only receipt polling, never a write, so a retry can't double-send.

export type CeloErrorKind = "network" | "wallet" | "revert" | "unknown";

/** True when the error looks like a transient network/RPC problem on CELO. */
export function isRetryableTxError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    /timeout|timed out|ETIMEDOUT/i.test(msg) ||
    /ECONNRESET|ECONNREFUSED|ENOTFOUND/i.test(msg) ||
    /rate limit|too many requests|429/i.test(msg) ||
    /network error|fetch failed|failed to fetch/i.test(msg) ||
    /socket hang up/i.test(msg)
  );
}

/** Classify a viem/wallet error so the UI can tailor its message. */
export function classifyTxError(e: unknown): CeloErrorKind {
  if (isRetryableTxError(e)) return "network";
  const msg = e instanceof Error ? e.message : String(e);
  if (/user rejected|rejected the request|denied/i.test(msg)) return "wallet";
  if (/insufficient funds|insufficient CELO/i.test(msg)) return "wallet";
  if (/execution reverted|revert/i.test(msg)) return "revert";
  return "unknown";
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Retry `fn` with exponential back-off, but only when the failure looks
 * transient. Wallet rejections and on-chain reverts propagate immediately.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 1_000;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!isRetryableTxError(e) || attempt === maxAttempts - 1) throw e;
      await sleep(Math.min(baseDelayMs * 2 ** attempt, 30_000));
    }
  }
  throw lastError;
}

/**
 * Wait for a CELO tx receipt, retrying transient RPC hiccups so a public
 * endpoint blip doesn't surface as a failed transaction the user already
 * confirmed and paid gas for.
 */
export function waitForReceipt(publicClient: PublicClient, hash: Hex) {
  return withRetry(() => publicClient.waitForTransactionReceipt({ hash }));
}
