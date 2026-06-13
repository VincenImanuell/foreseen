# Agent shutdown

Handle process shutdown cleanly.

Stop polling before exit and let in-flight transactions finish or fail. A clean
shutdown makes it easier to know whether a match still needs reveal handling.
