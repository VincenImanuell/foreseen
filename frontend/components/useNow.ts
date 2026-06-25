"use client";

import { useEffect, useState } from "react";

/** Unix-seconds clock that ticks so countdowns stay live. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    const t = setInterval(tick, intervalMs);
    // Re-sync immediately when the tab regains focus — setInterval drifts
    // while backgrounded, which made countdowns jump on tab switch back.
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
  return now;
}
