# Dashboard Cache Policy

Describe cache policy for dashboards that read Foreseen data through npm package helpers.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not cache wallet action state as if it were a read-only query.
- Verify cache invalidation after match creation, reveal, and withdraw actions.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO cache policy: stale-while-revalidate 30s for CELO reads — RPSStats updates on-chain per reveal.
