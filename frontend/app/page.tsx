"use client";

import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { CreateMatch } from "@/components/CreateMatch";
import { MatchList } from "@/components/MatchList";
import { Withdraw } from "@/components/Withdraw";
import { useMatches } from "@/components/useMatches";
import { useMounted } from "@/components/useMounted";

export default function Home() {
  const mounted = useMounted();
  const { isConnected } = useAccount();
  const { entries, refetch, isLoading } = useMatches();

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Read your opponent. <span className="text-oracle-purple">Foresee</span>{" "}
            the move.
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            On-chain Rock Paper Scissors as a psychological mind-sport. Moves are
            committed blind with a hash and revealed on-chain — no peeking, no
            front-running. Every settled match is provable and feeds your stats.
          </p>
        </section>

        {mounted && isConnected && (
          <div className="mb-8">
            <Withdraw onChanged={refetch} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="space-y-6">
            <CreateMatch onChanged={refetch} />
            <HowItWorks />
          </div>

          <MatchList entries={entries} onChanged={refetch} isLoading={isLoading} />
        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Foreseen · Celo mainnet · commit-reveal RPS · real CELO stakes
      </footer>
    </main>
  );
}

function HowItWorks() {
  const steps = [
    "Pick a move in secret — it’s sent as a hash, not the move itself.",
    "An opponent matches your bet and seals their move blind.",
    "Both reveal within 5 minutes. The contract settles & pays the winner.",
    "Don’t reveal in time? Your opponent can claim the pot. Withdraw winnings anytime.",
  ];
  return (
    <div className="card">
      <h3 className="font-display font-bold">How it works</h3>
      <ol className="mt-2 space-y-2 text-sm text-slate-400">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-display font-bold text-oracle-purple">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
