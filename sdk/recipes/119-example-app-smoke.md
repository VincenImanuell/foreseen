# Example App Smoke

Smoke-test example app snippets that consume the SDK from npm.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not rely on local workspace links for published-package docs.
- Install from the registry when validating a package consumer path.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO example-app smoke: run `ts-node examples/list-open-matches.ts` against CELO mainnet 42220 as smoke test.
