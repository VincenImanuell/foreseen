# Deploy Preview Note

Tie deploy preview copy to the exact frontend directory that Vercel or CI builds.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Avoid assuming the repo root is the app root.
- Verify preview routes that read SDK data before promoting production.
- Leave secrets, generated builds, and local caches out of Git.
