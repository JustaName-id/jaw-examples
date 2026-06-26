import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ONRAMP_PROXY_BASE_URL!;
const KEY = process.env.ONRAMP_API_KEY!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Forward the end-user's IP — Coinbase uses it for the US region check.
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const upstream = await fetch(`${BASE}/validate-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY },
    body: JSON.stringify(clientIp ? { ...body, clientIp } : body),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
