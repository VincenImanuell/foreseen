import type { Address } from "viem";
import { rpsCoreAbi, rpsStatsAbi } from "./abi";
import { celoNetwork } from "./chain";

const DEFAULT_RPS_CORE_ADDRESS =
  celoNetwork === "sepolia"
    ? "0x208f098639059dF8E19a4F6836908b3cc56CdFf9"
    : "0x4DFc92FF97378D0F5E82d44EB968cb7793C5b90e";

const DEFAULT_RPS_STATS_ADDRESS =
  celoNetwork === "sepolia"
    ? "0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7"
    : "0x0f5F94A4f5C72CAc4D6E69a6DD89341c7b1a475A";

/**
 * RPSCore v2 — the live, matchmaking-first match engine.
 * Override via NEXT_PUBLIC_RPS_CORE_ADDRESS if you redeploy.
 */
export const RPS_CORE_ADDRESS = (process.env.NEXT_PUBLIC_RPS_CORE_ADDRESS ??
  DEFAULT_RPS_CORE_ADDRESS) as Address;

/** RPSStats — tamper-proof on-chain behavioral profile used for scouting. */
export const RPS_STATS_ADDRESS = (process.env.NEXT_PUBLIC_RPS_STATS_ADDRESS ??
  DEFAULT_RPS_STATS_ADDRESS) as Address;

/**
 * The frontend reads RPSCore/RPSStats. Mainnet also lists the full v2 system for
 * transparency; Sepolia only lists the contracts used by the MiniPay test build.
 */
export const CELO_CONTRACTS: { name: string; address: Address }[] = [
  { name: "RPSCore", address: RPS_CORE_ADDRESS },
  { name: "RPSStats", address: RPS_STATS_ADDRESS },
  ...(celoNetwork === "mainnet"
    ? [
        {
          name: "RPSRanked",
          address: "0x8230D28C9a8Fbda2490F830c6cBc1cE3056096cb" as Address,
        },
        {
          name: "RPSSoulbound",
          address: "0x0bF75Da1E76df7c7619d1Beb738DD34b96EDd8b6" as Address,
        },
        {
          name: "RPSTreasury",
          address: "0xFF81B19dE799e828f3b76bC3240896Fa73d22540" as Address,
        },
      ]
    : []),
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
