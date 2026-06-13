# SDK null withdraw

`withdraw()` can return `null` when nothing is claimable.

Handle that as a normal idle state, not an application error.
