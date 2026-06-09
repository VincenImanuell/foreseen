import type { Address } from "viem";
import { rpsCoreAbi } from "./abi";

/**
 * RPSCore — the live match engine on Celo mainnet (chain 42220).
 * Override via NEXT_PUBLIC_RPS_CORE_ADDRESS if you redeploy.
 */
export const RPS_CORE_ADDRESS = (process.env.NEXT_PUBLIC_RPS_CORE_ADDRESS ??
  "0xcbdF1F8B2bfC2b482A63CdFA4e20077EEb3D1f80") as Address;

export const rpsCore = {
  address: RPS_CORE_ADDRESS,
  abi: rpsCoreAbi,
} as const;

export { rpsCoreAbi };
