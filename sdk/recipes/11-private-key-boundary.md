# Private key boundary

Keep private keys outside app source:

```ts
const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
```

Browser apps should use wallet connectors, not `privateKey`.
