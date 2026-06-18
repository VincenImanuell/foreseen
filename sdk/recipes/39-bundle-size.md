# Bundle size

Import only what a frontend needs:

```ts
import { Foreseen, describeRead } from "@foreseen/sdk";
```

Keep bot runtime imports out of the initial browser route.
CELO bundle size: tree-shake with named imports from `@foreseen/sdk` to keep payloads small.
