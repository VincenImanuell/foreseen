// Main CELO client — supports both read-only (no privateKey) and write modes.
export { Foreseen } from "./client.js";
export type { ForeseenOptions } from "./client.js";

export * from "./types.js";

export { randomSalt, computeCommit, resultOf, counter } from "./crypto.js";
export { analyze, distributionPct, dominantMove } from "./scout.js";
export {
  confidenceFromRead,
  describeRead,
  formatAdvice,
  formatMove,
  moveName,
  pickCounterFromRead,
} from "./strategy.js";
export type { ScoutingConfidence, StrategyAdvice } from "./strategy.js";

export { CHAINS, DEFAULT_RPC, celo, celoSepolia } from "./chains.js";
export type { NetworkName } from "./chains.js";

export { DEPLOYMENTS } from "./addresses.js";
export type { Deployment } from "./addresses.js";

export { rpsCoreAbi, rpsStatsAbi } from "./abi.js";

// The bot module is also importable on its own at "@foreseen/sdk/bot".
export { ForeseenBot, strategies } from "./bot.js";
export type { Strategy, StrategyName, BotContext, Outcome, ForeseenBotOptions } from "./bot.js";
