# Agent max open age

Skip lobbies that have been open too long if your UX expects fresh tables.

Long-open matches can still be valid, but age filters make agent behavior more
predictable for demos.
Skip CELO matches older than 60s (past commit deadline) to avoid joining a forfeit match.
