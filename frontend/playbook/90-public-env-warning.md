# Public Env Warning

Warn maintainers that `NEXT_PUBLIC_` values ship to the browser.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Do not place tokens, deployer keys, or private RPC secrets in public env examples.
- Verify env docs use placeholder addresses and public endpoints only.
- Leave secrets, generated builds, and local caches out of Git.
