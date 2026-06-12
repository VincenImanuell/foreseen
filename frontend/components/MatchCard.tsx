"use client";

import { useState } from "react";
import { formatEther, type Hex } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { rpsCore } from "@/lib/contracts";
import {
  computeCommit,
  hasCommitted,
  loadSecret,
  MOVES,
  MatchState,
  Mode,
  Move,
  moveEmoji,
  moveLabel,
  randomSalt,
  resultOf,
  saveSecret,
  shortAddress,
  ZERO_ADDRESS,
} from "@/lib/rps";
import { Countdown } from "./Countdown";
import { ScoutPanel } from "./ScoutPanel";
import { shortError, StatusBanner, type TxStatus } from "./Status";
import { useNow } from "./useNow";
import type { MatchEntry } from "./useMatches";

function StateBadge({ state }: { state: MatchState }) {
  const map: Record<MatchState, [string, string]> = {
    [MatchState.None]: ["—", "bg-white/10 text-slate-300"],
    [MatchState.WaitingForOpponent]: ["Open", "bg-oracle-cyan/15 text-oracle-cyan"],
    [MatchState.Scouting]: ["Scouting", "bg-oracle-gold/15 text-oracle-gold"],
    [MatchState.Revealing]: ["Revealing", "bg-oracle-purple/20 text-oracle-purple"],
    [MatchState.Settled]: ["Settled", "bg-emerald-500/15 text-emerald-300"],
    [MatchState.Cancelled]: ["Cancelled", "bg-white/10 text-slate-400"],
  };
  const [label, cls] = map[state];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function StateRail({ state }: { state: MatchState }) {
  const tone =
    state === MatchState.Settled
      ? "from-emerald-400"
      : state === MatchState.Cancelled
        ? "from-slate-500"
        : "from-oracle-cyan";
  return <div className={`h-1 rounded-full bg-gradient-to-r ${tone} to-transparent`} />;
}

function MovePicker({
  value,
  onPick,
  disabled,
}: {
  value: Move | null;
  onPick: (m: Move) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MOVES.map((m) => (
        <button
          key={m.value}
          disabled={disabled}
          onClick={() => onPick(m.value)}
          className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm transition disabled:opacity-40 ${
            value === m.value
              ? "border-oracle-purple bg-oracle-purple/15 text-white shadow-glow ring-1 ring-oracle-purple/40"
              : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
          }`}
        >
          <span className="text-2xl">{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function MatchCard({
  entry,
  onChanged,
}: {
  entry: MatchEntry;
  onChanged?: () => void;
}) {
  const { id, match } = entry;
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const now = useNow();

  const [status, setStatus] = useState<TxStatus>({ kind: "idle" });
  const [pickMove, setPickMove] = useState<Move | null>(null);
  const [manualMove, setManualMove] = useState<Move | null>(null);
  const [manualSalt, setManualSalt] = useState("");

  const me = address?.toLowerCase();
  const isA = !!me && match.playerA.toLowerCase() === me;
  const isB = !!me && match.playerB.toLowerCase() === me;
  const isPlayer = isA || isB;
  const busy = status.kind === "pending";

  const opponent = isA ? match.playerB : match.playerA;
  const iCommitted = isA
    ? hasCommitted(match.commitA)
    : isB
      ? hasCommitted(match.commitB)
      : false;
  const oppCommitted = isA
    ? hasCommitted(match.commitB)
    : isB
      ? hasCommitted(match.commitA)
      : false;
  const iRevealed = isA
    ? match.revealA !== Move.None
    : isB
      ? match.revealB !== Move.None
      : false;

  const commitOver =
    match.state === MatchState.Scouting && now > Number(match.commitDeadline);
  const revealOver =
    match.state === MatchState.Revealing && now > Number(match.revealDeadline);

  const haveSecret = !!address && !!loadSecret(chainId, id, address);
  const pot = match.bet * 2n;

  async function run(label: string, fn: () => Promise<Hex>) {
    if (!publicClient) return;
    try {
      setStatus({ kind: "pending", msg: `Confirm: ${label}…` });
      const hash = await fn();
      setStatus({ kind: "pending", msg: "Waiting for confirmation…" });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus({ kind: "success", msg: `${label} ✓` });
      onChanged?.();
    } catch (e) {
      setStatus({ kind: "error", msg: shortError(e) });
    }
  }

  function doJoin() {
    run("Join match", () =>
      writeContractAsync({
        ...rpsCore,
        functionName: "joinMatch",
        args: [id],
        value: match.bet,
      }),
    );
  }

  function doCommit() {
    if (!address || pickMove === null) return;
    const salt = randomSalt();
    const commit = computeCommit(address, pickMove, salt);
    run("Commit move", async () => {
      const hash = await writeContractAsync({
        ...rpsCore,
        functionName: "commitMove",
        args: [id, commit],
      });
      // Persist the secret — without it you can never reveal & claim.
      saveSecret(chainId, id, address, { move: pickMove, salt });
      return hash;
    });
  }

  function doReveal() {
    if (!address) return;
    const secret = loadSecret(chainId, id, address);
    const move = secret?.move ?? manualMove;
    const salt = (secret?.salt ?? manualSalt) as Hex;
    if (move === null || move === undefined || !salt) return;
    run("Reveal", () =>
      writeContractAsync({
        ...rpsCore,
        functionName: "reveal",
        args: [id, move, salt],
      }),
    );
  }

  function doClaim(fnName: "claimCommitTimeout" | "claimRevealTimeout") {
    run("Finalize match", () =>
      writeContractAsync({ ...rpsCore, functionName: fnName, args: [id] }),
    );
  }

  function doCancel() {
    run("Cancel match", () =>
      writeContractAsync({ ...rpsCore, functionName: "cancelMatch", args: [id] }),
    );
  }

  return (
    <div className="card">
      <StateRail state={match.state} />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold">Match #{id.toString()}</span>
          <StateBadge state={match.state} />
          {match.mode === Mode.Ranked && (
            <span className="badge bg-oracle-gold/15 text-oracle-gold">Ranked</span>
          )}
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-oracle-gold">
            {formatEther(match.bet)} CELO
          </div>
          <div className="text-[11px] text-slate-500">per player</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {formatEther(pot)} CELO pot
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-void/35 px-3 py-2 text-xs text-slate-400">
        <span className="font-mono">{shortAddress(match.playerA)}</span>
        {isA && <span className="text-oracle-cyan"> (you)</span>}
        <span className="mx-1">vs</span>
        {match.playerB === ZERO_ADDRESS ? (
          <span className="italic text-slate-600">waiting…</span>
        ) : (
          <>
            <span className="font-mono">{shortAddress(match.playerB)}</span>
            {isB && <span className="text-oracle-cyan"> (you)</span>}
          </>
        )}
      </div>

      {/* ---- Open: join or cancel ---- */}
      {match.state === MatchState.WaitingForOpponent && (
        <div className="mt-3">
          {isA ? (
            <button className="btn-ghost w-full" disabled={busy} onClick={doCancel}>
              Cancel & refund my bet
            </button>
          ) : (
            <button className="btn-primary w-full" disabled={busy} onClick={doJoin}>
              Join — match {formatEther(match.bet)} CELO
            </button>
          )}
        </div>
      )}

      {/* ---- Scouting: study opponent, then commit ---- */}
      {match.state === MatchState.Scouting && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scouting window</span>
            <Countdown deadline={match.commitDeadline} className="text-sm" />
          </div>

          {isPlayer && <ScoutPanel opponent={opponent} />}

          {isPlayer && !iCommitted && !commitOver && (
            <div className="space-y-2">
              <div className="text-sm text-slate-300">
                Read them, then seal your move:
              </div>
              <MovePicker value={pickMove} onPick={setPickMove} disabled={busy} />
              <button
                className="btn-primary w-full"
                disabled={busy || pickMove === null}
                onClick={doCommit}
              >
                Commit move (sealed)
              </button>
            </div>
          )}

          {isPlayer && iCommitted && (
            <div className="text-sm text-emerald-300">
              ✓ Your move is sealed.{" "}
              {oppCommitted
                ? "Both committed — opening reveal…"
                : "Waiting for your opponent to commit."}
            </div>
          )}

          {commitOver && (
            <button
              className="btn-gold w-full"
              disabled={busy}
              onClick={() => doClaim("claimCommitTimeout")}
            >
              Scouting window over — finalize
            </button>
          )}

          {!isPlayer && (
            <div className="text-xs text-slate-500">
              Players are scouting & committing their moves.
            </div>
          )}
        </div>
      )}

      {/* ---- Revealing ---- */}
      {match.state === MatchState.Revealing && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reveal window</span>
            <Countdown deadline={match.revealDeadline} className="text-sm" />
          </div>

          {isPlayer && !iRevealed && !revealOver && (
            <>
              {haveSecret ? (
                <button
                  className="btn-primary w-full"
                  disabled={busy}
                  onClick={doReveal}
                >
                  Reveal my move
                </button>
              ) : (
                <div className="rounded-xl border border-white/10 p-3">
                  <div className="text-xs text-slate-400">
                    Secret not found in this browser. Enter your move & salt to
                    reveal:
                  </div>
                  <div className="mt-2">
                    <MovePicker
                      value={manualMove}
                      onPick={setManualMove}
                      disabled={busy}
                    />
                  </div>
                  <input
                    className="input mt-2 font-mono text-xs"
                    placeholder="0x… salt"
                    value={manualSalt}
                    onChange={(e) => setManualSalt(e.target.value)}
                  />
                  <button
                    className="btn-primary mt-2 w-full"
                    disabled={busy || manualMove === null || !manualSalt}
                    onClick={doReveal}
                  >
                    Reveal
                  </button>
                </div>
              )}
            </>
          )}

          {isPlayer && iRevealed && !revealOver && (
            <div className="text-sm text-emerald-300">
              You revealed — waiting for your opponent.
            </div>
          )}

          {revealOver && (
            <button
              className="btn-gold w-full"
              disabled={busy}
              onClick={() => doClaim("claimRevealTimeout")}
            >
              Reveal window over — finalize
            </button>
          )}
        </div>
      )}

      {/* ---- Settled / Cancelled ---- */}
      {match.state === MatchState.Settled && (
        <SettledSummary match={match} isA={isA} isB={isB} />
      )}

      {match.state === MatchState.Cancelled && (
        <div className="mt-3 text-sm text-slate-400">
          Cancelled — bets refunded to your claimable balance.
        </div>
      )}

      <StatusBanner status={status} />
    </div>
  );
}

function SettledSummary({
  match,
  isA,
  isB,
}: {
  match: MatchEntry["match"];
  isA: boolean;
  isB: boolean;
}) {
  // A forfeit settles with no revealed moves (both None).
  const isForfeit = match.revealA === Move.None && match.revealB === Move.None;
  if (isForfeit) {
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-void/40 p-3 text-center text-sm">
        Settled by forfeit — a player ran out the clock. Pot paid to the player
        who showed up; collect from your claimable balance.
      </div>
    );
  }

  const r = resultOf(match.revealA, match.revealB);
  let outcome: string;
  if (r === 0) outcome = "Draw — both bets refunded.";
  else {
    const winnerIsA = r === 1;
    if ((winnerIsA && isA) || (!winnerIsA && isB)) outcome = "You won 🏆";
    else if (isA || isB) outcome = "You lost.";
    else outcome = `Player ${winnerIsA ? "A" : "B"} won.`;
  }
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-void/40 p-3">
      <div className="flex items-center justify-center gap-3 text-2xl">
        <span title={moveLabel(match.revealA)}>{moveEmoji(match.revealA)}</span>
        <span className="text-xs text-slate-500">vs</span>
        <span title={moveLabel(match.revealB)}>{moveEmoji(match.revealB)}</span>
      </div>
      <div className="mt-1 text-center text-sm font-semibold">{outcome}</div>
    </div>
  );
}
