import { NextResponse } from "next/server";
import { GACHA_DEFINITIONS } from "@/constants/gacha";

export async function GET() {
  return NextResponse.json({ gachas: GACHA_DEFINITIONS }, { status: 200 });
}
