import type { Address } from "viem";
import type { NetworkName } from "./chains.js";

export interface Deployment {
  core: Address;
  stats: Address;
}

/**
 * Known Foreseen v2 (matchmaking-first) deployments. Override per-call via the
 * Foreseen constructor if you redeploy.
 */
export const DEPLOYMENTS: Record<NetworkName, Deployment> = {
  celo: {
    core: "0x4DFc92FF97378D0F5E82d44EB968cb7793C5b90e",
    stats: "0x0f5F94A4f5C72CAc4D6E69a6DD89341c7b1a475A",
  },
  "celo-sepolia": {
    core: "0x208f098639059dF8E19a4F6836908b3cc56CdFf9",
    stats: "0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7",
  },
};
