# Foreseen — Frontend

Playable on-chain Rock Paper Scissors on **Celo Sepolia**. Built with Next.js
(App Router), wagmi + viem. Connects to the live, verified `RPSCore` contract —
no backend, no database, no API keys.

## What you can do

- Connect any injected wallet (MetaMask, **MiniPay**, Rabby, …)
- Open a match: pick a move in secret (commit) and stake CELO
- Join an open lobby by matching the bet
- Reveal your move; the contract settles automatically and pays the winner
- Claim the pot if an opponent fails to reveal in time
- Withdraw winnings, draw refunds and cancelled bets (pull-payment)

> Commit-reveal: your move is sent as `keccak256(address, move, salt)`. The salt
> is stored in your browser's `localStorage` — you need it to reveal, so reveal
> from the same browser (or copy the salt) before the 5-minute window closes.

## Run locally

Requires Node 18+.

```bash
cd frontend
cp .env.example .env.local      # optional — defaults already point at the live contract
npm install                     # or: pnpm install
npm run dev
```

Open http://localhost:3000.

You'll need a wallet on **Celo Sepolia** (chain id `11142220`) with some test
CELO. Grab free test CELO from a Celo Sepolia faucet, add the network to your
wallet (the app will prompt to switch), and play. To play a full match end-to-end
yourself, open a match in one wallet and join from a second wallet/browser.

## Deploy to Vercel (free, no card)

1. Push this repo to GitHub (already done for Foreseen).
2. On vercel.com → **Add New → Project → Import** your GitHub repo.
3. Set **Root Directory** to `frontend` (important — the repo is a monorepo).
4. Framework preset auto-detects **Next.js**. Leave build/output defaults.
5. (Optional) add env vars from `.env.example` if you want to override the
   contract address or RPC. The defaults work without any.
6. Deploy. Every push to `main` redeploys automatically.

## Configuration

All env vars are public (no secrets):

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_RPS_CORE_ADDRESS` | `0x208f098639059dF8E19a4F6836908b3cc56CdFf9` | RPSCore on Celo Sepolia |
| `NEXT_PUBLIC_CELO_SEPOLIA_RPC` | `https://forno.celo-sepolia.celo-testnet.org` | Public RPC |

## Notes

- Testnet only. No real funds. (Per project policy: never mainnet.)
- The contract address above is the integrated v1 (RPSCore + RPSStats). If you
  redeploy the full 5-contract system, update `NEXT_PUBLIC_RPS_CORE_ADDRESS`.
