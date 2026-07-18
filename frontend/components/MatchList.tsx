"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { MatchState } from "@/lib/rps";
import { ArenaFilters, matchesFilter, type ArenaFilter } from "./ArenaFilters";
import { MatchCard } from "./MatchCard";
import type { MatchEntry } from "./useMatches";

export function MatchList({
  entries,
  onChanged,
  isLoading,
}: {
  entries: MatchEntry[];
  onChanged?: () => void;
  isLoading: boolean;
}) {
  const { address } = useAccount();
  const [filter, setFilter] = useState<ArenaFilter>("all");
  const me = address?.toLowerCase();

  const isMine = (e: MatchEntry) =>
    !!me &&
    (e.match.playerA.toLowerCase() === me ||
      e.match.playerB.toLowerCase() === me);

  const filtered = entries.filter((e) => matchesFilter(e.match.mode, filter));
  const openLobbies = filtered.filter(
    (e) => e.match.state === MatchState.WaitingForOpponent && !isMine(e),
  );
  const mine = filtered.filter(isMine);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Match feed</div>
          <p className="mt-1 text-sm text-slate-400">
            Filter the arena without leaving the table.
          </p>
        </div>
        <ArenaFilters value={filter} onChange={setFilter} />
      </div>

      <Section
        title="Open lobbies"
        hint="Anyone can challenge these — match the bet to play."
        empty={isLoading ? "Loading matches…" : "No open lobbies match this filter."}
        entries={openLobbies}
        onChanged={onChanged}
      />

      {me && (
        <Section
          title="Your matches"
          hint="Reveal in time or risk forfeiting your bet."
          empty={isLoading ? "Loading matches…" : "You have no matches in this view."}
          entries={mine}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  empty,
  entries,
  onChanged,
}: {
  title: string;
  hint: string;
  empty: string;
  entries: MatchEntry[];
  onChanged?: () => void;
}) {
  const count = entries.length;

  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <span className="chip" aria-live="polite">{count} live</span>
        </div>
        <p className="text-sm text-slate-400">{hint}</p>
      </div>
      {count === 0 ? (
        <div className="surface-soft p-5 text-sm text-slate-500">{empty}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <MatchCard key={e.id.toString()} entry={e} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
