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
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (insecure context / permissions) — no-op.
    }
  }

  if (!address) return <span className={className}>{shortAddress(address)}</span>;

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied!" : `Copy ${address}`}
      aria-label={copied ? "Address copied" : `Copy address ${address}`}
      className={`font-mono transition hover:text-oracle-cyan ${className ?? ""}`}
    >
      {copied ? "Copied ✓" : shortAddress(address)}
    </button>
  );
}
