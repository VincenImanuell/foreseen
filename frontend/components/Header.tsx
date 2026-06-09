"use client";

import Link from "next/link";
import { RPS_CORE_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/rps";
import { ConnectButton } from "./ConnectButton";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-void/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">
              Foreseen
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Celo mainnet · ← back to home
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/#how"
            className="hidden text-xs text-slate-400 hover:text-white sm:block"
          >
            How to play
          </Link>
          <a
            href={`https://celoscan.io/address/${RPS_CORE_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-[11px] text-slate-500 hover:text-oracle-cyan sm:block"
          >
            {shortAddress(RPS_CORE_ADDRESS)} ↗
          </a>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
