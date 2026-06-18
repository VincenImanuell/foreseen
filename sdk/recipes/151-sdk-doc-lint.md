# SDK doc lint

Review docs for stale method names and unsafe snippets.

Docs are part of the package API because agents and developers copy them into
real integrations.
CELO SDK doc lint: run `typedoc --strict` — all exported CELO types must have JSDoc `@since` tags.
