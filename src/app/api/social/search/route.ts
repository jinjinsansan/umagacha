import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!query || !query.includes("@")) {
    return applyCookies(NextResponse.json({ users: [] }));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return applyCookies(NextResponse.json({ error: "検索を利用できません" }, { status: 500 }));
  }

  const adminUrl = new URL("/auth/v1/admin/users", supabaseUrl);
  adminUrl.searchParams.set("email", query);

  const adminRes = await fetch(adminUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!adminRes.ok) {
    if (adminRes.status === 404) {
      return applyCookies(NextResponse.json({ users: [] }));
    }
    return applyCookies(NextResponse.json({ error: "検索に失敗しました" }, { status: 500 }));
  }

  const payload = (await adminRes.json()) as { users?: { id: string; email?: string | null }[] };
  const match = payload.users?.find((user) => user.email?.toLowerCase() === query) ?? null;
  const result = match?.email ? [{ id: match.id, email: match.email }] : [];
  return applyCookies(NextResponse.json({ users: result }));
}
