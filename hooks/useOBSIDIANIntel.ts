import { useState, useEffect } from "react";
import { useSendTransaction, useReadContract, useReadContracts, useWatchContractEvent } from "wagmi";
import {
  encodeRequestNewsAlpha,
  encodeRequestWhaleAlert,
  encodeRequestDEXAnomaly,
  encodeRequestNarrativeIntel,
  OBSIDIAN_INTEL_ABI,
  decodeAlphaFeed,
  AlphaIntel
} from "../lib/obsidian-intel";
import { ritualChain } from "../lib/wagmi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export type TxStatus = "idle" | "submitting" | "pending" | "committed" | "processing" | "settled" | "failed";

export function useOBSIDIANIntel() {
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [feed, setFeed] = useState<AlphaIntel[]>([]);
  const { sendTransactionAsync } = useSendTransaction();

  // 1. Get length of feed
  const { data: feedLength, refetch: refetchLength } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "getAlphaFeedLength",
  });

  // 2. Fetch the actual feed items
  const indices = Array.from({ length: Number(feedLength || 0) }, (_, i) => i);
  const { data: rawFeed, refetch: refetchFeed } = useReadContracts({
    contracts: indices.map((idx) => ({
      address: CONTRACT_ADDRESS,
      abi: OBSIDIAN_INTEL_ABI,
      functionName: "alphaFeed",
      args: [BigInt(idx)],
    })),
  });

  useEffect(() => {
    if (rawFeed) {
      const parsed = rawFeed
        .filter((res) => res.status === "success" && res.result)
        .map((res) => decodeAlphaFeed(res.result as any));
      // Reverse to show newest first
      setFeed(parsed.reverse());
    }
  }, [rawFeed]);

  // Watch for new settled intel to auto-refresh
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: OBSIDIAN_INTEL_ABI,
    eventName: "IntelSettled",
    onLogs() {
      refetchLength();
      refetchFeed();
    },
  });

  const sendIntelRequest = async (encodedData: `0x${string}`) => {
    setTxStatus("submitting");
    try {
      const hash = await sendTransactionAsync({
        to: CONTRACT_ADDRESS,
        data: encodedData,
        value: 0n,
        gas: 2_000_000n, // Pitfall #1 override
      });
      setTxStatus("pending");

      // Simulate the ritual async states since we don't have the full Ritual JobTracker indexer hooked up
      setTimeout(() => setTxStatus("committed"), 3000);
      setTimeout(() => setTxStatus("processing"), 6000);
      setTimeout(() => {
        setTxStatus("settled");
        refetchLength();
        refetchFeed();
        setTimeout(() => setTxStatus("idle"), 5000); // Reset after 5s
      }, 12000);

      return hash;
    } catch (error) {
      console.error(error);
      setTxStatus("failed");
      setTimeout(() => setTxStatus("idle"), 3000);
      throw error;
    }
  };

  const requestNewsAlpha = (rssUrl: string) => sendIntelRequest(encodeRequestNewsAlpha(rssUrl));
  const requestWhaleAlert = (target: string) => sendIntelRequest(encodeRequestWhaleAlert(target));
  const requestDEXAnomaly = (symbol: string) => sendIntelRequest(encodeRequestDEXAnomaly(symbol));
  const requestNarrativeIntel = (keyword: string) => sendIntelRequest(encodeRequestNarrativeIntel(keyword));

  return {
    requestNewsAlpha,
    requestWhaleAlert,
    requestDEXAnomaly,
    requestNarrativeIntel,
    alphaFeed: feed,
    txStatus,
  };
}
