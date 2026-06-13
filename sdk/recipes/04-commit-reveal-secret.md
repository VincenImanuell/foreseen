# Commit-reveal secret handling

`commit` returns the salt needed for reveal:

```ts
const { salt } = await rps.commit({ matchId, move });
await rps.reveal({ matchId, move, salt });
```

Persist the salt outside source control. If the salt is lost, the player cannot
reveal from that commitment.
