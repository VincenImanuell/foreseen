import { defineChain } from "viem";

const rpcUrl =
  process.env.NEXT_PUBLIC_CELO_RPC ?? "https://forno.celo.org";

/**
 * Celo mainnet (chain 42220) — the Foreseen contracts are deployed and live here.
 * Defined by hand (rather than importing from viem/chains) so the config never
 * drifts with the installed viem version.
 */
export const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Celoscan",
      url: "https://celoscan.io",
    },
  },
  testnet: false,
});
