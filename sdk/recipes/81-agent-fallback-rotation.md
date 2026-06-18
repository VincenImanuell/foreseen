# Agent fallback rotation

Fallback moves should not always be the same if the wallet plays many cold-start
opponents.

Use random or rotating fallback logic when there is no scouting history.
CELO fallback rotation: cycle through multiple CELO RPC endpoints if forno is rate-limited.
