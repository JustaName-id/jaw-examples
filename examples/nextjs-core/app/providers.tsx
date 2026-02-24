"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jaw } from "@/lib/jaw";

interface JAWContextValue {
  address: string | undefined;
  chainId: number | undefined;
  isConnected: boolean;
}

const JAWContext = createContext<JAWContextValue>({
  address: undefined,
  chainId: undefined,
  isConnected: false,
});

export function useJaw() {
  return useContext(JAWContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Silent session restore — eth_accounts returns [] without prompting
    (jaw.provider.request({ method: "eth_accounts" }) as Promise<string[]>)
      .then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      })
      .catch(() => {});

    // Sync current chain
    (jaw.provider.request({ method: "eth_chainId" }) as Promise<string>)
      .then((hex) => setChainId(parseInt(hex, 16)))
      .catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(undefined);
        setIsConnected(false);
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (hex: string) => {
      setChainId(parseInt(hex, 16));
    };

    const handleConnect = (info: { chainId: string }) => {
      setChainId(parseInt(info.chainId, 16));
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setAddress(undefined);
      setChainId(undefined);
      setIsConnected(false);
    };

    jaw.provider.on("accountsChanged", handleAccountsChanged);
    jaw.provider.on("chainChanged", handleChainChanged);
    jaw.provider.on("connect", handleConnect);
    jaw.provider.on("disconnect", handleDisconnect);

    return () => {
      jaw.provider.removeListener("accountsChanged", handleAccountsChanged);
      jaw.provider.removeListener("chainChanged", handleChainChanged);
      jaw.provider.removeListener("connect", handleConnect);
      jaw.provider.removeListener("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <JAWContext.Provider value={{ address, chainId, isConnected }}>
      {children}
    </JAWContext.Provider>
  );
}
