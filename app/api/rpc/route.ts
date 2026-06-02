import { NextRequest, NextResponse } from "next/server";

const RPC_URL = process.env.NEXT_PUBLIC_RITUAL_RPC ?? "https://rpc.ritualfoundation.org";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("RPC Proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy RPC request" }, { status: 500 });
  }
}
