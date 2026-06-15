# Sdk Version Banner

Surface the installed SDK version in builder-facing copy when the frontend depends on published package behavior.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Avoid hard-coding a stale version in user-facing gameplay panels.
- Confirm `@foreseen/sdk` remains the dependency that wallet-free reads import from.
- Leave secrets, generated builds, and local caches out of Git.
