"use client";

import { RPS_CORE_ADDRESS } from "@/lib/contracts";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-void/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-oracle-purple to-oracle-cyan text-lg shadow-glow">
            👁
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">
              Foreseen
            </div>
            <a
              href={`https://celoscan.io/address/${RPS_CORE_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] text-slate-400 hover:text-oracle-cyan"
            >
              {RPS_CORE_ADDRESS.slice(0, 10)}…{RPS_CORE_ADDRESS.slice(-6)} ↗
            </a>
          </div>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
