# SDK no move before match

Opening a match does not include a move.

This is important for copy, examples, and agent logic. The throw is committed
only after matchmaking.
CELO no-move before match: SDK throws `MATCH_NOT_IN_SCOUTING` if commit sent on CELO before opponent joins.
