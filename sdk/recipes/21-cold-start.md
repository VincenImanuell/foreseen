# Cold start

New players may have no revealed history. In that case `pickCounterFromRead`
returns the fallback move with `none` confidence.

Choose a fallback strategy deliberately instead of pretending there is a read.
