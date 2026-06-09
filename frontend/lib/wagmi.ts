import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celoSepolia } from "./chain";

/**
 * wagmi config. We use the `injected` connector only — it covers MetaMask,
 * MiniPay (Celo's wallet) and any EIP-1193 browser wallet, with zero external
 * accounts or WalletConnect project ids required (keeps the demo free & signup-less).
 */
export const wagmiConfig = createConfig({
  chains: [celoSepolia],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [celoSepolia.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
