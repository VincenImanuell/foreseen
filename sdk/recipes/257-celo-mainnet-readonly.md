# CELO Mainnet Read-only Checks

Use read-only checks when validating production data during a campaign window.

Guidance:

- Use public clients for scouting, match feeds, and player stats before introducing a signer.
- Treat native CELO stakes as real value and keep test instructions on Celo Sepolia.
- Compare frontend network labels ("CELO mainnet") with SDK network names ("celo", chainId 42220) before documenting results.
- Verify `window.ethereum.isMiniPay` detection path works in MiniPay for CELO read-only flows.
- Do not trigger settlement, joins, reveals, or withdrawals just to create activity.
- Link to examples that explain the read path without asking for private keys.
