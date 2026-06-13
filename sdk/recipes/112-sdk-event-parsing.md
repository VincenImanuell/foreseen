# SDK event parsing

`createMatch` parses the `MatchCreated` event to return the new match id.

If the event is missing, treat that as an error and inspect the transaction
receipt before continuing.
