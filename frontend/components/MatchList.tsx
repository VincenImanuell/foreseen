"use client";

import { useAccount } from "wagmi";
import { MatchState } from "@/lib/rps";
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
  const me = address?.toLowerCase();

  const isMine = (e: MatchEntry) =>
    !!me &&
    (e.match.playerA.toLowerCase() === me ||
      e.match.playerB.toLowerCase() === me);

  const openLobbies = entries.filter(
    (e) => e.match.state === MatchState.WaitingForOpponent && !isMine(e),
  );
  const mine = entries.filter(isMine);

  return (
    <div className="space-y-8">
      <Section
        title="Open lobbies"
        hint="Anyone can challenge these — match the bet to play."
        empty={
          isLoading ? "Loading matches…" : "No open lobbies. Be the first to open one."
        }
        entries={openLobbies}
        onChanged={onChanged}
      />

      {me && (
        <Section
          title="Your matches"
          hint="Reveal in time or risk forfeiting your bet."
          empty="You haven’t played yet. Open a match to begin."
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
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <p className="text-sm text-slate-400">{hint}</p>
      </div>
      {entries.length === 0 ? (
        <div className="card text-sm text-slate-500">{empty}</div>
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
