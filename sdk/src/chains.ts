import { defineChain, type Chain } from "viem";
import { celo } from "viem/chains";

/** Celo Sepolia testnet (chain 11142220). Not yet in viem, so defined here. */
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
  },
  testnet: true,
});

/** The two supported networks: Celo mainnet and Celo Sepolia testnet. */
export type NetworkName = "celo" | "celo-sepolia";

/** Map of supported networks to their viem Chain objects. */
export const CHAINS: Record<NetworkName, Chain> = {
  celo,
  "celo-sepolia": celoSepolia,
};

export const DEFAULT_RPC: Record<NetworkName, string> = {
  celo: "https://forno.celo.org",
  "celo-sepolia": "https://forno.celo-sepolia.celo-testnet.org",
};

export { celo };
