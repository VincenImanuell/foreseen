# Npm Token Hygiene

Keep npm token hygiene visible in maintainer release recipes.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not paste tokens into docs, commits, issue comments, or terminal transcripts that will be shared.
- Verify revoked tokens are replaced before the next release attempt.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
