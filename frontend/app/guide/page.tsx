import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Guide — Foreseen",
  description:
    "Player, builder, and safety flows for Foreseen, the on-chain Rock Paper Scissors mind-sport on Celo.",
};

const SECTIONS = [
  {
    title: "Player Flow",
    items: [
      "Open or join a table before choosing a move.",
      "Scout the opponent's revealed history.",
      "Commit a sealed move and keep the salt safe.",
      "Reveal before the deadline and withdraw claimable funds.",
    ],
  },
  {
    title: "Builder Flow",
    items: [
      "Use @foreseen/sdk for scouting, dashboards, and agent workflows.",
      "Keep write clients in trusted runtimes.",
      "Use Celo Sepolia for funded tests.",
      "Prefer join-only agents for honest liquidity.",
    ],
  },
  {
    title: "Safety Flow",
    items: [
      "Never commit private keys, seed phrases, or live salts.",
      "Show stake, pot, network, and deadlines near wallet actions.",
      "Do not manufacture fake usage, fake downloads, or bot-vs-bot volume.",
      "Keep contract changes separate from frontend and SDK updates.",
    ],
  },
];

export default function GuidePage() {
  return (
    <main id="main-content" className="min-h-screen px-4 py-10">
      <a
        href="#guide-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-lg focus:bg-oracle-cyan focus:px-3 focus:py-1.5 focus:text-sm focus:text-void"
      >
        Skip to content
      </a>
      <div id="guide-content" className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-ring">
          <Logo size={36} />
          <span className="font-display text-lg font-bold">Foreseen</span>
        </Link>

        <section className="mt-10">
          <div className="eyebrow">Guide</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Build and play with the read first.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Foreseen works best when the interface keeps the actual loop clear:
            matchmake, scout, commit, reveal, and withdraw. This guide keeps
            player UX, SDK integrations, and agent safety in the same place.
          </p>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <section key={section.title} className="surface-soft p-5">
              <h2 className="font-display text-lg font-bold text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-oracle-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/play" className="btn-primary">
            Launch app
          </Link>
          <a href="/#mindsport" className="btn-ghost">
            Read the mind-sport layer
          </a>
        </div>
      </div>
    </main>
  );
}
