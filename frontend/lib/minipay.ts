export type MiniPayEthereumProvider = {
  isMiniPay?: boolean;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: MiniPayEthereumProvider;
  }
}

export function getInjectedProvider() {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

export function isMiniPayProvider(provider = getInjectedProvider()) {
  return Boolean(provider?.isMiniPay);
}
