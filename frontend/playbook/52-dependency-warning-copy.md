# Dependency Warning Copy

Turn dependency warnings into actionable frontend maintenance notes instead of alarming player copy.

Checklist:

- Keep the note tied to the Foreseen game frontend and the active Celo network.
- Name the package family only when the warning changes a real UI or build path.
- Run the frontend build after dependency bumps that touch Next, wagmi, viem, or Tailwind.
- Leave secrets, generated builds, and local caches out of Git.
