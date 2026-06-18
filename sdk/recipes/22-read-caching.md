# Read caching

Scouting reads can be cached for short intervals in dashboards:

- Cache by player address and network.
- Invalidate after a match settles.
- Do not cache private key or salt data.

Cache CELO reads with a short TTL (30s) — RPSStats updates after each reveal.
