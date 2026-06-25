"use client";

import { useNow } from "./useNow";

/** mm:ss remaining until a unix-seconds deadline. Turns red once elapsed. */
export function Countdown({
  deadline,
  className = "",
}: {
  deadline: bigint;
  className?: string;
}) {
  const now = useNow();
  const left = Number(deadline) - now;
  const over = left <= 0;
  const m = Math.max(0, Math.floor(left / 60));
  const s = Math.max(0, left % 60);
  return (
    <span
      role="timer"
      aria-live="off"
      className={`font-mono tabular-nums ${over ? "text-rose-300" : "text-oracle-cyan"} ${className}`}
    >
      {over ? "00:00" : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`}
    </span>
  );
}
