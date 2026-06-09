import { useEffect, useState } from "react";

/** Returns true only after the first client render — guards against SSR/CSR
 *  hydration mismatches for wallet-dependent UI. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
