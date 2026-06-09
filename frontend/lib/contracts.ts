import type { Address } from "viem";
import { rpsCoreAbi } from "./abi";

/**
 * RPSCore — the live, verified match engine on Celo Sepolia.
 * Override via NEXT_PUBLIC_RPS_CORE_ADDRESS if you redeploy.
 */
export const RPS_CORE_ADDRESS = (process.env.NEXT_PUBLIC_RPS_CORE_ADDRESS ??
  "0x208f098639059dF8E19a4F6836908b3cc56CdFf9") as Address;

export const rpsCore = {
  address: RPS_CORE_ADDRESS,
  abi: rpsCoreAbi,
} as const;

export { rpsCoreAbi };
