import { Foreseen, describeRead } from "@foreseen/sdk";

const addresses = process.argv.slice(2) as `0x${string}`[];
if (addresses.length === 0) {
  throw new Error("Usage: tsx examples/read-only-dashboard.ts 0xPlayer [0xPlayer...]");
}

const rps = new Foreseen({ network: "celo" });

for (const address of addresses) {
  const read = await rps.analyzeOpponent(address);
  console.log(`\n## ${address}`);
  console.log(describeRead(read).join("\n"));
}
