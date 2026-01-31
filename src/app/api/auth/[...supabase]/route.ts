import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/home";
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const { supabase, applyCookies } = createSupabaseRouteClient(request);

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return applyCookies(response);
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", requestUrl.origin), { status: 302 });
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return applyCookies(response);
}
