"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/rps";
import { shortError, StatusBanner, type TxStatus } from "./Status";
import type { MatchEntry } from "./useMatches";

/** Ticks once a second so reveal countdowns stay live. */
function useNow() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function StateBadge({ state }: { state: MatchState }) {
  const map: Record<MatchState, [string, string]> = {
    [MatchState.None]: ["—", "bg-white/10 text-slate-300"],
    [MatchState.WaitingForOpponent]: [
      "Open",
      "bg-oracle-cyan/15 text-oracle-cyan",
    ],
    [MatchState.Revealing]: ["Revealing", "bg-oracle-purple/20 text-oracle-purple"],
    [MatchState.Settled]: ["Settled", "bg-emerald-500/15 text-emerald-300"],
    [MatchState.Cancelled]: ["Cancelled", "bg-white/10 text-slate-400"],
  };
  const [label, cls] = map[state];
  return <span className={`badge ${cls}`}>{label}</span>;
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
  const [joinMove, setJoinMove] = useState<Move | null>(null);
  const [manualMove, setManualMove] = useState<Move | null>(null);
  const [manualSalt, setManualSalt] = useState("");

  const me = address?.toLowerCase();
  const isA = !!me && match.playerA.toLowerCase() === me;
  const isB = !!me && match.playerB.toLowerCase() === me;
  const isPlayer = isA || isB;
  const busy = status.kind === "pending";

  const iRevealed = isA
    ? match.revealA !== Move.None
    : isB
      ? match.revealB !== Move.None
      : false;
  const deadlinePassed =
    match.state === MatchState.Revealing &&
    now > Number(match.revealDeadline) &&
    match.revealDeadline > 0n;
  const secondsLeft = Number(match.revealDeadline) - now;

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
    if (!address || joinMove === null) return;
    const salt = randomSalt();
    const commit = computeCommit(address, joinMove, salt);
    run("Join match", async () => {
      const hash = await writeContractAsync({
        ...rpsCore,
        functionName: "joinMatch",
        args: [id, commit],
        value: match.bet,
      });
      saveSecret(chainId, id, address, { move: joinMove, salt });
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

  function doClaimTimeout() {
    run("Claim timeout", () =>
      writeContractAsync({
        ...rpsCore,
        functionName: "claimTimeout",
        args: [id],
      }),
    );
  }

  function doCancel() {
    run("Cancel match", () =>
      writeContractAsync({
        ...rpsCore,
        functionName: "cancelMatch",
        args: [id],
      }),
    );
  }

  const haveSecret = !!address && !!loadSecret(chainId, id, address);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold">Match #{id.toString()}</span>
          <StateBadge state={match.state} />
          {match.mode === Mode.Ranked && (
            <span className="badge bg-oracle-gold/15 text-oracle-gold">
              Ranked
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-oracle-gold">
            {formatEther(match.bet)} CELO
          </div>
          <div className="text-[11px] text-slate-500">per player</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        <span className="font-mono">{shortAddress(match.playerA)}</span>
        {isA && <span className="text-oracle-cyan"> (you)</span>}
        <span className="mx-1">vs</span>
        {match.playerB === "0x0000000000000000000000000000000000000000" ? (
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
            <>
              <div className="mb-2 text-sm text-slate-400">
                Match the {formatEther(match.bet)} CELO bet and seal your move:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MOVES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setJoinMove(m.value)}
                    className={`rounded-xl border py-2 text-sm transition ${
                      joinMove === m.value
                        ? "border-oracle-purple bg-oracle-purple/15"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              <button
                className="btn-primary mt-2 w-full"
                disabled={busy || joinMove === null}
                onClick={doJoin}
              >
                Join & seal move
              </button>
            </>
          )}
        </div>
      )}

      {/* ---- Revealing ---- */}
      {match.state === MatchState.Revealing && (
        <div className="mt-3 space-y-2">
          {!deadlinePassed && (
            <div className="text-xs text-slate-400">
              Reveal window:{" "}
              <span className="font-mono text-oracle-purple">
                {Math.max(0, Math.floor(secondsLeft / 60))}m{" "}
                {Math.max(0, secondsLeft % 60)}s
              </span>{" "}
              left
            </div>
          )}

          {isPlayer && !iRevealed && (
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
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {MOVES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setManualMove(m.value)}
                        className={`rounded-lg border py-1.5 text-xs ${
                          manualMove === m.value
                            ? "border-oracle-purple bg-oracle-purple/15"
                            : "border-white/10"
                        }`}
                      >
                        {m.emoji}
                      </button>
                    ))}
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

          {isPlayer && iRevealed && (
            <div className="text-sm text-emerald-300">
              You revealed — waiting for your opponent.
            </div>
          )}

          {deadlinePassed && (
            <button
              className="btn-gold w-full"
              disabled={busy}
              onClick={doClaimTimeout}
            >
              Reveal window over — finalize (claim timeout)
            </button>
          )}
        </div>
      )}

      {/* ---- Settled ---- */}
      {match.state === MatchState.Settled && (
        <SettledSummary match={match} isA={isA} isB={isB} />
      )}

      {match.state === MatchState.Cancelled && (
        <div className="mt-3 text-sm text-slate-400">
          Cancelled — bets refunded to claimable balance.
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
