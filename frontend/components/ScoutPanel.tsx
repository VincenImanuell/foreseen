"use client";

import { type Address } from "viem";
import { useReadContract } from "wagmi";
import { rpsStats } from "@/lib/contracts";
import {
  distributionPct,
  dominantMove,
  MOVES,
  moveEmoji,
  moveLabel,
  toRpsStats,
} from "@/lib/rps";
import { CopyableAddress } from "./CopyableAddress";
import { ScoutIcon } from "./icons";

function Bar({ pct, emoji, label }: { pct: number; emoji: string; label: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>
          {emoji} {label}
        </span>
        <span className="font-mono text-slate-400">{pct}%</span>
      </div>
      <div className="meter-track">
        <div
          className="meter-fill transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Below this many samples in a bucket, "tends to throw X" is a coin-flip
// dressed up as a pattern — say so instead of asserting a false tell.
const MIN_TELL_SAMPLES = 3;

function Tell({
  when,
  move,
  samples,
}: {
  when: string;
  move: number;
  samples: bigint;
}) {
  if (move < 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-void/40 px-3 py-2 text-xs text-slate-500">
        After a {when}: <span className="italic">no pattern yet</span>
      </div>
    );
  }
  if (samples < BigInt(MIN_TELL_SAMPLES)) {
    return (
      <div className="rounded-lg border border-white/10 bg-void/40 px-3 py-2 text-xs text-slate-500">
        After a {when}: <span className="italic">too few reads to call it ({samples.toString()})</span>
      </div>
    );
  }
  const m = MOVES[move];
  return (
    <div className="rounded-lg border border-white/10 bg-void/40 px-3 py-2 text-xs text-slate-300">
      After a {when}: tends to throw{" "}
      <span className="font-semibold text-oracle-gold">
        {m.emoji} {m.label}
      </span>
    </div>
  );
}

export function ScoutPanel({ opponent }: { opponent: Address }) {
  const { data, isLoading } = useReadContract({
    ...rpsStats,
    functionName: "getStats",
    args: [opponent],
    query: { enabled: !!opponent },
  });

  const s = data ? toRpsStats(data) : null;
  const hasData = !!s && s.totalMatches > 0n;

  return (
    <div className="rounded-xl border border-oracle-cyan/20 bg-oracle-cyan/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-oracle-cyan">
          <ScoutIcon className="h-3.5 w-3.5" />
          Scouting report
        </div>
        <CopyableAddress address={opponent} className="text-[11px] text-slate-500" />
      </div>

      {isLoading && (
        <div aria-hidden className="space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="h-2 animate-pulse rounded-full bg-white/10" />
          <div className="h-2 w-4/5 animate-pulse rounded-full bg-white/10" />
        </div>
      )}

      {!isLoading && !hasData && (
        <div className="text-xs text-slate-400">
          No revealed matches yet — a blank slate. No tells to read. Their first
          moves here are pure guesswork; trust nothing.
        </div>
      )}

      {!isLoading && hasData && s && (
        <div className="space-y-3">
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-300">{s.wins.toString()}W</span>
            <span className="text-rose-300">{s.losses.toString()}L</span>
            <span className="text-slate-400">{s.draws.toString()}D</span>
            <span className="ml-auto text-slate-500">
              {s.totalMatches.toString()} revealed
            </span>
          </div>

          <div className="space-y-2">
            {(() => {
              const pct = distributionPct(s.moveCount);
              return MOVES.map((m, i) => (
                <Bar key={m.value} pct={pct[i]} emoji={m.emoji} label={m.label} />
              ));
            })()}
          </div>

          <div className="space-y-1.5">
            <Tell
              when="win"
              move={dominantMove(s.afterWinMove)}
              samples={s.afterWinMove[0] + s.afterWinMove[1] + s.afterWinMove[2]}
            />
            <Tell
              when="loss"
              move={dominantMove(s.afterLossMove)}
              samples={s.afterLossMove[0] + s.afterLossMove[1] + s.afterLossMove[2]}
            />
          </div>

          <p className="text-[11px] leading-snug text-slate-500">
            Read the pattern, then pick the move that beats their habit — or bluff
            against it.{" "}
            {s.totalMatches < BigInt(MIN_TELL_SAMPLES)
              ? "Not enough revealed matches yet to call a favorite throw."
              : dominantMove(s.moveCount) >= 0
                ? `${moveLabel(MOVES[dominantMove(s.moveCount)].value)} ${moveEmoji(MOVES[dominantMove(s.moveCount)].value)} is their favorite throw overall.`
                : ""}
          </p>
        </div>
      )}
    </div>
  );
}
