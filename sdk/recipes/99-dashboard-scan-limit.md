# Dashboard scan limit

Use a bounded match scan for public pages.

Large scans can be slow on public RPCs. Start with small limits and offer
manual refresh.
CELO scan limit: cap `getOpenMatches({ limit: 20 })` to avoid slow CELO RPC calls on large match sets.
