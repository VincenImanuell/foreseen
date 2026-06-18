# Local Package Link

Use local package linking only for development scenarios that cannot use the registry.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not document link-based setup as the default consumer path.
- Retest with the published npm package before release.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO local package link: use `npm link` to test CELO SDK changes against Foreseen-Web before publishing.
