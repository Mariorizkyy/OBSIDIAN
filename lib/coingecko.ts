// CoinGecko API integration for real-time crypto data
import type { FetchAllMarketDataResult } from "./alpha-vantage";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Define the exact coins we want in our three categories
const COIN_CATEGORIES = {
  americas: [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
    { id: "solana", symbol: "SOL" },
    { id: "binancecoin", symbol: "BNB" },
    { id: "avalanche-2", symbol: "AVAX" },
    { id: "cardano", symbol: "ADA" },
  ],
  emea: [
    { id: "uniswap", symbol: "UNI" },
    { id: "chainlink", symbol: "LINK" },
    { id: "lido-dao", symbol: "LDO" },
    { id: "aave", symbol: "AAVE" },
    { id: "maker", symbol: "MKR" },
    { id: "curve-dao-token", symbol: "CRV" },
  ],
  asiaPacific: [
    { id: "render-token", symbol: "RNDR" },
    { id: "fetch-ai", symbol: "FET" },
    { id: "bittensor", symbol: "TAO" },
    { id: "singularitynet", symbol: "AGIX" },
    { id: "the-graph", symbol: "GRT" },
    { id: "ocean-protocol", symbol: "OCEAN" },
  ],
};

// Map CoinGecko response to our UI format
export async function fetchLiveCryptoData(): Promise<FetchAllMarketDataResult> {
  const result: FetchAllMarketDataResult = {
    americas: [],
    emea: [],
    asiaPacific: [],
    lastUpdated: new Date().toISOString(),
    dataSource: "coingecko-realtime",
  };

  // Collect all coin IDs for a single API call
  const allIds = [
    ...COIN_CATEGORIES.americas.map((c) => c.id),
    ...COIN_CATEGORIES.emea.map((c) => c.id),
    ...COIN_CATEGORIES.asiaPacific.map((c) => c.id),
  ].join(",");

  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${allIds}&sparkline=true&price_change_percentage=24h,ytd`,
      { cache: "no-store" } // Ensure we get fresh data
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Map data back into our three categories
    for (const [regionKey, coins] of Object.entries(COIN_CATEGORIES)) {
      result[regionKey] = coins.map((coin, index) => {
        // Find the coin data from the API response
        const coinData = data.find((d: any) => d.id === coin.id);

        if (!coinData) {
          return generateEmptyItem(coin.symbol, regionKey, index);
        }

        // Process sparkline data
        const sparklineRaw = coinData.sparkline_in_7d?.price || [];
        // Extract 16 points for our sparklines
        const sampleRate = Math.max(1, Math.floor(sparklineRaw.length / 16));
        const sampledSparkline = [];
        for (let i = 0; i < 16 && i * sampleRate < sparklineRaw.length; i++) {
          sampledSparkline.push(sparklineRaw[i * sampleRate]);
        }

        // Normalize sparkline values between 0 and 1
        const minVal = Math.min(...sampledSparkline);
        const maxVal = Math.max(...sampledSparkline);
        const range = maxVal - minVal || 1;
        const normalizedSparkline = sampledSparkline.map((val) => (val - minVal) / range);

        const sparkline1 = normalizedSparkline.slice(0, 8);
        let sparkline2 = normalizedSparkline.slice(8, 16);
        
        // Ensure we always have 8 points per sparkline (pad if necessary)
        while (sparkline1.length < 8) sparkline1.push(0);
        while (sparkline2.length < 8) sparkline2.push(0);

        return {
          id: coin.symbol + "/USDT",
          num: `${regionKey === "americas" ? "1" : regionKey === "emea" ? "2" : "3"}${index + 1})`,
          rmi: "□",
          value: Number.parseFloat(coinData.current_price?.toFixed(2) || "0"),
          change: Number.parseFloat(coinData.price_change_24h?.toFixed(2) || "0"),
          pctChange: Number.parseFloat(coinData.price_change_percentage_24h?.toFixed(2) || "0"),
          avat: Number.parseFloat((coinData.total_volume / 1000000).toFixed(2)), // in millions
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          ytd: Number.parseFloat(coinData.price_change_percentage_ytd_in_currency?.toFixed(2) || "0"),
          ytdCur: Number.parseFloat(coinData.price_change_percentage_ytd_in_currency?.toFixed(2) || "0"), // fallback mapping
          sparkline1,
          sparkline2,
        };
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching live crypto data:", error);
    throw error;
  }
}

function generateEmptyItem(symbol: string, region: string, index: number) {
  return {
    id: symbol + "/USDT",
    num: `${region === "americas" ? "1" : region === "emea" ? "2" : "3"}${index + 1})`,
    rmi: "□",
    value: 0,
    change: 0,
    pctChange: 0,
    avat: 0,
    time: "--:--",
    ytd: 0,
    ytdCur: 0,
    sparkline1: Array(8).fill(0),
    sparkline2: Array(8).fill(0),
  };
}
