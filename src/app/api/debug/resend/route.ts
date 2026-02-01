import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export function GET() {
  try {
    const { RESEND_API_KEY, RESEND_FROM_EMAIL } = getServerEnv();
    return NextResponse.json({
      hasResendApiKey: Boolean(RESEND_API_KEY),
      hasResendFromEmail: Boolean(RESEND_FROM_EMAIL),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
