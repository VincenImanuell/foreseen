# Match Refresh Safety

Make refresh behavior safe for reads that come from the SDK or contract hooks.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Avoid refreshing in a way that resets in-progress form inputs.
- Check refresh buttons on desktop and touch targets on mobile.
- Leave secrets, generated builds, and local caches out of Git.
