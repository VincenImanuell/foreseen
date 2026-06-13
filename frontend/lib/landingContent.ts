export const TRUST_SIGNALS = [
  ["No RNG", "Every result comes from player choices, not random numbers."],
  ["No house", "The contract referees peer-to-peer CELO stakes."],
  ["On-chain reads", "Scouting data is public, permanent, and verifiable."],
] as const;

export const BUILDER_POINTS = [
  "Install @foreseen/sdk for TypeScript clients, bots, and dashboards.",
  "Use read-only scouting flows without exposing wallet secrets.",
  "Build join-only agents that play real users instead of fake loops.",
] as const;

export const SAFETY_NOTES = [
  "Stake only what you can afford to lose.",
  "Keep commit salts and private keys out of source control.",
  "Use Celo Sepolia before testing funded strategies.",
] as const;

export const ARENA_INSIGHTS = [
  ["Scout", "Read the opponent before choosing a move."],
  ["Seal", "Commit the hash so the throw stays hidden."],
  ["Reveal", "Open the salt in time to settle fairly."],
] as const;
