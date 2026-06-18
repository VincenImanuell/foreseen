# Security review

Before publishing:

- Search for `.env`, private keys, and mnemonics.
- Run tests and typecheck.
- Confirm examples use placeholders.
- Confirm package files do not include local build secrets.
CELO security review: check that no private keys or salts appear in CELO transaction calldata.
