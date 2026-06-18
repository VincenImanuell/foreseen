import { defineChain, type Chain } from "viem";
import { celo } from "viem/chains";

/** Celo Sepolia testnet (chainId 11142220). Not yet in viem, so defined here. */
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

/**
 * The two supported CELO networks.
 * - `"celo"` — CELO mainnet (chainId 42220); uses real CELO.
 * - `"celo-sepolia"` — Celo Sepolia testnet (chainId 11142220); free faucet at faucet.celo.org.
 */
export type NetworkName = "celo" | "celo-sepolia";

/** Map of supported networks to their viem Chain objects. */
export const CHAINS: Record<NetworkName, Chain> = {
  celo,
  "celo-sepolia": celoSepolia,
};

/**
 * Free public Celo RPC endpoints — no API key required.
 * Override via `ForeseenOptions.rpcUrl` for a private/paid endpoint.
 * Both support CELO mainnet and Celo Sepolia with standard JSON-RPC.
 */
export const DEFAULT_RPC: Record<NetworkName, string> = {
  celo: "https://forno.celo.org",
  "celo-sepolia": "https://forno.celo-sepolia.celo-testnet.org",
};

export { celo };
