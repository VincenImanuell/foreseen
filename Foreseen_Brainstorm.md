# Foreseen 👁️
> *"See the move before it's made."*

Platform: **Celo / MiniPay**
Program: **Proof of Ship (POS) Celo — Games & Interactive**
Package: `@foreseen/sdk` (npm)

---

## Table of Contents
1. [Overview](#overview)
2. [Why On-Chain](#why-on-chain)
3. [Core Differentiators](#core-differentiators)
4. [Game Modes](#game-modes)
5. [Rank & Streak System](#rank--streak-system)
6. [Psychology & Stats Layer](#psychology--stats-layer)
7. [Psychology Theory Foundation](#psychology-theory-foundation)
8. [Reward Mechanism](#reward-mechanism)
9. [Smart Contract Architecture](#smart-contract-architecture)
10. [SDK Design](#sdk-design)
11. [Bot Ecosystem](#bot-ecosystem)
12. [Circular Liquidity Bot Strategy](#circular-liquidity-bot-strategy)
13. [Cold Start Strategy](#cold-start-strategy)
14. [Market Comparison](#market-comparison)
15. [Known Weaknesses & Risks](#known-weaknesses--risks)
16. [UI Theme](#ui-theme)
17. [Logo](#logo)
18. [Taglines](#taglines)
19. [Claude Code Workflow & Rules](#claude-code-workflow--rules)
20. [Development Checklist](#development-checklist)
21. [Open Questions](#open-questions)
22. [Recommended Development Order](#recommended-development-order)

---

## Overview

Foreseen is an on-chain Rock Paper Scissors game built on the Celo Network, playable through MiniPay. Unlike traditional RPS, Foreseen introduces a **psychology layer**, **public on-chain stats**, **ranked progression**, and **tournament brackets** — transforming a game of luck into a game of reading your opponent's mind.

> v1 ships without power cards, gacha, or marketplace. Core game + stats + bots + tournament.

**Game Loop:**
```
Player Registers
      ↓
Choose Mode: Casual | Ranked | Tournament
      ↓
Match Found → Taunt Phase (optional — send message/emoji on-chain)
      ↓
Commit Phase → Reveal Phase → Settle
      ↓
Update: Streak | Rank | Stats
      ↓
(If Tournament) → Next Bracket Round
```

---

## Why On-Chain

> *"Foreseen is only possible on-chain — because mind games require trustless truth."*

| Feature | Why It Must Be On-Chain |
|---|---|
| **Stats & Tells** | Must be tamper-proof — if a server can manipulate stats, the entire psychology layer collapses |
| **Tournament & Prize Pool** | Prize funds held in smart contract, not developer wallet — trustless settlement |
| **Rank & Soulbound NFT** | Verifiable achievement that cannot be bought or transferred |
| **Commit-Reveal** | The only way to prevent cheating in RPS — proper commit-reveal on-chain |
| **Timestamp Tells** | Block timestamps are immutable — commit time analytics cannot be faked |

---

## Core Differentiators

1. **Psychology / Stats Layer** — Public on-chain stats, time-range filter, tells detection, taunt system
2. **Streak & Rank Progression** — Soulbound NFT rank badge (Bronze → Legend) with full badge history
3. **Tournament Bracket System** — 4-player (v1) / 8-16 player (v2) bracket, winner-takes-all
4. **Timestamp Tell Analytics** — commit time stored on-chain, reveals decision confidence
5. **SDK + Bot Ecosystem** — open npm package, bot-legal by design, player-deployable bots

---

## Game Modes

| Mode | Description | Bet | Rank Impact |
|---|---|---|---|
| **Casual** | Random matchmaking | Open | ❌ |
| **Ranked** | Affects streak & rank badge | Min bet by rank | ✅ |
| **Tournament** | Bracket, scheduled | Fixed entry fee | ✅ Bonus |

---

## Rank & Streak System

```
Streak 0-4   → 🥉 Bronze
Streak 5-9   → 🥈 Silver
Streak 10-19 → 🥇 Gold
Streak 20-49 → 💎 Platinum
Streak 50+   → 👑 Legend
```

- Rank stored as **Soulbound NFT (ERC-5192)** — non-transferable
- NFT upgrades automatically at each threshold
- Losing in Ranked resets streak, rank drops gradually (not immediately)

### Streak Multiplier (Ranked)
```
Streak 1-4   → 1.0x payout
Streak 5-9   → 1.1x bonus
Streak 10-19 → 1.25x bonus
Streak 20+   → 1.5x bonus
```
Multiplier funded from protocol fee pool — no extra cost to opponent.

### Badge & Achievement System

Every rank reached and milestone hit is permanently recorded on-chain.

```
👁️ Foreseen Profile: 0x1234...abcd

Current Rank : 💎 Platinum  (Active Streak: 23)

── Rank History ──────────────────
🥉 Bronze reached    : 12x
🥈 Silver reached    : 8x
🥇 Gold reached      : 4x
💎 Platinum reached  : 2x
👑 Legend reached    : 0x

── Personal Records ──────────────
🔥 Longest Streak Ever  : 31
⚡ Most Wins in a Day   : 14
🏆 Tournaments Won      : 2
🎭 Taunts Sent          : 304
🎯 Win Rate (lifetime)  : 61%
```

Even if current streak resets to 0, badge history reveals true skill level. A player who has reached Legend 3x is dangerous at any streak. This is critical **scouting information** before a match.

```typescript
await rps.getBadgeHistory(address)
// Returns: { bronzeCount, silverCount, goldCount, platinumCount, legendCount,
//            longestStreak, mostWinsInDay, tournamentsWon, lifetimeWinRate }
```

---

## Psychology & Stats Layer

> *"On-chain never forgets."*
> *"You can hide the surface. Not the pattern."*

### Public Stat Card

```
👁️ Foreseen Profile: 0x1234...abcd

Matches: 847  |  Win Rate: 61%

Move Distribution:
  ✊ Rock     ████████░░  38%
  ✋ Paper    █████░░░░░  29%
  ✌️ Scissors ████████░░  33%

Contextual Patterns:
  After Winning      → Rock 52% | Paper 28% | Scissors 20%
  After Losing       → Rock 21% | Paper 35% | Scissors 44%
  First Move         → Rock 71%
  Under Pressure     → Rock 58%
  High Bet (>1 CELO) → Rock 67%
  Tournament Final   → Rock 72%

Taunt Style: Aggressive (win rate 69% after taunting)
```

### Time-Range Stats Filter

During matchmaking, view opponent stats by time range:

```
[ All Time ] [ 1 Year ] [ 1 Month ] [ 1 Week ] [ 3 Days ] [ 24H ] [ Today ]
```

Each timeframe reveals a different psychology layer:
```
Today / 24H   → "hot hand" — what are they playing RIGHT NOW
3D / 1W       → current strategy, mood, tilt pattern
1M / 1Y       → medium-term tendency, harder to fake
All Time      → true baseline, most reliable but most manipulable
```

**Multi-layer mind game:**
```
All Time → Rock 40% | Paper 33% | Scissors 27%
Today    → Rock 10% | Paper 20% | Scissors 70% ← suspicious anomaly
```

**vsAllTime Delta — Anomaly Detection:**
```typescript
await rps.analyzeOpponent(address, { timeRange: '24h' })
// Returns:
{
  timeRange: '24h',
  matches: 12,
  rockPct: 10,
  paperPct: 20,
  scissorsPct: 70,
  trend: 'scissors_heavy',
  vsAllTime: {
    rockDelta: -30,       // dropped 30% vs all-time → suspicious
    scissorsDelta: +43,   // up 43% → likely stat manipulation
  }
}
```

### On-Chain Storage (Hybrid)
```
Raw match history  → stored on-chain, last 30 days (detailed, queryable)
Monthly aggregates → pre-aggregated buckets for data older than 30 days
SDK layer          → handles timeframe filtering + delta calculation client-side
```

### Timestamp Tells

Every tx has a block timestamp. Foreseen uses this as an additional hidden stat layer:

```
Commit < 5 sec    → confident, knew immediately
Commit 5-15 sec   → slight hesitation
Commit > 30 sec   → overthinking, likely switched from first instinct
                    (first instinct = Rock, statistically)
```

```typescript
await rps.analyzeOpponent(address, { timeRange: '1w' })
// Returns:
{
  avgCommitTime: 8.3,
  fastCommits:  { rock: 61%, paper: 22%, scissors: 17% },
  slowCommits:  { rock: 29%, paper: 41%, scissors: 30% },
  pressureResponse: 'anchors_to_rock_under_pressure'
}
```

### Taunt System

| Taunt Type | Example | Meta Effect |
|---|---|---|
| **Confident** | "ez" / 💅 | Opponent may overthink |
| **Aggressive** | "rock incoming 🤜" | Bluff or truth? |
| **Silent** | No taunt | Unpredictable |
| **Reverse Bluff** | "definitely not scissors ✂️" | Classic mind game |

Win rate per taunt type stored on-chain — becomes readable scouting info.

### Confidence Bet (Ranked Only)

After commit, before reveal — a raise phase opens:
```
→ Raise bet up to 2x
→ Opponent can call or fold (refund minus small fee)
→ Every raise/fold recorded on-chain as part of stats
```

### The 7 Layers of Unreadability

```
Layer 1: Overall move distribution   → surface stats
Layer 2: Contextual patterns         → deep stats
Layer 3: Timeframe anomalies         → time-range filter
Layer 4: Sequential patterns         → after-win/loss analysis
Layer 5: Commit timestamp patterns   → block timestamps
Layer 6: Taunt response behavior     → taunt stats
Layer 7: High-pressure patterns      → tournament/high-bet stats
```

> *"You can randomize your moves. You can't randomize your mind."*

---

## Psychology Theory Foundation

**Theory 1 — Humans Cannot Truly Randomize**
*(Falk & Konold, 1997)*
Even players who try to be random produce measurably non-random sequences. RPS move history always contains detectable patterns.

**Theory 2 — Win-Stay, Lose-Shift**
*(Zhejiang University, 360 students, 300 rounds each)*
Winners tend to repeat the winning move. Losers shift to the next in sequence (Rock → Paper → Scissors). After-win and after-loss stats are the most predictive signals in the system.

**Theory 3 — Sequential Pattern Detection & Theory of Mind**
*(Stanford Psychology, 2024-2025)*
People readily exploit simple transition patterns but struggle with complex sequential dependencies. The SDK's `analyzeOpponent()` detects what human minds cannot.

**Theory 4 — Anchoring Bias Under Time Pressure**
*(Tversky & Kahneman, 1974)*
Time pressure amplifies cognitive biases. Players anchor to their first instinct (statistically: Rock). The countdown timer + taunt system deliberately triggers this.

**Theory 5 — Patterns Persist Even in Professional Athletes**
*(Palacios-Huerta, 2003 — penalty kicks)*
Even highly incentivized professionals cannot escape behavioral patterns. Higher stakes = more patterns emerge, not fewer.

**Theory 6 — RPS as Neurobehavioral Fingerprint**
*(NIH / PubMed, 2025)*
RPS history is a fingerprint of how a brain makes decisions under pressure. No two players have the same profile — on-chain stats capture this permanently.

---

## Reward Mechanism

### Revenue Sources
```
Every match      → 5% protocol fee from pot
Tournament entry → fee goes into prize pool
Weekly pool      → accumulated from protocol fees
```

### Protocol Fee Allocation
```
5% total fee:
├── 2% → Streak bonus pool (multiplier funding)
├── 1% → Weekly leaderboard prize
├── 1% → Tournament prize top-up
└── 1% → Dev / treasury
```

### Tournament Prize Distribution
```
1st place → 60%
2nd place → 25%
3rd place → 10%
Protocol  → 5%
```

### Rank Milestone Rewards
| Milestone | Reward |
|---|---|
| Reach Silver | Unlock extra taunt slots |
| Reach Gold | Entry fee discount 10% |
| Reach Platinum | Entry fee discount 15% |
| Reach Legend | Special soulbound badge + 20% tournament discount |

### Weekly Leaderboard
- Top 3 ranked players each week receive reward from pool
- Auto-distributed by contract every 7 days
- Primary driver of consistent weekly transaction volume spike

---

## Smart Contract Architecture

```
contracts/
├── RPSCore.sol        # Commit-reveal, match settlement, bet handling
├── RPSStats.sol       # Surface + deep contextual stats, timeframe buckets
├── RPSRanked.sol      # Streak, rank, multiplier, confidence bet
├── RPSSoulbound.sol   # ERC-5192 rank badge NFT, badge history
└── RPSTreasury.sol    # Fee collection, pool distribution, weekly payout
```

> Power cards, gacha, marketplace → v2 contracts only

### Commit-Reveal Scheme
```
1. Player commits  : keccak256(move + salt) → stored on-chain
2. Both committed  : reveal phase opens
3. Player reveals  : sends move + salt plaintext
4. Contract verifies hash → settles winner
5. Timeout         : if opponent doesn't reveal in 5 min → auto-win
```

---

## SDK Design

**Package:** `@foreseen/sdk`

```typescript
import { Foreseen } from '@foreseen/sdk'

const rps = new Foreseen({
  network: 'celo',      // 'celo' | 'alfajores'
  privateKey: '0x...',
})

// Matchmaking
await rps.joinCasual({ bet: '0.1' })
await rps.joinRanked({ bet: '0.5' })
await rps.joinTournament({ tournamentId: '...' })

// Gameplay
await rps.taunt({ matchId, emoji: '🤙', message: 'gl hf' })
await rps.commit({ matchId, move: 'rock', salt: randomSalt() })
await rps.reveal({ matchId, move: 'rock', salt })
await rps.confidenceBet({ matchId, action: 'raise', amount: '0.5' })

// Stats & Scouting
await rps.getPlayerStats(address)
await rps.analyzeOpponent(address, { timeRange: '24h' })
await rps.getBadgeHistory(address)
await rps.getLeaderboard()
await rps.getWeeklyLeaderboard()
await rps.isBot(address)

// Tournament
await rps.getTournamentBracket(tournamentId)
await rps.getUpcomingTournaments()

// Profile
await rps.getProfile(address)
await rps.getMyRank()
```

### Bot Helper Module
```typescript
import { ForeseenBot } from '@foreseen/sdk/bot'

const bot = new ForeseenBot({
  privateKey: '0x...',
  strategy: 'counter-stats' // 'random' | 'counter-stats' | 'aggressive' | 'streak-protect'
})

await bot.autoPlay({ mode: 'ranked', bet: '0.1', maxMatches: 100 })
await bot.maintainStreak()
await bot.getStats()
```

---

## Bot Ecosystem

### Player-Made Bots
Bots are a first-class feature. Any player can build and deploy their own bot using the public SDK.

> *"Deploy your own bot. Build your strategy. Let it fight for you."*

**Strategy Tiers:**
```
Tier 1 — Simple
  RandomBot    → pure random, 33% winrate baseline
  BiasBot      → always picks Rock (exploitable, for testing)

Tier 2 — Stats-Based
  CounterBot   → queries opponent stats → picks counter move
  PatternBot   → detects after-win / after-loss patterns
  ContextBot   → analyzes deep stats per context + timerange

Tier 3 — Advanced
  BluffBot     → aggressive taunt + confidence bet raises
  TournamentBot → different strategy per bracket round
  AdaptiveBot  → switches strategy mid-match if losing

Tier 4 — Meta
  AntiBot      → detects if opponent is a bot → counters accordingly
  TimingBot    → exploits commit timestamp patterns
```

### Bot Leaderboard
Top performing bots highlighted on dedicated Bot Leaderboard. Bot creators get public recognition.

---

## Circular Liquidity Bot Strategy

> Run official bots with minimal capital using circular liquidity — saldo berpindah antar wallet, protocol fee masuk ke treasury.

### How It Works
```
Bot Wallet A  ←──────────→  Bot Wallet B
                  match
               5% → Treasury

Treasury auto-reloads bots when balance drops below threshold
```

Saldo tidak hilang — hanya berpindah antar bot wallet. Yang "hilang" hanya 5% per match, yang masuk ke treasury kamu sendiri.

### Capital Simulation
```
2 bot wallets × 5 CELO each = 10 CELO total (~Rp75,000-100,000)
Bet size per match: 0.1 CELO
Fee per match:      0.01 CELO → treasury
Gas per tx:         ~0.00002 CELO (nearly free)

Matches before depletion: 10 CELO ÷ 0.01 = 1,000 matches
Time at 10 matches/hour:  100 hours = ~4 days non-stop
Treasury accumulated:     10 CELO (= original capital returned)
```

### Auto-Reload Logic
```typescript
// In bot script
const MIN_BALANCE = 1.0  // CELO
const RELOAD_AMOUNT = 3.0 // CELO

if (botWallet.balance < MIN_BALANCE) {
  await treasury.send(botWallet.address, RELOAD_AMOUNT)
}
```

### Scale-Up Path
```
Phase 1  → 2 bots, 10 CELO, Rp75-100rb, self-sustaining in 4 days
Phase 2  → treasury funds 5 bots (no new capital needed)
Phase 3  → treasury funds 10-20 bots (fully self-funded)
Phase 4  → community bots join → volume grows organically
```

### Official Bot Behavior Rules
- Response delay: 1-5 seconds random (human-feel)
- Taunt 30% of matches randomly
- Target winrate: ~48% (slightly lose to human players)
- All labeled [OFFICIAL BOT] on-chain
- Mix of strategies: random + counter + aggressive

---

## Cold Start Strategy

### Phases
```
Phase 1 — Launch
  Real Players : 5-10
  Official Bots: 5-10 (from circular liquidity system)
  → Players always find a match

Phase 2 — Organic Growth
  Real players increase → official bots gradually reduced
  Players start deploying bots via SDK

Phase 3 — Self-Sustaining
  Community bots >> official bots
  Treasury self-funds remaining official bots
```

### Transparency Policy
> *"Foreseen runs official bots during early access to ensure players always find a match. All bots are labeled [BOT] on their profile."*

Players can filter: **vs Bots** | **vs Humans Only** | **Both**

---

## Market Comparison

> *"Existing on-chain RPS games treat it as a coin flip. Foreseen treats it as a mind sport."*

| Project | RPS? | On-chain Stats? | Psychology Layer? | Timestamp Tells? | Tournament? |
|---|---|---|---|---|---|
| Generic RPS clones | ✅ | ❌ | ❌ | ❌ | ❌ |
| Axie Infinity | ❌ | Partial | ❌ | ❌ | ✅ |
| **Foreseen** | ✅ | ✅✅ | ✅ | ✅ | ✅ |

---

## Known Weaknesses & Risks

> Every weakness has a solution. Ship v1 solid, expand ambitiously in v2.

**1. Complexity vs Scope**
Solution: Phased launch. v1 = core game + stats + SDK + bots. No power cards, no gacha, no marketplace.

**2. Commit-Reveal UX**
Solution: Optimistic UI with engaging waiting state. Auto-claim win after timeout with one tap.

**3. Cold Start**
Solution: Circular liquidity bots from day 1. Transparent labeling. Human-only filter available.

**4. Stats Gaming (Casual)**
Solution: Only Ranked matches count toward public stats.

**5. Tournament Fill**
Solution: v1 = 4-player mini tournaments. Bots fill empty slots. 8/16 bracket in v2.

**6. Streak Reset Frustration**
Solution: Free streak protection milestone gift every 10/25/50 wins.

**7. Gas Accumulation**
Solution: Celo gas ~$0.001 per tx. Display estimated gas before each action.

### v1 vs v2 Scope
```
v1 (POS Launch) ✅
├── RPSCore + RPSStats + RPSRanked + RPSSoulbound + RPSTreasury
├── Casual + Ranked modes
├── 4-player mini tournament
├── Full stats layer (time-range, timestamp tells, vsAllTime)
├── @foreseen/sdk
├── Bot ecosystem (circular liquidity)
└── MiniPay frontend

v2 (Post-POS) 🚀
├── Power Cards (Common → Legendary)
├── Gacha system
├── Card marketplace
├── 8/16 player tournament
├── Full bot leaderboard
└── Season system
```

---

## UI Theme

**Direction: Dark Oracle + Cyber Hybrid**

### Color Palette
```
Background : Pure black — #000000
Primary    : Gold — rank badges, achievements, inner glow
Secondary  : Electric cyan/teal — stats, data streams
Accent     : Deep purple — smoke aura, mystical elements
Text       : White with subtle gold shimmer for titles
```

### Typography
```
Display : Geometric sans-serif, all caps, wide tracking
UI      : Geometric sans-serif, sharp and modern
Stats   : Monospace — terminal/blockchain data feed feel
```

### Key Screen Directions

**Home / Arena**
```
Pure black, "FORESEEN" large at top
Tagline: "See the move before it's made."
Eye motif floating in background
Buttons: [ Find Match ] [ Tournament ] [ My Profile ]
Ambient: slow particle float, purple smoke drift
```

**Match Screen**
```
Split screen — you vs opponent
Center: dramatic countdown timer
Taunt phase: graffiti-style message bubble
Commit: ✊ ✋ ✌️ with cyan hover glow
Reveal: cinematic slow-reveal → flash → result
Win: gold particle burst | Lose: screen shatter
```

**Player Profile**
```
Vertical tarot card proportions
Rank badge glowing per tier
Stats rendered as animated terminal readout
Badge history as collected icons
```

### Micro-interactions
- Hover move → shake + glow
- Streak increases → rank badge pulse
- Stats load → numbers count up from 0
- Opponent reveals → dramatic pause + flash

---

## Logo

### Concept
Stylized eye, iris divided into 3 sections (✊✋✌️), hexagon pupil (blockchain). Layered glow: purple smoke (outer) → cyan data streams (mid) → gold iris (inner).

### Status
Logo approved ✅ — generated via Gemini, cropped to square.

### Gemini Generation Prompt
```
A minimalist logo design for a blockchain game called "FORESEEN" on a pure
black background. The logo centers around a single stylized eye — the iris
is divided into three equal sections, each subtly shaped like a hand gesture:
a fist (rock), an open palm (paper), and two fingers (scissors). The pupil
is a small hexagon, referencing blockchain/on-chain technology.

The eye radiates a layered glow:
- Outer aura: deep purple, wide and diffused like smoke
- Mid glow: electric cyan/teal streaks extending outward like data streams
- Inner iris: warm gold gradient, glowing from within

Below the eye, the word "FORESEEN" in clean geometric sans-serif, all caps,
wide letter spacing, white with subtle gold shimmer.

Pure black background only. Tall vertical format, portrait orientation.
Mood: mystical oracle meets cyberpunk terminal. Serious and cinematic.
```

---

## Taglines

| Context | Tagline |
|---|---|
| **Main** | *"See the move before it's made."* |
| **Alt** | *"It's not luck. It's mind."* |
| **Alt 2** | *"Read. Bluff. Dominate."* |
| **Stats** | *"On-chain never forgets."* |
| **vs balanced** | *"You can hide the surface. Not the pattern."* |
| **vs random** | *"You can randomize your moves. You can't randomize your mind."* |
| **SDK/Bot** | *"The data is public. The edge is yours."* |
| **Tournament** | *"The oldest game. Outsmarted."* |
| **Timestamp** | *"Your hesitation is data."* |
| **7 layers** | *"Seven layers. Zero secrets."* |
| **General** | *"Rock. Paper. Scissors. Psychology."* |

---

## Claude Code Workflow & Rules

> READ THIS BEFORE EVERY SESSION. Non-negotiable.

### Budget
- Plan: Claude Code Max — $200/month flat
- Use **ultrathink** for: contract architecture, security review, game theory, SDK API design, UI final polish

### Zero Claude Footprint

```bash
# Run at START of every session
git config --global user.name "VincenImanuell"
git config --global user.email "vincenimanuel13@gmail.com"
claude config set includeCoAuthoredBy false

# Verify
git config --global user.name   # → VincenImanuell
claude config get includeCoAuthoredBy  # → false
```

Create in every repo:
```bash
mkdir -p .claude && echo '{"includeCoAuthoredBy": false}' > .claude/settings.json
```

### Rules
- Never mention Claude/AI in any comment, commit message, or doc
- All commits: `VincenImanuell` / `vincenimanuel13@gmail.com`
- Pre-push check: `git log --format="%an | %s | %b" -5` → must show no Claude trace

### Branching
```
main       → production, protected
develop    → integration
feature/*  → new features
fix/*      → bug fixes
docs/*     → documentation
chore/*    → setup/deploy
```

### PR Rules
- Every feature = Issue → Branch → PR → Merge
- PR must have: title, description, checklist, `Closes #XX`
- No direct push to main or develop

### GitHub Activity Strategy
```
Daily target: ~30 events/day

Open issues (2-4)         →  4 events
Create branches (1-2)     →  2 events
Commits (8-15)            → 12 events
Open PRs (1-2)            →  2 events
Review/comment PRs        →  4 events
Merge PRs                 →  2 events
Close issues              →  4 events
──────────────────────────────────────
Total                     → ~30 events/day 🟩🟩🟩
```

### Vercel Auto-Deploy
```
Push to develop → preview URL auto-deploy
Push to main    → production auto-deploy
```
Setup: Vercel dashboard → Import repo → set main=production, develop=preview.

---

## Development Checklist

### 🏗️ Setup
- [ ] Create repo: `github.com/VincenImanuell/foreseen`
- [ ] Set git config + claude config (no co-author)
- [ ] Create `.claude/settings.json`
- [ ] Create milestones: `v1-pos-launch`, `v2-expansion`
- [ ] Branch protection on `main`
- [ ] Connect Vercel auto-deploy
- [ ] Init monorepo structure

### 📝 Phase 1 — Smart Contracts
- [ ] `RPSCore.sol` — commit-reveal, match flow, bet, timeout, 5% fee
- [ ] `RPSStats.sol` — surface stats, deep contextual, 30-day raw + monthly buckets
- [ ] `RPSRanked.sol` — streak, rank, multiplier, confidence bet
- [ ] `RPSSoulbound.sol` — ERC-5192, badge history, personal records
- [ ] `RPSTreasury.sol` — fee collection, multiplier pool, weekly payout
- [ ] Unit tests for all contracts
- [ ] Deploy to Alfajores testnet
- [ ] Security review (ultrathink)
- [ ] Deploy to Celo mainnet

### 📦 Phase 2 — SDK
- [ ] Init `@foreseen/sdk` TypeScript package
- [ ] Core gameplay: `commit`, `reveal`, `taunt`, `confidenceBet`
- [ ] Stats: `getPlayerStats`, `analyzeOpponent` (with timeRange), `getBadgeHistory`
- [ ] Bot module: `ForeseenBot` class, all strategy modes
- [ ] README + TypeDoc
- [ ] Publish to npm

### 🤖 Phase 3 — Bots
- [ ] Create 2 bot wallets + 1 treasury wallet
- [ ] Implement circular liquidity logic (auto-reload from treasury)
- [ ] Deploy RandomBot + CounterBot
- [ ] Add natural delays (1-5 sec random)
- [ ] Set target winrate ~48%
- [ ] Label all bots [OFFICIAL BOT] on-chain
- [ ] Test circular liquidity sustainability

### 🎨 Phase 4 — Frontend
> ⚠️ Research 5+ UI references before writing any code.
> Search: "dark oracle UI", "cyberpunk web3 game UI", "neon glow react components"

- [ ] Init Next.js + Tailwind + wagmi + viem
- [ ] Design system (colors, typography, components)
- [ ] Home / Arena screen
- [ ] Match flow (taunt → commit → reveal → result)
- [ ] Player profile + stat card (tarot card design)
- [ ] Leaderboard (weekly + all-time)
- [ ] MiniPay wallet integration
- [ ] Deploy to Vercel

### 🚀 Phase 5 — POS Submission
- [ ] Deploy mainnet
- [ ] Fund official bots
- [ ] Record demo video
- [ ] Write POS submission
- [ ] Submit

### ✨ Phase 6 — UI Polish (LAST)
> ultrathink: "Review all screens. Make every screen visually stunning.
> Dark oracle + cyberpunk. Premium and cinematic."

- [ ] Full visual audit
- [ ] Micro-interaction polish
- [ ] Loading / error / empty states
- [ ] Mobile final pass
- [ ] Lighthouse audit

---

## Open Questions

| Question | Options |
|---|---|
| Contract tooling | Hardhat vs Foundry |
| SDK web3 lib | ethers.js vs viem |
| Tournament scheduling | Manual trigger vs Chainlink Keeper |
| Currency | Native CELO only (simpler for v1) |

---

## Recommended Development Order

```
v1 — POS Launch
1.  RPSCore.sol
2.  RPSStats.sol
3.  RPSRanked.sol
4.  RPSSoulbound.sol
5.  RPSTreasury.sol
6.  Unit tests + Alfajores deploy
7.  @foreseen/sdk core
8.  Bot module + circular liquidity bots
9.  Frontend (after UI research)
10. MiniPay integration
11. Mainnet deploy
12. POS submission
13. UI final polish (ultrathink)

v2 — Post-POS
14. Power Cards (Common → Legendary)
15. Gacha system
16. Card marketplace
17. 8/16 tournament brackets
18. Full bot leaderboard
19. Season system
```
