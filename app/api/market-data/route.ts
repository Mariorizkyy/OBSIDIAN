import { NextResponse } from "next/server";
import { fetchLiveCryptoData } from "@/lib/coingecko";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Check if Redis is connected
    let isConnected = false;
    let redisData = null;

    try {
      await redis.ping();
      isConnected = true;
      redisData = await redis.get("market_data_realtime");
    } catch (redisError) {
      console.warn("Redis error:", redisError);
      isConnected = false;
    }

    if (!isConnected || !redisData) {
      console.log("Fetching fresh data directly from CoinGecko API");
      const freshData = await fetchLiveCryptoData();

      if (isConnected) {
        // Cache it briefly (10 seconds) to avoid hitting rate limits from multiple clients
        await redis.set("market_data_realtime", freshData, { ex: 10 });
      }

      return NextResponse.json({
        ...freshData,
        isFromRedis: false,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Return the data from Redis
    return NextResponse.json({
      ...(redisData as object),
      isFromRedis: true,
      lastFetched: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in market-data GET route:", error);
    return NextResponse.json({
      error: String(error),
      lastUpdated: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "update") {
      // Direct pull from CoinGecko on demand
      const freshData = await fetchLiveCryptoData();
      freshData.lastUpdated = new Date().toISOString();

      try {
        await redis.ping();
        await redis.set("market_data_realtime", freshData, { ex: 10 });
      } catch (redisSetError) {
        // Ignore redis set error if redis is down
      }

      return NextResponse.json({
        success: true,
        message: "Market data updated successfully with real data",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in market-data POST route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details: String(error),
      },
      { status: 200 }
    );
  }
}
