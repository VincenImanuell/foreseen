import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { RPS_CORE_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/rps";

const STEPS = [
  {
    icon: "🤝",
    title: "Matchmake",
    body: "Open a match or join one and escrow your bet. No move yet — you're just sitting down across the table.",
  },
  {
    icon: "🔍",
    title: "Scout",
    body: "Now you see your opponent. Read their on-chain history: move distribution, what they throw after a win or a loss. 90 seconds.",
  },
  {
    icon: "🔒",
    title: "Commit",
    body: "Seal your move as a hash. Neither side can see the other's throw — no peeking, no front-running.",
  },
  {
    icon: "👁",
    title: "Reveal",
    body: "Both reveal within 90 seconds. The contract settles instantly and pays the winner. Provably fair.",
  },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Behavioral profiling",
    body: "Every revealed match writes a tamper-proof profile: move distribution and the win-stay / lose-shift signal. Scout anyone before you face them.",
  },
  {
    icon: "🏅",
    title: "Soulbound ranks",
    body: "Climb Bronze → Legend on win streaks. Rank badges (ERC-5192) can't be bought, sold or transferred — they prove skill, not money.",
  },
  {
    icon: "🔐",
    title: "Commit–reveal",
    body: "Moves are sealed as hashes and opened on-chain. Refereeless and fair — neither player can react to the other's choice.",
  },
  {
    icon: "⚖️",
    title: "Not gambling",
    body: "No RNG, no house, no dealer. The contract is a neutral referee that escrows a peer-to-peer stake and pays the winner. You win by skill.",
  },
];

export default function Landing() {
  return (
    <main className="overflow-x-hidden">
      {/* ---- Nav ---- */}
      <nav className="sticky top-0 z-30 border-b border-white/5 bg-void/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size={32} glow={false} />
            <span className="font-display text-lg font-bold tracking-tight">
              Foreseen
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-300">
            <a href="#how" className="hidden hover:text-white sm:inline">
              How to play
            </a>
            <a href="#mindsport" className="hidden hover:text-white sm:inline">
              The read
            </a>
            <Link href="/play" className="btn-primary !py-2">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative px-4 pb-24 pt-20 sm:pt-28">
        {/* decorative rotating rings behind the eye */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-oracle-purple/15 animate-spinSlow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full border border-oracle-cyan/10 animate-spinSlow"
          style={{ animationDirection: "reverse" }}
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="animate-float">
              <Logo size={132} eyeOnly />
            </div>
          </div>

          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live on Celo mainnet
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              See the move
              <br />
              <span className="text-gradient">before it&apos;s made.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
              Foreseen is on-chain Rock Paper Scissors as a psychological
              mind-sport. Matchmake, scout your opponent&apos;s history, then
              commit blind. A game of reading — not luck.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/play" className="btn-primary !px-6 !py-3 text-base">
                👁 Launch App
              </Link>
              <a href="#how" className="btn-ghost !px-6 !py-3 text-base">
                How to play
              </a>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span>⚖️ Not gambling — pure skill</span>
              <span>🔐 Provably fair commit–reveal</span>
              <span>🏅 Soulbound ranks</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- How to play ---- */}
      <section id="how" className="scroll-mt-20 border-t border-white/5 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How to play
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
              Four steps. The throw is trivial — the game is everything around
              it.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="card h-full">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-oracle-purple/15 text-2xl shadow-glow">
                    {s.icon}
                  </div>
                  <div className="mt-4 font-display text-lg font-bold">
                    {s.title}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- The read (mind-sport) ---- */}
      <section
        id="mindsport"
        className="scroll-mt-20 border-t border-white/5 px-4 py-20"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-oracle-cyan">
                The read
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                You can randomize your moves.
                <br />
                <span className="text-gradient">
                  You can&apos;t randomize your mind.
                </span>
              </h2>
              <p className="mt-4 text-slate-400">
                Because you commit only after matchmaking, both players get to
                scout. A tamper-proof profile shows their favorite throw and how
                they react after a win or a loss. Pick the move that beats their
                habit — or bluff against it.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li>🔍 Move distribution &amp; contextual tells, on-chain</li>
                <li>🤝 Symmetric scouting — both sides read before they throw</li>
                <li>⛓️ History can&apos;t be hidden or faked</li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {/* mock scouting card */}
            <div className="rounded-2xl border border-oracle-cyan/20 bg-oracle-cyan/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-oracle-cyan">
                  🔍 Scouting report
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  0x9f…3c2a
                </span>
              </div>
              <div className="mb-3 flex gap-3 text-xs">
                <span className="text-emerald-300">18W</span>
                <span className="text-rose-300">7L</span>
                <span className="text-slate-400">3D</span>
                <span className="ml-auto text-slate-500">28 revealed</span>
              </div>
              {[
                ["🪨 Rock", 58],
                ["📄 Paper", 17],
                ["✂️ Scissors", 25],
              ].map(([label, pct]) => (
                <div key={label as string} className="mb-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-mono text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-oracle-purple to-oracle-cyan"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-3 rounded-lg border border-white/10 bg-void/40 px-3 py-2 text-xs text-slate-300">
                After a loss: tends to throw{" "}
                <span className="font-semibold text-oracle-gold">🪨 Rock</span> —
                so throw Paper.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="border-t border-white/5 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A mind-sport, on-chain
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 90}>
                <div className="card flex h-full gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold">{f.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="border-t border-white/5 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="mb-6 flex justify-center">
              <div className="animate-float">
                <Logo size={84} eyeOnly />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Read your opponent.
              <br />
              <span className="text-gradient">Foresee the move.</span>
            </h2>
            <div className="mt-8">
              <Link href="/play" className="btn-primary !px-8 !py-3.5 text-base">
                👁 Launch App
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Live on Celo mainnet · RPSCore{" "}
              <a
                href={`https://celoscan.io/address/${RPS_CORE_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-slate-400 hover:text-oracle-cyan"
              >
                {shortAddress(RPS_CORE_ADDRESS)} ↗
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        Foreseen · Celo mainnet · skill-based mind-sport, not gambling · real
        CELO stakes
      </footer>
    </main>
  );
}
