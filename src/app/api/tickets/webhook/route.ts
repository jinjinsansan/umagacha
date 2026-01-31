import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("x-one-lat-signature");
  const payload = await request.json().catch(() => ({}));
  const { ONE_LAT_API_KEY } = getServerEnv();

  if (!ONE_LAT_API_KEY || signature !== ONE_LAT_API_KEY) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok", payload }, { status: 200 });
}
