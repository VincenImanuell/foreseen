"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { celo } from "@/lib/chain";
import { shortAddress } from "@/lib/rps";
import { useMounted } from "./useMounted";

export function ConnectButton() {
  const mounted = useMounted();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  if (!mounted) {
    return <div className="h-10 w-36 rounded-xl bg-white/5" />;
  }

  if (!isConnected) {
    const injected = connectors[0];
    return (
      <button
        className="btn-primary"
        disabled={!injected || isPending}
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
        Switch to Celo
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="badge bg-oracle-cyan/15 text-oracle-cyan">
        ● Celo
      </span>
      <button
        className="btn-ghost font-mono"
        onClick={() => disconnect()}
        title="Disconnect"
      >
        {shortAddress(address)}
      </button>
    </div>
  );
}
