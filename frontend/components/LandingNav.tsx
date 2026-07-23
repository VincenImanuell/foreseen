"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "#how", label: "How to play", internal: false },
  { href: "#mindsport", label: "The read", internal: false },
  { href: "/guide", label: "Guide", internal: true },
] as const;

/** Landing page nav bar. Secondary links collapse into a hamburger menu
 *  below `sm` so they stay reachable on mobile instead of just disappearing. */
export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-white/5 bg-void/60 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Logo size={32} glow={false} />
          <span className="font-display text-lg font-bold tracking-tight">
            Foreseen
          </span>
        </div>
        <div className="flex items-center gap-5 text-sm text-slate-300">
          {NAV_LINKS.map((link) =>
            link.internal ? (
              <Link
                key={link.href}
                href={link.href}
                className="hidden hover:text-white sm:inline"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="hidden hover:text-white sm:inline"
              >
                {link.label}
              </a>
            ),
          )}
          <Link href="/play" className="btn-primary !py-2">
            Launch App
          </Link>
          <button
            type="button"
            className="btn-ghost !px-2.5 !py-2 sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              aria-hidden
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M4 4l10 10M14 4L4 14" />
              ) : (
                <path d="M2.5 5h13M2.5 9h13M2.5 13h13" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav-panel"
          className="border-t border-white/5 px-4 py-3 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.internal ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
