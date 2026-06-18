/**
 * Hand-written ABI subset for the deployed Foreseen v2 contracts on CELO mainnet
 * and Celo Sepolia — only the functions/events the SDK uses.
 * Signatures match RPSCore.sol / RPSStats.sol. Verify on Celoscan for CELO mainnet.
 */
export const rpsCoreAbi = [
  { type: "function", name: "createMatch", stateMutability: "payable", inputs: [{ name: "mode", type: "uint8" }], outputs: [{ name: "matchId", type: "uint256" }] },
  { type: "function", name: "joinMatch", stateMutability: "payable", inputs: [{ name: "matchId", type: "uint256" }], outputs: [] },
  { type: "function", name: "commitMove", stateMutability: "nonpayable", inputs: [{ name: "matchId", type: "uint256" }, { name: "commit", type: "bytes32" }], outputs: [] },
  { type: "function", name: "reveal", stateMutability: "nonpayable", inputs: [{ name: "matchId", type: "uint256" }, { name: "move", type: "uint8" }, { name: "salt", type: "bytes32" }], outputs: [] },
  { type: "function", name: "claimCommitTimeout", stateMutability: "nonpayable", inputs: [{ name: "matchId", type: "uint256" }], outputs: [] },
  { type: "function", name: "claimRevealTimeout", stateMutability: "nonpayable", inputs: [{ name: "matchId", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancelMatch", stateMutability: "nonpayable", inputs: [{ name: "matchId", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    type: "function", name: "getMatch", stateMutability: "view",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [{
      name: "", type: "tuple", components: [
        { name: "playerA", type: "address" },
        { name: "bet", type: "uint96" },
        { name: "playerB", type: "address" },
        { name: "commitDeadline", type: "uint40" },
        { name: "revealDeadline", type: "uint40" },
        { name: "mode", type: "uint8" },
        { name: "state", type: "uint8" },
        { name: "commitA", type: "bytes32" },
        { name: "commitB", type: "bytes32" },
        { name: "revealA", type: "uint8" },
        { name: "revealB", type: "uint8" },
      ],
    }],
  },
  { type: "function", name: "nextMatchId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "pendingWithdrawals", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "event", name: "MatchCreated",
    inputs: [
      { name: "matchId", type: "uint256", indexed: true },
      { name: "playerA", type: "address", indexed: true },
      { name: "mode", type: "uint8", indexed: false },
      { name: "bet", type: "uint256", indexed: false },
      { name: "createdAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "Settled",
    inputs: [
      { name: "matchId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "payout", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
      { name: "moveA", type: "uint8", indexed: false },
      { name: "moveB", type: "uint8", indexed: false },
    ],
  },
] as const;

export const rpsStatsAbi = [
  {
    type: "function", name: "getStats", stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{
      name: "", type: "tuple", components: [
        { name: "totalMatches", type: "uint64" },
        { name: "wins", type: "uint64" },
        { name: "losses", type: "uint64" },
        { name: "draws", type: "uint64" },
        { name: "moveCount", type: "uint64[3]" },
        { name: "afterWinMove", type: "uint64[3]" },
        { name: "afterLossMove", type: "uint64[3]" },
        { name: "afterDrawMove", type: "uint64[3]" },
        { name: "lastResult", type: "uint8" },
        { name: "hasHistory", type: "bool" },
      ],
    }],
  },
  { type: "function", name: "moveDistribution", stateMutability: "view", inputs: [{ name: "player", type: "address" }], outputs: [{ name: "", type: "uint64[3]" }] },
  { type: "function", name: "winRateBps", stateMutability: "view", inputs: [{ name: "player", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;
