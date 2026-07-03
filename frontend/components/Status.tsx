"use client";

import { classifyTxError } from "@/lib/txRetry";

export type TxStatus =
  | { kind: "idle" }
  | { kind: "pending"; msg: string }
  | { kind: "success"; msg: string }
  | { kind: "error"; msg: string };

export function shortError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);

  // Wallet + network cases get a tailored message; reverts + unknowns fall
  // through to the raw viem message (still the most useful signal there).
  switch (classifyTxError(e)) {
    case "wallet":
      if (/insufficient funds|insufficient CELO/i.test(raw))
        return "Insufficient CELO for bet + gas.";
      return "Rejected in wallet.";
    case "network":
      return "CELO RPC hiccup — please try again.";
    case "revert":
      return "Transaction reverted — match state may have changed. Refresh and retry.";
  }

  const firstLine = raw.split("\n")[0];
  return firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine;
}

export function StatusBanner({ status }: { status: TxStatus }) {
  if (status.kind === "idle") return null;
  const styles: Record<string, string> = {
    pending: "bg-oracle-cyan/10 text-oracle-cyan border-oracle-cyan/30",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    error: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-3 rounded-xl border px-3 py-2 text-sm ${styles[status.kind]}`}
    >
      {status.kind === "pending" && "⏳ "}
      {status.kind === "success" && "✓ "}
      {status.kind === "error" && "⚠ "}
      {status.msg}
    </div>
  );
}
