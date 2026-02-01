import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (!query.trim()) {
    return applyCookies(NextResponse.json({ users: [] }));
  }

  const svc = getSupabaseServiceClient();
  const { data: usersData } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 });

  const filtered = (usersData?.users ?? [])
    .filter((u) => u.email?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10)
    .map((u) => ({ id: u.id, email: u.email }));

  return applyCookies(NextResponse.json({ users: filtered }));
}
