# Read-only scouting

Use a keyless client for dashboards, profile pages, and AI summaries:

```ts
import { Foreseen, describeRead } from "@foreseen/sdk";

const rps = new Foreseen({ network: "celo" });
const read = await rps.analyzeOpponent("0xOpponent...");
console.log(describeRead(read).join("\n"));
```

Read-only clients cannot submit transactions, which keeps public dashboards safe.

Reads query `RPSStats` on CELO mainnet with no wallet or gas required.
