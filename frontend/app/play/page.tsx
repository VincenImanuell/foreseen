"use client";

import { useAccount } from "wagmi";
import { CreateMatch } from "@/components/CreateMatch";
import { Header } from "@/components/Header";
import { MatchList } from "@/components/MatchList";
import { Withdraw } from "@/components/Withdraw";
import { useMatches } from "@/components/useMatches";
import { useMounted } from "@/components/useMounted";

const PHASES = [
  ["1 · Matchmake", "Open a match or join one. Bets are escrowed — no move yet."],
  ["2 · Scout", "See your opponent and read their on-chain history. 90s."],
  ["3 · Commit", "Seal your move blind. Neither side can see the other's throw."],
  ["4 · Reveal", "Both reveal within 90s. The contract settles & pays the winner."],
];

const ARENA_STATS = [
  ["Network", "Celo mainnet", "Real CELO stakes"],
  ["Game loop", "Scout first", "Commit after matchmaking"],
  ["Settlement", "On-chain", "Reveal or timeout finalizes"],
];

export default function Play() {
  const mounted = useMounted();
  const { isConnected } = useAccount();
  const { entries, refetch, isLoading } = useMatches();

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-6">
          <div className="eyebrow">Live arena</div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            The arena
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Matchmake → scout → commit → reveal. A game of skill, not gambling:
            no RNG, no house. Stakes are real CELO — play responsibly.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {ARENA_STATS.map(([label, value, detail]) => (
              <div key={label} className="stat-card">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  {label}
                </div>
                <div className="mt-1 font-display text-lg font-bold text-white">
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {PHASES.map(([t, d]) => (
              <div
                key={t}
                className="rounded-xl border border-white/10 bg-panel/60 p-3"
              >
                <div className="text-xs font-semibold text-oracle-cyan">{t}</div>
                <div className="mt-1 text-[11px] leading-snug text-slate-400">
                  {d}
                </div>
              </div>
            ))}
          </div>
        </section>

        {mounted && isConnected && (
          <div className="mb-8">
            <Withdraw onChanged={refetch} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="space-y-6">
            <CreateMatch onChanged={refetch} />
          </div>
          <MatchList entries={entries} onChanged={refetch} isLoading={isLoading} />
        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Foreseen · Celo mainnet · skill-based mind-sport, not gambling · real
        CELO stakes
      </footer>
    </main>
  );
}
