# Package Files Check

Check package files so frontend consumers receive docs, examples, and built output.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not publish local caches, env files, or generated app builds.
- Run a dry-pack inspection before changing the `files` allowlist.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO package-files-check: ensure `sdk/dist/` is in `files` array — prevents missing CELO types on npm install.
