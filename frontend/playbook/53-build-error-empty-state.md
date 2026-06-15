# Build Error Empty State

Keep build failure guidance separate from empty lobby states so player-facing UI stays calm.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Do not expose raw stack traces in public route copy.
- Use local terminal output for debugging and keep committed guidance concise.
- Leave secrets, generated builds, and local caches out of Git.
