# Viem Peer Guidance

Give frontend consumers clear guidance for the SDK's viem peer dependency.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not pin a newer viem range without checking wagmi compatibility.
- Run package tests and frontend TypeScript after peer changes.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
