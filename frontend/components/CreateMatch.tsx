"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { rpsCore } from "@/lib/contracts";
import { Mode } from "@/lib/rps";
import { shortError, StatusBanner, type TxStatus } from "./Status";

export function CreateMatch({ onChanged }: { onChanged?: () => void }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [bet, setBet] = useState("0.01");
  const [mode, setMode] = useState<Mode>(Mode.Casual);
  const [status, setStatus] = useState<TxStatus>({ kind: "idle" });

  const busy = status.kind === "pending";
  const canSubmit = isConnected && Number(bet) > 0 && !busy && !!publicClient;

  async function handleCreate() {
    if (!address || !publicClient) return;
    try {
      setStatus({ kind: "pending", msg: "Confirm in your wallet…" });
      const hash = await writeContractAsync({
        ...rpsCore,
        functionName: "createMatch",
        args: [mode],
        value: parseEther(bet),
      });
      setStatus({ kind: "pending", msg: "Opening your match on-chain…" });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus({
        kind: "success",
        msg: "Match opened. When someone joins, scout them — then commit your move.",
      });
      onChanged?.();
    } catch (e) {
      setStatus({ kind: "error", msg: shortError(e) });
    }
  }

  return (
    <div className="card">
      <h2 className="font-display text-lg font-bold">Open a match</h2>
      <p className="mt-1 text-sm text-slate-400">
        Set your stake — no move yet. You pick your throw <em>after</em> an
        opponent joins and you’ve scouted them.
      </p>

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
        {busy ? "Working…" : "Open match"}
      </button>

      <StatusBanner status={status} />
    </div>
  );
}
