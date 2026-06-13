# SDK side effects

The package declares `sideEffects: false`.

Keep exported modules pure at import time. Network calls should happen only when
users create clients or call methods.
