# Agent ranked opt-in

Agents should not play ranked mode by default.

Ranked play affects identity and progression, so require an explicit config flag
before an automated wallet joins ranked matches.
CELO ranked opt-in: pass `mode: 'ranked'` only when the bot wallet has sufficient CELO for streak risk.
