/**
 * CELO SDK error classification and retry helpers.
 * Transient network hiccups against public CELO RPC endpoints (rate limits,
 * connection resets, timeouts) should be retried. Hard failures (insufficient
 * CELO, contract reverts, invalid args) should propagate immediately.
 * @since 0.2.0
 */

/** True when the error looks like a transient network/RPC problem on CELO. */
export function isRetryableError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    /timeout|timed out|ETIMEDOUT/i.test(msg) ||
    /ECONNRESET|ECONNREFUSED|ENOTFOUND/i.test(msg) ||
    /rate limit|too many requests|429/i.test(msg) ||
    /network error|fetch failed|failed to fetch/i.test(msg) ||
    /socket hang up/i.test(msg)
  );
}

/**
 * Error categories for CELO SDK failures — lets callers decide whether to
 * retry, prompt the user, or give up.
 * @since 0.2.0
 */
export type CeloErrorKind =
  | "network"      // Transient RPC / connectivity issue — retry is safe.
  | "wallet"       // User rejected or insufficient CELO funds — prompt user.
  | "revert"       // On-chain revert — bad args or wrong match state.
  | "unknown";     // Anything else.

/** Classify a CELO SDK or viem error into a {@link CeloErrorKind}. */
export function classifyError(e: unknown): CeloErrorKind {
  if (isRetryableError(e)) return "network";
  const msg = e instanceof Error ? e.message : String(e);
  if (/user rejected|rejected the request|denied/i.test(msg)) return "wallet";
  if (/insufficient funds|insufficient CELO/i.test(msg)) return "wallet";
  if (/execution reverted|revert/i.test(msg)) return "revert";
  return "unknown";
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Run `fn` and retry up to `maxAttempts` times when the error is transient.
 * Uses exponential back-off: `baseDelayMs * 2^attempt` (capped at 30 s).
 * Non-retryable errors (wallet rejections, reverts) propagate on first failure.
 *
 * @param fn - Async function to run and possibly retry.
 * @param opts.maxAttempts - Total attempts including the first (default: 3).
 * @param opts.baseDelayMs - Base back-off delay in ms (default: 1000).
 * @param opts.onRetry - Optional callback for logging/telemetry.
 * @since 0.2.0
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: {
    maxAttempts?: number;
    baseDelayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 1_000;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!isRetryableError(e) || attempt === maxAttempts - 1) throw e;
      const delay = Math.min(baseDelayMs * 2 ** attempt, 30_000);
      opts.onRetry?.(attempt + 1, e);
      await sleep(delay);
    }
  }
  throw lastError;
}
