# SDK import hygiene

Use root imports for general helpers:

```ts
import { Foreseen, describeRead } from "@foreseen/sdk";
```

Reserve `@foreseen/sdk/bot` for Node or worker contexts.
