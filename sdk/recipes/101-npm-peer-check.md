# Npm Peer Check

Check peer dependency expectations before documenting a frontend integration.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Call out `viem` compatibility without pinning consumers to unrelated frontend packages.
- Run the SDK typecheck after peer range edits.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
