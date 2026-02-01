import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  const action = String(body.action ?? "").trim(); // accept | decline

  if (!id || !["accept", "decline"].includes(action)) {
    return applyCookies(NextResponse.json({ error: "不正なリクエスト" }, { status: 400 }));
  }

  const { data: req, error: fetchError } = await supabase
    .from("friendships")
    .select("id, user_id, friend_user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !req) return applyCookies(NextResponse.json({ error: "見つかりません" }, { status: 404 }));
  if (req.friend_user_id !== user.id) return applyCookies(NextResponse.json({ error: "権限がありません" }, { status: 403 }));
  if (req.status !== "pending") return applyCookies(NextResponse.json({ error: "処理済みです" }, { status: 400 }));

  const newStatus = action === "accept" ? "accepted" : "declined";
  const { error: updateError } = await supabase
    .from("friendships")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return applyCookies(NextResponse.json({ error: updateError.message }, { status: 500 }));

  return applyCookies(NextResponse.json({ ok: true, status: newStatus }));
}
