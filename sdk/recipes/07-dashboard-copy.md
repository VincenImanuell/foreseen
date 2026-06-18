# Dashboard copy

Use `describeRead` to turn raw on-chain stats into concise dashboard text:

```ts
const lines = describeRead(read);
```

This keeps bot logs, admin panels, and public scouting screens consistent.

Dashboards reading CELO on-chain data should display the CELO chainId (42220) to users.
