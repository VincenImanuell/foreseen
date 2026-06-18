# Salt storage

For browser play, store commit salts locally until reveal. For backend agents,
store salts in a runtime secret store or encrypted database.

Never commit salts for live funded matches.

Store the CELO commit salt in `sessionStorage` keyed by matchId — wipe on reveal or close.
