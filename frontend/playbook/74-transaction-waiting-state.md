# Transaction Waiting State

Keep transaction waiting states distinct from npm build or SDK read loading states.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Do not show a success CTA while a wallet signature is pending.
- Check the state after wallet approval, rejection, and RPC delay.
- Leave secrets, generated builds, and local caches out of Git.
