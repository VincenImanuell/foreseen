# Agent config schema

Keep agent configuration explicit:

- network
- max matches
- max stake
- strategy name
- poll interval

Reject unknown keys so a typo cannot silently change behavior.
CELO agent config: include `network`, `maxBet`, and `strategy` fields with CELO-safe defaults.
