import { NextResponse } from "next/server";
import { fetchCryptoNews } from "@/lib/coingecko";

export async function GET() {
  try {
    const news = await fetchCryptoNews();
    
    if (!news || news.length === 0) {
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error in news GET route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
