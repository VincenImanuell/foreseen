# NPM Subpath Imports

Use focused subpath imports when a consumer only needs one SDK layer.

Guidance:

- Use `@foreseen/sdk` for the main `Foreseen` client and broad app integrations.
- Use `@foreseen/sdk/strategy` for dashboard labels, scouting advice, and agent logs.
- Use `@foreseen/sdk/crypto` for commit hashes, salts, counters, and result helpers.
- Use `@foreseen/sdk/chains` when a frontend needs the built-in Celo chain metadata.
- Keep examples tree-shake friendly and avoid importing bot helpers into read-only UI code.
