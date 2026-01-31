import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

function createClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/home";
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (code) {
    const supabase = createClient(request, response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", requestUrl.origin), { status: 302 });
  const supabase = createClient(request, response);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return response;
}
