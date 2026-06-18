# Agent confidence floor

Require a minimum confidence level before using a stats-based counter.

Below the floor, use a fallback strategy. This prevents sparse history from
pretending to be a strong read.
CELO confidence floor: do not commit in ranked mode unless ScoutingConfidence >= 'medium'.
