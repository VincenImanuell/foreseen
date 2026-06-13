# Tell copy

Tells are optional because some players have sparse history:

```ts
if (read.tells.afterLoss) {
  console.log(`After losses: ${moveName(read.tells.afterLoss)}`);
}
```

Show a neutral empty state when no tell exists.
