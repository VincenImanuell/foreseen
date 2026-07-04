"use client";

import { useEffect, useRef } from "react";
import { useMounted } from "./useMounted";

const SITE_ID = process.env.NEXT_PUBLIC_SOVADS_SITE_ID;
const CONTAINER_ID = "sovads-banner";

/**
 * SovAds banner — earns G$ per verified impression. No-ops until
 * NEXT_PUBLIC_SOVADS_SITE_ID is set (register at sovads.org/publisher first).
 */
export function SovAdsBanner() {
  const mounted = useMounted();
  const rendered = useRef(false);

  useEffect(() => {
    if (!mounted || !SITE_ID || rendered.current) return;
    rendered.current = true;
    let cancelled = false;

    (async () => {
      try {
        const { SovAds, Banner } = await import("sovads-sdk");
        if (cancelled) return;
        const ads = new SovAds({ siteId: SITE_ID });
        await new Banner(ads, CONTAINER_ID).render();
      } catch {
        // Ad network hiccup shouldn't break the arena — fail silently.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!SITE_ID) return null;

  return (
    <div className="flex justify-center py-2">
      <div id={CONTAINER_ID} />
    </div>
  );
}
