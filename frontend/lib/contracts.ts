import type { Address } from "viem";
import { rpsCoreAbi, rpsStatsAbi } from "./abi";

/**
 * RPSCore v2 — the live, matchmaking-first match engine on Celo mainnet.
 * Override via NEXT_PUBLIC_RPS_CORE_ADDRESS if you redeploy.
 */
export const RPS_CORE_ADDRESS = (process.env.NEXT_PUBLIC_RPS_CORE_ADDRESS ??
  "0x4DFc92FF97378D0F5E82d44EB968cb7793C5b90e") as Address;

/** RPSStats — tamper-proof on-chain behavioral profile used for scouting. */
export const RPS_STATS_ADDRESS = (process.env.NEXT_PUBLIC_RPS_STATS_ADDRESS ??
  "0x0f5F94A4f5C72CAc4D6E69a6DD89341c7b1a475A") as Address;

export const rpsCore = {
  address: RPS_CORE_ADDRESS,
  abi: rpsCoreAbi,
} as const;

export const rpsStats = {
  address: RPS_STATS_ADDRESS,
  abi: rpsStatsAbi,
} as const;

export { rpsCoreAbi, rpsStatsAbi };
