import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ONRAMP_PROXY_BASE_URL!;
const KEY = process.env.ONRAMP_API_KEY!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${BASE}/start`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
