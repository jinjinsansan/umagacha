import { NextResponse } from "next/server";

export async function POST() {
  const nextReset = new Date();
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(10, 0, 0, 0);

  return NextResponse.json(
    {
      ticket: "free",
      amount: 1,
      message: "フリーチケットを付与しました",
      nextResetAt: nextReset.toISOString(),
    },
    { status: 200 }
  );
}
