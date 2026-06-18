# Sdk Import Health

Check SDK import health in the frontend after package or export edits.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not depend on `dist` paths from application code.
- Run TypeScript from the consuming frontend after export changes.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
CELO SDK import health: `import { Foreseen } from '@foreseen/sdk'` must resolve — test in CELO context.
