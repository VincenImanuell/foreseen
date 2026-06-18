import type { Address, Hex } from "viem";
import { Foreseen, type ForeseenOptions } from "./client.js";
import { counter } from "./crypto.js";
import { pickCounterFromRead } from "./strategy.js";
import {
  MatchState,
  Mode,
  Move,
  MOVE_NAME,
  type MatchView,
  type ModeName,
  type OpponentRead,
} from "./types.js";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nowSec = () => Math.floor(Date.now() / 1000);

/** Context a strategy sees before it commits — the scouting surface. */
export interface BotContext {
  matchId: bigint;
  self: Address;
  opponent: Address;
  /** Opponent's on-chain scouting read, or null if stats are unavailable. */
  opponentRead: OpponentRead | null;
  /** This bot's own throws so far (oldest first). */
  selfHistory: Move[];
}

/**
 * A function that returns the move this bot will commit on CELO.
 * Receives a {@link BotContext} and may be async (useful for LLM-backed agents).
 * @since 0.1.0
 */
export type Strategy = (ctx: BotContext) => Move | Promise<Move>;

function pickRandom(): Move {
  return ([Move.Rock, Move.Paper, Move.Scissors] as const)[Math.floor(Math.random() * 3)] ?? Move.Rock;
}

/** Built-in strategies. Bots are bot-legal by design — build your own too. */
export const strategies = {
  /** Uniform random — the unexploitable baseline. */
  random: (() => pickRandom()) as Strategy,

  /** Always Rock — exploitable, for testing only. */
  biasRock: (() => Move.Rock) as Strategy,

  /** Scout the opponent's stats and throw the counter to their favorite move. */
  counterStats: ((ctx) => {
    const r = ctx.opponentRead;
    if (r?.suggestedCounter) return pickCounterFromRead(r).move;
    // Fall back to the lose-shift tell, then random.
    if (r?.tells.afterLoss) return counter(r.tells.afterLoss);
    return pickRandom();
  }) as Strategy,
} satisfies Record<string, Strategy>;

export type StrategyName = keyof typeof strategies;

export interface ForeseenBotOptions extends ForeseenOptions {
  /** A built-in strategy name or your own function. Default: "random". */
  strategy?: StrategyName | Strategy;
  /** Poll interval (ms) while waiting on the opponent. Default 4000. */
  pollMs?: number;
}

export interface Outcome {
  matchId: bigint;
  /** "win" | "loss" | "draw" | "cancelled" from this bot's perspective. */
  result: "win" | "loss" | "draw" | "cancelled" | "unknown";
  myMove: Move;
  theirMove: Move;
}

/**
 * A turnkey Foreseen agent. Wraps a {@link Foreseen} client and drives the full
 * commit-reveal lifecycle with a pluggable strategy.
 *
 * Honesty note: bots playing **real players** is a first-class feature (cold-start
 * opponents, player-deployed agents). Do NOT run bots against each other in a
 * funded loop to manufacture volume / fees / DAU — that is wash trading. Label bot
 * wallets [BOT] and never report them as organic users.
 */
export class ForeseenBot {
  readonly rps: Foreseen;
  private readonly strategy: Strategy;
  private readonly pollMs: number;
  private readonly history: Move[] = [];

  constructor(opts: ForeseenBotOptions) {
    if (!opts.privateKey) throw new Error("ForeseenBot needs a privateKey to play.");
    this.rps = new Foreseen(opts);
    const s = opts.strategy ?? "random";
    this.strategy = typeof s === "function" ? s : strategies[s];
    if (!this.strategy) throw new Error(`Unknown strategy "${String(s)}"`);
    this.pollMs = opts.pollMs ?? 4000;
  }

  get address(): Address {
    return this.rps.address!;
  }

  private log(msg: string): void {
    console.log(`[ForeseenBot ${this.address.slice(0, 8)}] ${msg}`);
  }

  /**
   * Cold-start OPPONENT mode — JOIN-ONLY. Waits for matches that real players
   * create and plays them, so an early player always finds an opponent. Never
   * creates a match, so two bots can't pair into a fake bot-vs-bot match.
   */
  async runOpponent(opts: { maxMatches?: number } = {}): Promise<void> {
    const max = opts.maxMatches ?? Infinity;
    let played = 0;
    this.log("opponent mode (join-only): waiting for player-created matches.");
    while (played < max) {
      const open = await this.rps.getOpenMatches({ limit: 1, excludePlayer: this.address });
      const target = open[0];
      if (!target) {
        await sleep(this.pollMs);
        continue;
      }
      try {
        await this.rps.joinMatch({ matchId: target.id, bet: target.bet });
        await this.playMatch(target.id);
        await this.rps.withdraw();
        played += 1;
      } catch (e) {
        this.log(`skip #${target.id}: ${e instanceof Error ? e.message : String(e)}`);
        await sleep(this.pollMs);
      }
    }
  }

  /** Open a match and play it through (useful for self-testing your strategy). */
  async createAndPlay(p: { mode: ModeName | Mode; bet: string }): Promise<Outcome> {
    const { matchId } = await this.rps.createMatch(p);
    this.log(`created match #${matchId}, waiting for an opponent`);
    await this.waitForState(matchId, [MatchState.Scouting, MatchState.Cancelled]);
    return this.playMatch(matchId);
  }

  /**
   * Drive commit → reveal → settle for a match this bot is already a player in.
   * Scouts the opponent first, then asks the strategy for a move.
   */
  async playMatch(matchId: bigint): Promise<Outcome> {
    let m = await this.rps.getMatch(matchId);
    const me = this.address.toLowerCase();
    const isA = m.playerA.toLowerCase() === me;
    if (!isA && m.playerB.toLowerCase() !== me) {
      throw new Error(`not a player in match #${matchId}`);
    }
    const opponent = isA ? m.playerB : m.playerA;

    // Scout, decide, commit.
    let opponentRead: OpponentRead | null = null;
    try {
      opponentRead = await this.rps.analyzeOpponent(opponent);
    } catch {
      opponentRead = null;
    }
    const move = await this.strategy({
      matchId,
      self: this.address,
      opponent,
      opponentRead,
      selfHistory: [...this.history],
    });
    this.history.push(move);
    this.log(`commit ${MOVE_NAME[move]} vs ${opponent.slice(0, 8)}`);
    const { salt } = await this.rps.commit({ matchId, move });

    // Wait for reveal phase, or salvage on a no-commit opponent.
    while (true) {
      m = await this.rps.getMatch(matchId);
      if (m.state === MatchState.Revealing) break;
      if (m.state === MatchState.Settled || m.state === MatchState.Cancelled) {
        return this.outcome(matchId, m, move);
      }
      if (m.state === MatchState.Scouting && nowSec() > m.commitDeadline) {
        await this.rps.claimTimeout({ matchId });
        return this.outcome(matchId, await this.rps.getMatch(matchId), move);
      }
      await sleep(this.pollMs);
    }

    // Reveal, then wait for settlement (or claim the reveal timeout).
    this.log(`reveal ${MOVE_NAME[move]}`);
    await this.rps.reveal({ matchId, move, salt });
    while (true) {
      m = await this.rps.getMatch(matchId);
      if (m.state === MatchState.Settled || m.state === MatchState.Cancelled) {
        return this.outcome(matchId, m, move);
      }
      if (m.state === MatchState.Revealing && nowSec() > m.revealDeadline) {
        await this.rps.claimTimeout({ matchId });
        return this.outcome(matchId, await this.rps.getMatch(matchId), move);
      }
      await sleep(this.pollMs);
    }
  }

  private outcome(matchId: bigint, m: MatchView, myMove: Move): Outcome {
    if (m.state === MatchState.Cancelled) {
      return { matchId, result: "cancelled", myMove, theirMove: Move.None };
    }
    const isA = m.playerA.toLowerCase() === this.address.toLowerCase();
    const mine = isA ? m.revealA : m.revealB;
    const theirs = isA ? m.revealB : m.revealA;
    let result: Outcome["result"] = "unknown";
    if (mine !== Move.None && theirs !== Move.None) {
      result = mine === theirs ? "draw" : counter(theirs) === mine ? "win" : "loss";
    }
    this.log(`match #${matchId} → ${result} (me ${MOVE_NAME[mine] ?? "?"}, them ${MOVE_NAME[theirs] ?? "?"})`);
    return { matchId, result, myMove, theirMove: theirs };
  }

  private async waitForState(matchId: bigint, states: MatchState[]): Promise<MatchView> {
    while (true) {
      const m = await this.rps.getMatch(matchId);
      if (states.includes(m.state)) return m;
      await sleep(this.pollMs);
    }
  }
}

export type { Hex };
