# Security Policy

Foreseen handles real value on Celo mainnet (chain `42220`). We take reports
seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Instead, use GitHub's private reporting:
**[Report a vulnerability](https://github.com/VincenImanuell/foreseen/security/advisories/new)**
(Security → Advisories → "Report a vulnerability").

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce, or a proof-of-concept / failing test.
- The affected component (contracts, SDK, or frontend) and network.

We aim to acknowledge a report within a few days and will keep you updated as we
investigate and fix. Please give us a reasonable window to ship a fix before any
public disclosure.

## Scope

In scope:

- `contracts/` — escrow, commit-reveal, settlement, withdrawal, and stats logic.
- `sdk/` — the `@foreseen/sdk` client and bot.
- `frontend/` — the dapp.

Out of scope:

- Third-party RPC endpoints, block explorers, and infrastructure we don't
  control.
- Issues that require a compromised user device or leaked private key.

## Handling secrets

- Never commit private keys, mnemonics, `.env` files, or keystores.
- Treasury and deployer keys are managed off-repo; rotate any key that is
  exposed, however briefly.
- The commit-reveal salt is a per-move blind — it is generated client-side and
  must stay secret until reveal.
