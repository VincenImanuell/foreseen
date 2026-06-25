"use client";

import Link from "next/link";
import { RPS_CORE_ADDRESS } from "@/lib/contracts";
import { CELO_NETWORK_LABEL, CELO_EXPLORER_URL } from "@/lib/chain";
import { shortAddress } from "@/lib/rps";
import { ConnectButton } from "./ConnectButton";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-void/75 shadow-[0_18px_60px_-45px_rgba(55,230,255,0.45)] backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-lg focus:bg-oracle-cyan focus:px-3 focus:py-1.5 focus:text-sm focus:text-void"
      >
        Skip to the CELO arena
      </a>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus-ring">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">
              Foreseen
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {CELO_NETWORK_LABEL} · ← back to home
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
            href={`${CELO_EXPLORER_URL}/address/${RPS_CORE_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            aria-label="View the Foreseen contract on the CELO explorer"
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
