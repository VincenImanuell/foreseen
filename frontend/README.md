# Foreseen — Frontend

Playable on-chain Rock Paper Scissors on Celo. Built with Next.js App Router,
wagmi, and viem. The app defaults to the live Celo mainnet deployment, and can be
switched to Celo Sepolia for MiniPay test-mode review.

## What you can do

- Connect any injected wallet, including MiniPay
- Open a match and stake CELO
- Join an open lobby by matching the bet
- Scout your opponent's on-chain history before committing
- Reveal your move; the contract settles automatically
- Withdraw winnings, draw refunds, and cancelled bets

> Commit-reveal: your move is sent as `keccak256(address, move, salt)`. The salt
> is stored in your browser's `localStorage`; reveal from the same browser before
> the reveal window closes.

## MiniPay Compatibility

Foreseen detects `window.ethereum.isMiniPay`, auto-connects the injected MiniPay
wallet, and hides the manual Connect Wallet / Disconnect controls inside MiniPay
because the wallet session is implicit.

MiniPay is supported on Celo mainnet and Celo Sepolia. For hackathon review, use
Sepolia by setting:

```bash
NEXT_PUBLIC_CELO_NETWORK=sepolia
```

The frontend then uses the built-in Sepolia RPSCore/RPSStats defaults:

| Contract | Celo Sepolia |
| --- | --- |
| RPSCore | `0x208f098639059dF8E19a4F6836908b3cc56CdFf9` |
| RPSStats | `0x6F57AC8C61A2ed3C84446Ca6e5a1Ab68f10Dd7C7` |

The current game contracts escrow native CELO stakes. MiniPay supports stablecoin
wallet UX and fee abstraction, but this deployed Foreseen contract version is a
native CELO stake game.

## Run Locally

Requires Node 18+.

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Test in MiniPay

MiniPay testing requires a physical Android or iOS device; Android Studio
emulators are not supported.

1. Install MiniPay.
2. In MiniPay Settings, tap the version number repeatedly to enable Developer Mode.
3. Open Developer Settings.
4. Enable Developer Mode.
5. Toggle Use Testnet when testing a Sepolia build.
6. Start the Next.js dev server.
7. Expose it with ngrok:

```bash
ngrok http 3000
```

8. In MiniPay Developer Settings, choose Load Test Page and enter the ngrok URL.

## Deploy to Vercel

1. Import the GitHub repo on Vercel.
2. Set Root Directory to `frontend`.
3. Keep `NEXT_PUBLIC_CELO_NETWORK=mainnet` for the live site.
4. For a MiniPay test deployment, set `NEXT_PUBLIC_CELO_NETWORK=sepolia`.
5. Leave contract override env vars unset unless you redeploy contracts.

## Configuration

All env vars are public.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CELO_NETWORK` | `mainnet` | `mainnet` or `sepolia` |
| `NEXT_PUBLIC_CELO_RPC` | `https://forno.celo.org` | Mainnet RPC |
| `NEXT_PUBLIC_CELO_SEPOLIA_RPC` | `https://forno.celo-sepolia.celo-testnet.org` | Sepolia RPC |
| `NEXT_PUBLIC_RPS_CORE_ADDRESS` | network default | Optional RPSCore override |
| `NEXT_PUBLIC_RPS_STATS_ADDRESS` | network default | Optional RPSStats override |
