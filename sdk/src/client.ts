import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  parseEventLogs,
  getAddress,
  type Account,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { rpsCoreAbi, rpsStatsAbi } from "./abi.js";
import { CHAINS, DEFAULT_RPC, type NetworkName } from "./chains.js";
import { DEPLOYMENTS } from "./addresses.js";
import { computeCommit, randomSalt } from "./crypto.js";
import { analyze } from "./scout.js";
import {
  MatchState,
  Mode,
  Move,
  modeToEnum,
  type MatchView,
  type ModeName,
  type OpponentRead,
  type PlayerStats,
} from "./types.js";

/**
 * Constructor options for {@link Foreseen}.
 * All fields are optional — defaults produce a read-only mainnet client.
 * @since 0.1.0
 */
export interface ForeseenOptions {
  /** "celo" (mainnet, default) or "celo-sepolia" (testnet). */
  network?: NetworkName;
  /** Override the RPC endpoint. Defaults to the free public RPC for the network. */
  rpcUrl?: string;
  /** Player private key. Omit for a read-only client (scouting, getMatch, …). */
  privateKey?: Hex;
  /** Override the RPSCore address (e.g. a fresh deployment). */
  coreAddress?: Address;
  /** Override the RPSStats address. */
  statsAddress?: Address;
}

/**
 * Foreseen SDK client. Read methods work without a key; write methods
 * (createMatch, joinMatch, commit, reveal, withdraw …) require `privateKey`.
 *
 * ```ts
 * const rps = new Foreseen({ network: "celo", privateKey: "0x..." });
 * const { matchId } = await rps.createMatch({ mode: "casual", bet: "0.1" });
 * const read = await rps.analyzeOpponent(opponent);   // scout before you throw
 * const { salt } = await rps.commit({ matchId, move: read.suggestedCounter ?? Move.Rock });
 * await rps.reveal({ matchId, move: Move.Rock, salt });
 * ```
 */
export class Foreseen {
  readonly network: NetworkName;
  readonly chain: Chain;
  readonly core: Address;
  readonly stats: Address;
  readonly account?: Account;

  private readonly pub: PublicClient;
  private readonly wallet?: WalletClient;

  constructor(opts: ForeseenOptions = {}) {
    this.network = opts.network ?? "celo";
    this.chain = CHAINS[this.network];
    const rpcUrl = opts.rpcUrl ?? DEFAULT_RPC[this.network];
    const dep = DEPLOYMENTS[this.network];
    this.core = opts.coreAddress ?? dep.core;
    this.stats = opts.statsAddress ?? dep.stats;

    this.pub = createPublicClient({ chain: this.chain, transport: http(rpcUrl) });

    if (opts.privateKey) {
      const pk = (opts.privateKey.startsWith("0x") ? opts.privateKey : `0x${opts.privateKey}`) as Hex;
      this.account = privateKeyToAccount(pk);
      this.wallet = createWalletClient({ account: this.account, chain: this.chain, transport: http(rpcUrl) });
    }
  }

  /** Connected player address, or undefined for a read-only client. */
  get address(): Address | undefined {
    return this.account?.address;
  }

  private requireAccount(): Account {
    if (!this.account || !this.wallet) {
      throw new Error("This action needs a signer. Construct Foreseen with a privateKey.");
    }
    return this.account;
  }

  private async readCore<T>(fn: string, args: unknown[] = []): Promise<T> {
    return this.pub.readContract({ address: this.core, abi: rpsCoreAbi, functionName: fn as never, args: args as never }) as Promise<T>;
  }

  private async writeCore(fn: string, args: unknown[], value?: bigint): Promise<Hex> {
    const account = this.requireAccount();
    const hash = await this.wallet!.writeContract({
      address: this.core,
      abi: rpsCoreAbi,
      functionName: fn as never,
      args: args as never,
      value,
      account,
      chain: this.chain,
    });
    await this.pub.waitForTransactionReceipt({ hash });
    return hash;
  }

  // ---- Matchmaking -------------------------------------------------------

  /** Open a match and escrow your bet. Returns the new match id. */
  async createMatch(p: { mode: ModeName | Mode; bet: string | bigint }): Promise<{ matchId: bigint; txHash: Hex }> {
    const account = this.requireAccount();
    const value = typeof p.bet === "bigint" ? p.bet : parseEther(p.bet);
    const hash = await this.wallet!.writeContract({
      address: this.core,
      abi: rpsCoreAbi,
      functionName: "createMatch",
      args: [modeToEnum(p.mode)],
      value,
      account,
      chain: this.chain,
    });
    const receipt = await this.pub.waitForTransactionReceipt({ hash });
    const logs = parseEventLogs({ abi: rpsCoreAbi, eventName: "MatchCreated", logs: receipt.logs });
    const matchId = logs[0]?.args.matchId;
    if (matchId === undefined) throw new Error("createMatch: MatchCreated event not found in receipt");
    return { matchId, txHash: hash };
  }

  /** Join an open match, matching its bet (read automatically if not given). */
  async joinMatch(p: { matchId: bigint; bet?: string | bigint }): Promise<{ txHash: Hex }> {
    let value: bigint;
    if (p.bet === undefined) {
      const m = await this.getMatch(p.matchId);
      value = m.bet;
    } else {
      value = typeof p.bet === "bigint" ? p.bet : parseEther(p.bet);
    }
    const txHash = await this.writeCore("joinMatch", [p.matchId], value);
    return { txHash };
  }

  // ---- Gameplay (commit-reveal) -----------------------------------------

  /** Seal a move. Generates a salt if you don't pass one — KEEP IT to reveal. */
  async commit(p: { matchId: bigint; move: Move; salt?: Hex }): Promise<{ salt: Hex; commit: Hex; txHash: Hex }> {
    const account = this.requireAccount();
    if (p.move === Move.None) throw new Error("commit: move must be Rock, Paper or Scissors");
    const salt = p.salt ?? randomSalt();
    const commit = computeCommit(account.address, p.move, salt);
    const txHash = await this.writeCore("commitMove", [p.matchId, commit]);
    return { salt, commit, txHash };
  }

  /** Reveal your move + salt. The second reveal settles the match. */
  async reveal(p: { matchId: bigint; move: Move; salt: Hex }): Promise<{ txHash: Hex }> {
    const txHash = await this.writeCore("reveal", [p.matchId, p.move, p.salt]);
    return { txHash };
  }

  /** Finalize a match whose opponent let the commit or reveal window lapse. */
  async claimTimeout(p: { matchId: bigint }): Promise<{ txHash: Hex }> {
    const m = await this.getMatch(p.matchId);
    if (m.state === MatchState.Scouting) {
      return { txHash: await this.writeCore("claimCommitTimeout", [p.matchId]) };
    }
    if (m.state === MatchState.Revealing) {
      return { txHash: await this.writeCore("claimRevealTimeout", [p.matchId]) };
    }
    throw new Error(`claimTimeout: match not in a timeout-claimable state (state=${MatchState[m.state]})`);
  }

  /** Cancel your own still-open match and reclaim the bet. */
  async cancelMatch(p: { matchId: bigint }): Promise<{ txHash: Hex }> {
    return { txHash: await this.writeCore("cancelMatch", [p.matchId]) };
  }

  /** Withdraw winnings, refunds and (for the treasury) fees. */
  async withdraw(): Promise<{ txHash: Hex } | null> {
    const account = this.requireAccount();
    const pending = await this.pendingWithdrawals(account.address);
    if (pending === 0n) return null;
    return { txHash: await this.writeCore("withdraw", []) };
  }

  // ---- Reads -------------------------------------------------------------

  async nextMatchId(): Promise<bigint> {
    return this.readCore<bigint>("nextMatchId");
  }

  async pendingWithdrawals(address?: Address): Promise<bigint> {
    const a = address ?? this.address;
    if (!a) throw new Error("pendingWithdrawals: pass an address or use a client with a key");
    return this.readCore<bigint>("pendingWithdrawals", [a]);
  }

  async getMatch(matchId: bigint): Promise<MatchView> {
    const m = await this.readCore<{
      playerA: Address; bet: bigint; playerB: Address;
      commitDeadline: number | bigint; revealDeadline: number | bigint;
      mode: number; state: number; commitA: Hex; commitB: Hex; revealA: number; revealB: number;
    }>("getMatch", [matchId]);
    return {
      id: matchId,
      playerA: m.playerA,
      playerB: m.playerB,
      bet: m.bet,
      mode: Number(m.mode) as Mode,
      state: Number(m.state) as MatchState,
      commitDeadline: Number(m.commitDeadline),
      revealDeadline: Number(m.revealDeadline),
      commitA: m.commitA,
      commitB: m.commitB,
      revealA: Number(m.revealA) as Move,
      revealB: Number(m.revealB) as Move,
    };
  }

  /** Open matches (WaitingForOpponent), newest first. Optionally exclude an address. */
  async getOpenMatches(opts: { limit?: number; excludePlayer?: Address } = {}): Promise<MatchView[]> {
    const next = await this.nextMatchId();
    const out: MatchView[] = [];
    const exclude = opts.excludePlayer ? getAddress(opts.excludePlayer) : undefined;
    for (let id = next - 1n; id >= 0n; id--) {
      const m = await this.getMatch(id);
      if (m.state !== MatchState.WaitingForOpponent) continue;
      if (exclude && getAddress(m.playerA) === exclude) continue;
      out.push(m);
      if (opts.limit && out.length >= opts.limit) break;
    }
    return out;
  }

  // ---- Scouting / stats --------------------------------------------------

  async getPlayerStats(address: Address): Promise<PlayerStats> {
    const s = await this.pub.readContract({
      address: this.stats,
      abi: rpsStatsAbi,
      functionName: "getStats",
      args: [address],
    }) as {
      totalMatches: bigint; wins: bigint; losses: bigint; draws: bigint;
      moveCount: readonly bigint[]; afterWinMove: readonly bigint[];
      afterLossMove: readonly bigint[]; afterDrawMove: readonly bigint[];
      lastResult: number; hasHistory: boolean;
    };
    const trip = (a: readonly bigint[]): [bigint, bigint, bigint] => [a[0] ?? 0n, a[1] ?? 0n, a[2] ?? 0n];
    return {
      totalMatches: s.totalMatches,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      moveCount: trip(s.moveCount),
      afterWinMove: trip(s.afterWinMove),
      afterLossMove: trip(s.afterLossMove),
      afterDrawMove: trip(s.afterDrawMove),
      lastResult: Number(s.lastResult),
      hasHistory: s.hasHistory,
    };
  }

  /** Full scouting read for an address: distribution, tells, suggested counter. */
  async analyzeOpponent(address: Address): Promise<OpponentRead> {
    const stats = await this.getPlayerStats(address);
    return analyze(address, stats);
  }

  /** Win rate in basis points (0..10000), straight from the contract. */
  async winRateBps(address: Address): Promise<bigint> {
    return this.pub.readContract({
      address: this.stats,
      abi: rpsStatsAbi,
      functionName: "winRateBps",
      args: [address],
    }) as Promise<bigint>;
  }
}
