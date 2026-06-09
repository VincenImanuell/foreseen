"use client";

import { useState } from "react";
import { parseEther, parseEventLogs } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { rpsCore } from "@/lib/contracts";
import {
  computeCommit,
  MOVES,
  Mode,
  Move,
  randomSalt,
  saveSecret,
} from "@/lib/rps";
import { shortError, StatusBanner, type TxStatus } from "./Status";

export function CreateMatch({ onChanged }: { onChanged?: () => void }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [move, setMove] = useState<Move | null>(null);
  const [bet, setBet] = useState("0.01");
  const [mode, setMode] = useState<Mode>(Mode.Casual);
  const [status, setStatus] = useState<TxStatus>({ kind: "idle" });

  const busy = status.kind === "pending";
  const canSubmit =
    isConnected && move !== null && Number(bet) > 0 && !busy && !!publicClient;

  async function handleCreate() {
    if (!address || move === null || !publicClient) return;
    try {
      const salt = randomSalt();
      const commit = computeCommit(address, move, salt);
      setStatus({ kind: "pending", msg: "Confirm in your wallet…" });

      const hash = await writeContractAsync({
        ...rpsCore,
        functionName: "createMatch",
        args: [mode, commit],
        value: parseEther(bet),
      });

      setStatus({ kind: "pending", msg: "Sealing your move on-chain…" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = parseEventLogs({
        abi: rpsCore.abi,
        logs: receipt.logs,
        eventName: "MatchCreated",
      });
      const matchId = (logs[0]?.args as { matchId: bigint }).matchId;

      // Persist the secret — without it you can never reveal & claim.
      saveSecret(publicClient.chain.id, matchId, address, { move, salt });

      setStatus({
        kind: "success",
        msg: `Match #${matchId.toString()} opened. Your move is sealed — wait for a challenger.`,
      });
      setMove(null);
      onChanged?.();
    } catch (e) {
      setStatus({ kind: "error", msg: shortError(e) });
    }
  }

  return (
    <div className="card">
      <h2 className="font-display text-lg font-bold">Open a match</h2>
      <p className="mt-1 text-sm text-slate-400">
        Pick your move in secret. It’s committed as a hash — your opponent can’t
        see it until you both reveal.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {MOVES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMove(m.value)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm transition ${
              move === m.value
                ? "border-oracle-purple bg-oracle-purple/15 text-white shadow-glow"
                : "border-white/10 hover:border-white/25"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-slate-400">Bet (CELO)</span>
          <input
            className="input mt-1"
            type="number"
            min="0"
            step="0.001"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-400">Mode</span>
          <select
            className="input mt-1"
            value={mode}
            onChange={(e) => setMode(Number(e.target.value) as Mode)}
          >
            <option value={Mode.Casual}>Casual</option>
            <option value={Mode.Ranked}>Ranked</option>
          </select>
        </label>
      </div>

      <button
        className="btn-primary mt-4 w-full"
        disabled={!canSubmit}
        onClick={handleCreate}
      >
        {busy ? "Working…" : "Seal move & open match"}
      </button>

      <StatusBanner status={status} />
    </div>
  );
}
