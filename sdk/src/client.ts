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
 * Constructor options for the {@link Foreseen} CELO client.
 * All fields are optional — defaults produce a read-only CELO mainnet client (chainId 42220).
 * Pass `network: "celo-sepolia"` for testnet (chainId 11142220).
 * @since 0.1.0
 */
export interface ForeseenOptions {
  /** "celo" (CELO mainnet chainId 42220, default) or "celo-sepolia" (testnet 11142220). */
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
 * Foreseen SDK client for CELO mainnet (chainId 42220) and Celo Sepolia (11142220).
 * Read methods work without a key — scout, list matches, check balances on CELO.
 * Write methods (createMatch, joinMatch, commit, reveal, withdraw …) require `privateKey`.
 *
 * ```ts
 * // CELO mainnet — read only (no privateKey)
 * const rps = new Foreseen({ network: "celo" });
 * const matches = await rps.getOpenMatches({ limit: 5 });
 *
 * // CELO mainnet — write (requires funded key)
 * const rps = new Foreseen({ network: "celo", privateKey: "0x..." });
 * const { matchId } = await rps.createMatch({ mode: "casual", bet: "0.1" });
 * const read = await rps.analyzeOpponent(opponent);   // scout CELO history before you throw
 * const { salt } = await rps.commit({ matchId, move: read.suggestedCounter ?? Move.Rock });
 * await rps.reveal({ matchId, move: Move.Rock, salt });
 * await rps.withdraw();  // claim CELO winnings
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

  /** Read-only call to CELO RPSCore contract — no private key or gas required. */
  private async readCore<T>(fn: string, args: unknown[] = []): Promise<T> {
    return this.pub.readContract({ address: this.core, abi: rpsCoreAbi, functionName: fn as never, args: args as never }) as Promise<T>;
  }

  /** Write call to CELO RPSCore — requires a funded private key and CELO gas. */
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

  /**
   * Open a CELO match and escrow the bet on-chain. Returns the new match ID.
   * @param p.mode - "casual" or "ranked" (ranked updates soulbound badge on CELO).
   * @param p.bet - Stake in decimal CELO string (e.g. "0.1") or wei bigint.
   */
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

  /**
   * Join an open CELO match, sending the exact bet amount as `msg.value`.
   * The bet is read automatically from the chain if not passed explicitly.
   * @param p.matchId - The match ID to join on CELO.
   * @param p.bet - Optional bet override (wei bigint or decimal CELO string).
   */
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

  /**
   * Seal a move on CELO mainnet by calling `RPSCore.commitMove`. Auto-generates a salt if omitted.
   * You MUST store the returned `salt` and pass it to {@link reveal} within the 90-second CELO window.
   * Losing the salt = unable to reveal = opponent can claim timeout winnings.
   * @param p.matchId - The CELO match ID to commit a move in.
   * @param p.move - Rock, Paper, or Scissors (not None).
   * @param p.salt - Optional deterministic salt; auto-generated if omitted.
   */
  async commit(p: { matchId: bigint; move: Move; salt?: Hex }): Promise<{ salt: Hex; commit: Hex; txHash: Hex }> {
    const account = this.requireAccount();
    if (p.move === Move.None) throw new Error("commit: move must be Rock, Paper or Scissors");
    const salt = p.salt ?? randomSalt();
    const commit = computeCommit(account.address, p.move, salt);
    const txHash = await this.writeCore("commitMove", [p.matchId, commit]);
    return { salt, commit, txHash };
  }

  /**
   * Reveal move + salt on CELO by calling `RPSCore.reveal`.
   * The second reveal triggers on-chain CELO settlement and releases winnings to the winner.
   * Must be called within the 90-second reveal window, or the opponent can claim timeout.
   * @param p.matchId - The CELO match ID to reveal in.
   * @param p.move - Must match the move committed in {@link commit}.
   * @param p.salt - The salt returned by {@link commit} (or the value you passed in).
   */
  async reveal(p: { matchId: bigint; move: Move; salt: Hex }): Promise<{ txHash: Hex }> {
    const txHash = await this.writeCore("reveal", [p.matchId, p.move, p.salt]);
    return { txHash };
  }

  /**
   * Finalize a CELO match whose opponent let the commit or reveal window lapse.
   * Automatically picks `claimCommitTimeout` or `claimRevealTimeout` based on state.
   * The CELO winnings become withdrawable via {@link withdraw} after settlement.
   * @param p.matchId - The CELO match ID to finalize.
   */
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

  /**
   * Cancel your CELO match before any opponent joins.
   * Returns the CELO bet stake to `pendingWithdrawals` — call {@link withdraw} to retrieve it.
   * @param p.matchId - The CELO match ID to cancel (must be in WaitingForOpponent state).
   */
  async cancelMatch(p: { matchId: bigint }): Promise<{ txHash: Hex }> {
    return { txHash: await this.writeCore("cancelMatch", [p.matchId]) };
  }

  /**
   * Withdraw pending CELO winnings or refunds from `RPSCore.withdraw`.
   * Returns `null` if `pendingWithdrawals` is zero — no gas wasted.
   * The CELO is transferred directly to the connected wallet address.
   */
  async withdraw(): Promise<{ txHash: Hex } | null> {
    const account = this.requireAccount();
    const pending = await this.pendingWithdrawals(account.address);
    if (pending === 0n) return null;
    return { txHash: await this.writeCore("withdraw", []) };
  }

  // ---- Reads -------------------------------------------------------------

  /**
   * The next unallocated CELO match ID from `RPSCore.nextMatchId`.
   * Useful for paginating backwards from the chain tip to scan recent matches.
   */
  async nextMatchId(): Promise<bigint> {
    return this.readCore<bigint>("nextMatchId");
  }

  /**
   * Claimable CELO balance in wei from `RPSCore.pendingWithdrawals`.
   * Defaults to the connected account. Call `withdraw()` to move this to the CELO wallet.
   * @param address - Optional CELO address to query; defaults to the signed-in account.
   */
  async pendingWithdrawals(address?: Address): Promise<bigint> {
    const a = address ?? this.address;
    if (!a) throw new Error("pendingWithdrawals: pass an address or use a client with a key");
    return this.readCore<bigint>("pendingWithdrawals", [a]);
  }

  /**
   * Fetch a fully-decoded CELO match by ID from `RPSCore.getMatch`.
   * Read-only — no private key required. Throws if the match ID is out of range.
   * @param matchId - The CELO match ID to fetch.
   */
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

  /**
   * Fetch a window of matches in a single multicall, decoding raw tuples into
   * {@link MatchView} objects. Failed individual slots are silently dropped.
   * No private key required.
   * @param ids - The match IDs to fetch in one round-trip.
   * @since 0.2.0
   */
  async getMatchesBatch(ids: bigint[]): Promise<MatchView[]> {
    if (ids.length === 0) return [];
    type RawMatch = {
      playerA: Address; bet: bigint; playerB: Address;
      commitDeadline: number | bigint; revealDeadline: number | bigint;
      mode: number; state: number; commitA: Hex; commitB: Hex;
      revealA: number; revealB: number;
    };
    const results = await this.pub.multicall({
      contracts: ids.map((id) => ({
        address: this.core,
        abi: rpsCoreAbi,
        functionName: "getMatch" as const,
        args: [id] as const,
      })),
    });
    return results.flatMap((res, i) => {
      if (res.status !== "success") return [];
      const m = res.result as RawMatch;
      const view: MatchView = {
        id: ids[i]!,
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
      return [view];
    });
  }

  /**
   * Scan backwards from the chain tip for open CELO matches waiting for an opponent.
   * Uses multicall batching to cut RPC round-trips — previously one call per match.
   * No private key required — reads RPSCore on CELO.
   * @param opts.limit - Max open matches to return (default: unlimited).
   * @param opts.excludePlayer - Skip matches opened by this CELO address (own matches).
   * @param opts.scanWindow - How many recent matches to look through (default: 100).
   * @param opts.batchSize - Multicall batch size per round-trip (default: 20).
   */
  async getOpenMatches(opts: {
    limit?: number;
    excludePlayer?: Address;
    scanWindow?: number;
    batchSize?: number;
  } = {}): Promise<MatchView[]> {
    const next = await this.nextMatchId();
    const scanWindow = opts.scanWindow ?? 100;
    const batchSize = opts.batchSize ?? 20;
    const exclude = opts.excludePlayer ? getAddress(opts.excludePlayer) : undefined;
    const total = Number(next < BigInt(scanWindow) ? next : BigInt(scanWindow));

    const out: MatchView[] = [];
    for (let offset = 0; offset < total; offset += batchSize) {
      const end = Math.min(offset + batchSize, total);
      const ids = Array.from({ length: end - offset }, (_, i) => next - 1n - BigInt(offset + i));
      const matches = await this.getMatchesBatch(ids);
      for (const m of matches) {
        if (m.state !== MatchState.WaitingForOpponent) continue;
        if (exclude && getAddress(m.playerA) === exclude) continue;
        out.push(m);
        if (opts.limit && out.length >= opts.limit) return out;
      }
    }
    return out;
  }

  // ---- Scouting / stats --------------------------------------------------

  /** Raw on-chain stats from RPSStats for any address. No wallet needed. */
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

  /**
   * Full CELO scouting read for an address: distribution, contextual tells,
   * and the move that counters their dominant throw.
   * Reads `RPSStats.getStats` on CELO — no private key required.
   * @param address - The CELO address of the opponent to scout.
   */
  async analyzeOpponent(address: Address): Promise<OpponentRead> {
    const stats = await this.getPlayerStats(address);
    return analyze(address, stats);
  }

  /**
   * Win rate in basis points (0..10000) from `RPSStats.winRateBps` on CELO.
   * 5000 = 50% win rate. Returns 0 for addresses with no CELO match history.
   * @param address - The CELO address to query.
   */
  async winRateBps(address: Address): Promise<bigint> {
    return this.pub.readContract({
      address: this.stats,
      abi: rpsStatsAbi,
      functionName: "winRateBps",
      args: [address],
    }) as Promise<bigint>;
  }
}
