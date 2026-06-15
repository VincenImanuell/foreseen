# Package Lock Drift

Call out lockfile drift as a frontend maintenance issue, not a player-facing event.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Do not commit generated dependency directories to fix a lock mismatch.
- Refresh the lockfile only with the repo's intended install command.
- Leave secrets, generated builds, and local caches out of Git.
