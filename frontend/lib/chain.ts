import { defineChain } from "viem";

export type CeloNetwork = "mainnet" | "sepolia";

export const celoNetwork: CeloNetwork =
  process.env.NEXT_PUBLIC_CELO_NETWORK === "sepolia" ? "sepolia" : "mainnet";

const celoMainnetRpcUrl =
  process.env.NEXT_PUBLIC_CELO_RPC ?? "https://forno.celo.org";

const celoSepoliaRpcUrl =
  process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC ??
  "https://forno.celo-sepolia.celo-testnet.org";

/**
 * Celo mainnet (chain 42220) — the Foreseen contracts are deployed and live here.
 * Defined by hand (rather than importing from viem/chains) so the config never
 * drifts with the installed viem version.
 */
export const celoMainnet = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [celoMainnetRpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Celoscan",
      url: "https://celoscan.io",
    },
  },
  testnet: false,
});

export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [celoSepoliaRpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Celoscan",
      url: "https://sepolia.celoscan.io",
    },
  },
  testnet: true,
});

export const celo = celoNetwork === "sepolia" ? celoSepolia : celoMainnet;

export const CELO_NETWORK_LABEL =
  celoNetwork === "sepolia" ? "Celo Sepolia" : "Celo mainnet";

export const CELO_NETWORK_SHORT_LABEL =
  celoNetwork === "sepolia" ? "Sepolia" : "Celo";
