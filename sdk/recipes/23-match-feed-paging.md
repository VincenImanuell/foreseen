# Match feed paging

`getOpenMatches({ limit })` scans newest-first and stops when the limit is met.

Use a small limit for landing pages and a larger one for operator dashboards.

Page CELO matches backwards from `nextMatchId` — no event logs required.
