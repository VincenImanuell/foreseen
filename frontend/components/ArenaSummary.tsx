"use client";

import { formatEther } from "viem";
import { MatchState } from "@/lib/rps";
import type { MatchEntry } from "./useMatches";

export function ArenaSummary({ entries }: { entries: MatchEntry[] }) {
  const open = entries.filter((e) => e.match.state === MatchState.WaitingForOpponent);
  const active = entries.filter(
    (e) =>
      e.match.state === MatchState.Scouting || e.match.state === MatchState.Revealing,
  );
  // Settled/cancelled matches already paid out to claimable balances — only
  // count matches whose bets are still actually locked in the contract.
  const pot = entries
    .filter(
      (e) =>
        e.match.state !== MatchState.Settled &&
        e.match.state !== MatchState.Cancelled,
    )
    .reduce((sum, e) => sum + e.match.bet * 2n, 0n);

  return (
    <div role="group" aria-label="CELO arena summary" className="grid gap-3 sm:grid-cols-3">
      <div className="stat-card">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Open lobbies
        </div>
        <div className="mt-1 font-display text-xl font-bold text-white">
          {open.length}
        </div>
        <div className="mt-1 text-xs text-slate-400">Joinable right now</div>
      </div>
      <div className="stat-card">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Active reads
        </div>
        <div className="mt-1 font-display text-xl font-bold text-white">
          {active.length}
        </div>
        <div className="mt-1 text-xs text-slate-400">Scouting or revealing</div>
      </div>
      <div className="stat-card">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Visible pot
        </div>
        <div className="mt-1 font-display text-xl font-bold text-oracle-gold">
          {Number(formatEther(pot)).toFixed(3)} CELO
        </div>
        <div className="mt-1 text-xs text-slate-400">Across loaded matches</div>
      </div>
    </div>
  );
}
