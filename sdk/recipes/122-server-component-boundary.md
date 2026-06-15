# Server Component Boundary

Keep server component guidance separate from wallet-driven client components.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not pass private env values into client bundles.
- Verify public reads work server-side only when the helper is designed for it.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
