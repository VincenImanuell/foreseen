"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { celo, CELO_NETWORK_SHORT_LABEL } from "@/lib/chain";
import { shortAddress } from "@/lib/rps";
import { useMiniPay } from "./useMiniPay";
import { useMounted } from "./useMounted";

export function ConnectButton() {
  const mounted = useMounted();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { isMiniPay, isConnectingMiniPay } = useMiniPay();

  if (!mounted) {
    return <div aria-hidden className="h-10 w-36 rounded-xl bg-white/5" />;
  }

  if (!isConnected) {
    if (isMiniPay) {
      return (
        <span className="chip">
          {isConnectingMiniPay ? "Connecting MiniPay…" : "MiniPay wallet"}
        </span>
      );
    }

    const injected = connectors[0];
    return (
      <button
        className="btn-primary"
        disabled={!injected || isPending}
        aria-busy={isPending}
        onClick={() => injected && connect({ connector: injected })}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  if (chainId !== celo.id) {
    return (
      <button
        className="btn-gold"
        onClick={() => switchChain({ chainId: celo.id })}
      >
        Switch to {CELO_NETWORK_SHORT_LABEL}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="badge bg-oracle-cyan/15 text-oracle-cyan">
        ● {isMiniPay ? "MiniPay" : CELO_NETWORK_SHORT_LABEL}
      </span>
      {isMiniPay ? (
        <span className="badge bg-white/5 font-mono text-slate-300">
          {shortAddress(address)}
        </span>
      ) : (
        <button
          className="btn-ghost font-mono"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          {shortAddress(address)}
        </button>
      )}
    </div>
  );
}
