# Provenance Fallback

Document a fallback release path when npm provenance is unavailable locally.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not store tokens or OTP values in the repository.
- Verify the published package after any manual release.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
