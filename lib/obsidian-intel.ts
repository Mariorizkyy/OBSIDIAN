import { encodeFunctionData } from "viem";

export const OBSIDIAN_INTEL_ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "rssUrl", "type": "string" }],
    "name": "requestNewsAlpha",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "target", "type": "address" }],
    "name": "requestWhaleAlert",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "symbol", "type": "string" }],
    "name": "requestDEXAnomaly",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "keyword", "type": "string" }],
    "name": "requestNarrativeIntel",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "alphaFeed",
    "outputs": [
      { "internalType": "string", "name": "summary", "type": "string" },
      { "internalType": "string", "name": "alphaType", "type": "string" },
      { "internalType": "string", "name": "source", "type": "string" },
      { "internalType": "uint8", "name": "confidence", "type": "uint8" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "settled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAlphaFeedLength",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "jobId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "summary", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "alphaType", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "confidence", "type": "uint8" }
    ],
    "name": "IntelSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "jobId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "requester", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "query", "type": "string" }
    ],
    "name": "IntelRequested",
    "type": "event"
  }
] as const;

export interface AlphaIntel {
  summary: string;
  alphaType: string;
  source: string;
  confidence: number;
  timestamp: number;
  settled: boolean;
}

export function encodeRequestNewsAlpha(rssUrl: string): `0x${string}` {
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestNewsAlpha",
    args: [rssUrl],
  });
}

export function encodeRequestWhaleAlert(target: string): `0x${string}` {
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestWhaleAlert",
    args: [target as `0x${string}`],
  });
}

export function encodeRequestDEXAnomaly(symbol: string): `0x${string}` {
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestDEXAnomaly",
    args: [symbol],
  });
}

export function encodeRequestNarrativeIntel(keyword: string): `0x${string}` {
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestNarrativeIntel",
    args: [keyword],
  });
}

export function decodeAlphaFeed(rawData: readonly [string, string, string, number, bigint, boolean]): AlphaIntel {
  return {
    summary: rawData[0],
    alphaType: rawData[1],
    source: rawData[2],
    confidence: rawData[3],
    timestamp: Number(rawData[4]),
    settled: rawData[5],
  };
}
