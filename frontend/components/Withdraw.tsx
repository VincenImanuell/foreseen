"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  useConnection,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { rpsCore } from "@/lib/contracts";
import { waitForReceipt } from "@/lib/txRetry";
import { shortError, StatusBanner, type TxStatus } from "./Status";

export function Withdraw({ onChanged }: { onChanged?: () => void }) {
  const { address, isConnected } = useConnection();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<TxStatus>({ kind: "idle" });

  const { data: pending, refetch } = useReadContract({
    ...rpsCore,
    functionName: "pendingWithdrawals",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 8_000 },
  });

  const amount = (pending as bigint | undefined) ?? 0n;
  const busy = status.kind === "pending";

  async function handleWithdraw() {
    if (!publicClient) return;
    try {
      setStatus({ kind: "pending", msg: "Confirm withdrawal…" });
      const hash = await writeContractAsync({
        ...rpsCore,
        functionName: "withdraw",
      });
      await waitForReceipt(publicClient, hash);
      setStatus({ kind: "success", msg: "Withdrawn to your wallet." });
      refetch();
      onChanged?.();
    } catch (e) {
      setStatus({ kind: "error", msg: shortError(e) });
    }
  }

  if (!isConnected) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Claimable balance</div>
          <div className="font-display text-2xl font-bold text-oracle-gold">
            {formatEther(amount)} <span className="text-base">CELO</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Winnings, draw refunds & cancelled bets collect here (pull-payment).
          </p>
        </div>
        <button
          className="btn-gold"
          disabled={amount === 0n || busy}
          title={amount === 0n ? "Nothing to withdraw yet" : undefined}
          onClick={handleWithdraw}
        >
          {busy ? "Working…" : "Withdraw"}
        </button>
      </div>
      <StatusBanner status={status} />
    </div>
  );
}
