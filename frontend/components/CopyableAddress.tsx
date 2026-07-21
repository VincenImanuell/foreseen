"use client";

import { useState } from "react";
import { type Address } from "viem";
import { shortAddress } from "@/lib/rps";

/** Click-to-copy address chip — shows the short form, copies the full
 *  checksummed address, flashes a confirmation for 1.5s. */
export function CopyableAddress({
  address,
  className,
}: {
  address?: Address;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setState("copied");
    } catch {
      // Clipboard API unavailable (insecure context / permissions) — tell
      // the user instead of silently doing nothing.
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  if (!address) return <span className={className}>{shortAddress(address)}</span>;

  const label =
    state === "copied" ? "Copied ✓" : state === "failed" ? "Couldn't copy" : shortAddress(address);

  return (
    <button
      type="button"
      onClick={copy}
      title={state === "idle" ? `Copy ${address}` : label}
      aria-label={state === "idle" ? `Copy address ${address}` : label}
      className={`font-mono transition hover:text-oracle-cyan ${state === "failed" ? "text-rose-300" : ""} ${className ?? ""}`}
    >
      {label}
    </button>
  );
}
