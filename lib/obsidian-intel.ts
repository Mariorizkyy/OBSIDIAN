import { encodeFunctionData, encodeAbiParameters, parseAbiParameters } from "viem";

export const OBSIDIAN_INTEL_ABI = [
  {
    "inputs": [
      { "internalType": "bytes", "name": "payload", "type": "bytes" },
      { "internalType": "string", "name": "displaySource", "type": "string" }
    ],
    "name": "requestHTTP",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "payload", "type": "bytes" },
      { "internalType": "string", "name": "alphaType", "type": "string" },
      { "internalType": "string", "name": "displaySource", "type": "string" }
    ],
    "name": "requestLLM",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "payload", "type": "bytes" },
      { "internalType": "string", "name": "displaySource", "type": "string" }
    ],
    "name": "requestJQ",
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

const HTTP_EXECUTOR = "0xA6f6159C4D978E46eecF74588D3b099Cd15cfc91";
const LLM_EXECUTOR = "0xDbd91ABbc81e62ec68C6eE335426210b3A54f8Ff";

function buildHTTPPayload(url: string) {
  // 13-field HTTP payload
  return encodeAbiParameters(
    parseAbiParameters([
      'address', 'bytes[]', 'uint256', 'bytes[]', 'bytes',
      'string', 'uint8', 'string[]', 'string[]', 'bytes',
      'uint256', 'uint8', 'bool'
    ].join(',')),
    [
      HTTP_EXECUTOR as `0x${string}`, 
      [], 100n, [], "0x", 
      url, 
      1, // GET
      [], [], "0x", 
      0n, 0, false
    ]
  );
}

function buildLLMPayload(messages: {role: string, content: string}[]) {
  // 30-field LLM payload
  return encodeAbiParameters(
    parseAbiParameters([
      'address, bytes[], uint256, bytes[], bytes,',
      'string, string, int256, string, bool, int256, string, string,',
      'uint256, bool, int256, string, bytes, int256, string, string, bool,',
      'int256, bytes, bytes, int256, int256, string, bool,',
      '(string,string,string)'
    ].join('')),
    [
      LLM_EXECUTOR as `0x${string}`,
      [], 100n, [], "0x",
      JSON.stringify(messages),
      'zai-org/GLM-4.7-FP8',
      0n, '', false, 4096n, '', '',
      1n, true, 0n, 'medium', '0x', -1n, 'auto', '',
      false, 700n, '0x', '0x', -1n, 1000n, '',
      false, ['','','']
    ]
  );
}

export function encodeRequestNewsAlpha(rssUrl: string): `0x${string}` {
  const payload = buildLLMPayload([
    { role: "system", content: "You are a crypto analyst. Summarize this RSS feed into actionable alpha." },
    { role: "user", content: `URL: ${rssUrl}` }
  ]);
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestLLM",
    args: [payload, "NEWS", rssUrl],
  });
}

export function encodeRequestNarrativeIntel(keyword: string): `0x${string}` {
  const payload = buildLLMPayload([
    { role: "system", content: "You are a crypto analyst. Analyze the market narrative for the keyword." },
    { role: "user", content: `Keyword: ${keyword}` }
  ]);
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestLLM",
    args: [payload, "NARRATIVE", "CoinGecko"],
  });
}

export function encodeRequestDEXAnomaly(symbol: string): `0x${string}` {
  // Example dummy endpoint for DEX anomalies
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`;
  const payload = buildHTTPPayload(url);
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestHTTP",
    args: [payload, "Binance"],
  });
}

export function encodeRequestWhaleAlert(target: string): `0x${string}` {
  // Since JQ precompile needs a different structure that we don't have,
  // we fallback to LLM precompile to "analyze whale behavior" on an endpoint
  // to avoid breaking the contract with an unknown JQ struct
  const payload = buildLLMPayload([
    { role: "system", content: "You are a whale tracker." },
    { role: "user", content: `Analyze the recent transactions for address ${target} for whale alerts.` }
  ]);
  return encodeFunctionData({
    abi: OBSIDIAN_INTEL_ABI,
    functionName: "requestLLM",
    args: [payload, "WHALE", target],
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
