# SDK agent CI

Agent CI should run unit tests and read-only smoke tests.

Funded transaction tests should require protected secrets and should target
Sepolia, not production mainnet.
CELO SDK agent CI: bot tests run against CELO Sepolia (chainId 44787) — never mainnet 42220 in CI.
