# Match ownership

Check whether the bot is player A or player B before deciding which address to
scout. `ForeseenBot` handles this internally in `playMatch`.

Custom agents should make the same distinction.
CELO match ownership: `isA` checks if `account.address === playerA` — always normalize with `getAddress`.
