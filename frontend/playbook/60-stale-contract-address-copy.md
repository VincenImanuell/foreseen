# Stale Contract Address Copy

Give maintainers a clear warning path when frontend contract addresses drift from deployments.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Keep stale-address language out of ordinary player success states.
- Compare frontend env defaults with deployment JSON before release.
- Leave secrets, generated builds, and local caches out of Git.
