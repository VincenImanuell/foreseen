/**
 * Scout an opponent from a MiniPay-connected wallet context.
 *
 * In MiniPay, `window.ethereum.isMiniPay === true` and the wallet is
 * injected automatically — no manual connect step. This example shows
 * how to initialize a read-only Foreseen SDK client for CELO mainnet
 * and analyze an opponent, exactly as the Foreseen-Web frontend does.
 *
 *   tsx examples/minipay-scout.ts 0xOpponentAddress
 */
import { Foreseen, describeRead } from "@foreseen/sdk";
import type { Address } from "viem";

const target = process.argv[2] as Address | undefined;
if (!target) {
  console.error("usage: tsx examples/minipay-scout.ts <opponent-address>");
  process.exit(1);
}

// Read-only client — works from MiniPay or any CELO context.
const rps = new Foreseen({ network: "celo" });
const read = await rps.analyzeOpponent(target);

console.log(`\nMiniPay scouting report for ${target} on CELO:`);
console.log(describeRead(read).map((l) => `  ${l}`).join("\n"));
console.log(`\n  Celoscan: https://celoscan.io/address/${target}`);
