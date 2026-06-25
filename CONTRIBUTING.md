# Contributing to Foreseen

Thanks for your interest. Foreseen is an on-chain Rock Paper Scissors mind-sport
on Celo: matchmake, scout an opponent from their on-chain history, then commit
blind. This guide covers how to get set up and how changes land.

## Repository layout

| Path | What | Toolchain |
| --- | --- | --- |
| `contracts/` | `RPSCore`, `RPSStats` and friends | Foundry (`forge`, `cast`, `anvil`) |
| `sdk/` | `@foreseen/sdk` — viem client + bot | Node + npm |
| `frontend/` | Next.js dapp | pnpm |

## Local setup

```bash
# contracts
cd contracts && forge install && forge build && forge test

# sdk
cd sdk && npm install && npm run build && npm test

# frontend
cd frontend && pnpm install && pnpm dev
```

## Networks

- **Celo mainnet** — chain id `42220` (production).
- **Celo Sepolia** — chain id `11142220` (testnet; free faucet gas, default for development).

Develop and test against Celo Sepolia. Mainnet transactions spend real CELO —
double-check before broadcasting any.

## Branches & commits

- Branch off `main` with a prefixed name: `feature/…`, `fix/…`, `docs/…`,
  `chore/…`.
- Keep each PR focused on a single concern; small PRs review faster.
- Write commit subjects in the imperative mood ("Add scouting read", not
  "Added"). Explain the *why* in the body when it isn't obvious.
- Don't commit secrets. `.env`, private keys, and deployment keystores stay out
  of git (see [SECURITY.md](SECURITY.md)).

## Before you open a PR

- [ ] `forge test` passes if you touched contracts.
- [ ] `npm test` and `npm run build` pass in `sdk/` if you touched the SDK.
- [ ] `pnpm lint` and `pnpm build` pass in `frontend/` if you touched the frontend.
- [ ] No secrets or `.env` values are staged.
- [ ] The change is limited to one concern.

The PR template will prompt you for what / why / how — fill it in.

## A note on bots and metrics

Bots that play **real players** (cold-start opponents, player-deployed agents)
are a first-class, welcome feature. Running bots against **each other** in a
funded loop to inflate volume, fees, or DAU is wash trading and will not be
accepted — it breaks Foreseen's "merit not money, provably fair" premise. Label
bot wallets `[BOT]` and never report them as organic users.
