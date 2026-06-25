"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One-shot scroll-reveal: returns a ref + whether it has entered the viewport.
 * Stays true once revealed so content never flickers back out.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  opts?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px", ...opts },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // One-shot by design — only the initial `opts` matters, so it's
    // intentionally left out of the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
