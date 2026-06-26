import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ONRAMP_PROXY_BASE_URL!;
const KEY = process.env.ONRAMP_API_KEY!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const upstream = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`, {
    headers: { "x-api-key": KEY },
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
