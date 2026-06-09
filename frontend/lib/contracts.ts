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

/**
 * Full v2 (matchmaking-first) system on Celo mainnet — shown in the landing footer.
 * Only RPSCore/RPSStats are read by the dapp; the rest are listed for transparency.
 */
export const CELO_MAINNET_CONTRACTS: { name: string; address: Address }[] = [
  { name: "RPSCore", address: RPS_CORE_ADDRESS },
  { name: "RPSStats", address: RPS_STATS_ADDRESS },
  { name: "RPSRanked", address: "0x8230D28C9a8Fbda2490F830c6cBc1cE3056096cb" },
  { name: "RPSSoulbound", address: "0x0bF75Da1E76df7c7619d1Beb738DD34b96EDd8b6" },
  { name: "RPSTreasury", address: "0xFF81B19dE799e828f3b76bC3240896Fa73d22540" },
];

export const rpsCore = {
  address: RPS_CORE_ADDRESS,
  abi: rpsCoreAbi,
} as const;

export const rpsStats = {
  address: RPS_STATS_ADDRESS,
  abi: rpsStatsAbi,
} as const;

export { rpsCoreAbi, rpsStatsAbi };
