"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection, useConnect, useConnectors } from "wagmi";
import { isMiniPayProvider } from "@/lib/minipay";

export function useMiniPay() {
  const attemptedAutoConnect = useRef(false);
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { isConnected } = useConnection();
  const { mutate: connect, isPending } = useConnect();
  const connectors = useConnectors();

  useEffect(() => {
    const detected = isMiniPayProvider();
    setIsMiniPay(detected);

    if (!detected || isConnected || attemptedAutoConnect.current) return;

    const injectedConnector =
      connectors.find((connector) => connector.id === "injected") ??
      connectors[0];

    if (!injectedConnector) return;

    attemptedAutoConnect.current = true;
    connect({ connector: injectedConnector });
  }, [connect, connectors, isConnected]);

  return {
    isMiniPay,
    isConnectingMiniPay: isMiniPay && !isConnected && isPending,
  };
}
