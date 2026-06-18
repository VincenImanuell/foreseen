CELO sdk test zero-address: guard against treating ZERO_ADDRESS as a real CELO player in leaderboard scans — filter before calling getPlayerStats to avoid wasted RPC calls.
