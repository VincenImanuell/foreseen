/**
 * Print Celoscan links for Foreseen contract addresses on CELO mainnet.
 *
 *   tsx examples/celoscan-lookup.ts
 *
 * Useful for verifying deployments or sharing contract links.
 */
import { DEPLOYMENTS } from "@foreseen/sdk/addresses";

const { core, stats } = DEPLOYMENTS["celo"];

console.log("Foreseen contracts on CELO mainnet:");
console.log(`  RPSCore  : https://celoscan.io/address/${core}`);
console.log(`  RPSStats : https://celoscan.io/address/${stats}`);
