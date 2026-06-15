# Npm Audit Response

Respond to npm audit findings with scoped package and frontend checks.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not bump major frontend dependencies without migration review.
- Record whether a fix affects runtime, dev tooling, or release automation.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
