# Package Consumer Upgrade

Give package consumers a frontend upgrade path after SDK releases.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not tell consumers to change contracts unless the release actually requires it.
- Verify old and new import shapes in a small app.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
