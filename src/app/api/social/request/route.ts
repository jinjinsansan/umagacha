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
  const toUserId = String(body.toUserId ?? "").trim();

  if (!toUserId || toUserId === user.id) {
    return applyCookies(NextResponse.json({ error: "不正なユーザーです" }, { status: 400 }));
  }

  // 既存チェック
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status, user_id, friend_user_id")
    .or(`and(user_id.eq.${user.id},friend_user_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_user_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return applyCookies(NextResponse.json({ error: "既にフレンドです" }, { status: 400 }));
    }
    return applyCookies(NextResponse.json({ error: "申請が既に存在します" }, { status: 400 }));
  }

  const { error: insertError } = await supabase.from("friendships").insert({
    user_id: user.id,
    friend_user_id: toUserId,
    status: "pending",
    requested_by: user.id,
  });

  if (insertError) {
    return applyCookies(NextResponse.json({ error: insertError.message }, { status: 500 }));
  }

  return applyCookies(NextResponse.json({ ok: true }, { status: 200 }));
}
