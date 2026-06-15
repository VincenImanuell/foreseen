# Tree Shaking Check

Keep tree-shaking notes close to package exports that frontends consume.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Avoid side-effectful top-level examples in docs.
- Verify package metadata still marks the SDK as side-effect free.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
