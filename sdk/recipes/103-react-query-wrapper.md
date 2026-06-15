# React Query Wrapper

Wrap SDK reads in frontend query helpers when routes need cache and loading control.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not put wallet transactions inside read-only query wrappers.
- Check stale time and retry behavior against on-chain read latency.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
