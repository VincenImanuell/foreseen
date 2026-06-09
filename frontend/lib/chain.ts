import { defineChain } from "viem";

const rpcUrl =
  process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC ??
  "https://forno.celo-sepolia.celo-testnet.org";

/**
 * Celo Sepolia testnet. Alfajores was sunset in Sept 2025, so this is the live
 * Celo testnet. Defined by hand (rather than importing from viem/chains) so the
 * config never drifts with the installed viem version.
 */
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Celoscan",
      url: "https://sepolia.celoscan.io",
    },
  },
  testnet: true,
});
