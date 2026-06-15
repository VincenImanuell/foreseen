# Typed Action Results

Expose typed action results so frontends can render states without string guessing.

Checklist:

- Show the npm package name as `@foreseen/sdk`.
- Do not overload errors, pending states, and settled results into one message.
- Verify discriminated unions still compile in consumer examples.
- Keep the recipe compatible with a Next.js frontend and a plain npm install.
