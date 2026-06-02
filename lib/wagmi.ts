import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain, http } from "viem";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Chain",
  network: "ritual-testnet",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["/api/rpc"],
    },
    public: {
      http: ["/api/rpc"],
    },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "OBSIDIAN Terminal",
  projectId: "OBSIDIAN_INTEL_PROJECT",
  chains: [ritualChain],
  transports: {
    [ritualChain.id]: http("/api/rpc"),
  },
  ssr: true,
});
