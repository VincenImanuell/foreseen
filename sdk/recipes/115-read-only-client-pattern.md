# Read Only Client Pattern

Use a read-only client pattern for public frontend routes.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not request wallet connection for package reads that only need a public client.
- Check the route in a clean browser profile without an injected wallet.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
