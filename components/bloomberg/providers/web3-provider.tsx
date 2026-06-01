"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { useState } from "react";

const ritualTestnet = defineChain({
  id: 1979,
  name: "Ritual Testnet",
  network: "ritual-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ritual",
    symbol: "RITUAL",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ritualfoundation.org"],
    },
    public: {
      http: ["https://rpc.ritualfoundation.org"],
    },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
});

const config = getDefaultConfig({
  appName: "OBSIDIAN Terminal",
  projectId: "YOUR_PROJECT_ID", // Replace with actual project ID later if needed
  chains: [ritualTestnet],
  ssr: true,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            gcTime: 1000 * 60 * 60, // 1 hour
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            structuralSharing: true,
          },
          mutations: {
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#10b981', // Terminal green
          accentColorForeground: 'white',
          borderRadius: 'none',
          fontStack: 'system',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
