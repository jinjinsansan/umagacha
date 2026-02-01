import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error: fetchError } = await supabase
    .from("gifts")
    .select("id, type, ticket_type_id, horse_id, quantity, status, created_at, responded_at, from_user_id, to_user_id, ticket_types(code, name), horses(name, rarity)")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (fetchError) return applyCookies(NextResponse.json({ error: fetchError.message }, { status: 500 }));

  const incoming = data?.filter((g) => g.to_user_id === user.id) ?? [];
  const outgoing = data?.filter((g) => g.from_user_id === user.id) ?? [];

  return applyCookies(NextResponse.json({ incoming, outgoing }));
}

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  const action = String(body.action ?? ""); // accept | decline

  if (!id || !["accept", "decline"].includes(action)) {
    return applyCookies(NextResponse.json({ error: "不正なリクエスト" }, { status: 400 }));
  }

  const { data: gift, error: fetchError } = await supabase
    .from("gifts")
    .select("id, to_user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !gift) return applyCookies(NextResponse.json({ error: "見つかりません" }, { status: 404 }));
  if (gift.to_user_id !== user.id) return applyCookies(NextResponse.json({ error: "権限がありません" }, { status: 403 }));
  if (gift.status !== "sent") return applyCookies(NextResponse.json({ error: "処理済みです" }, { status: 400 }));

  const newStatus = action === "accept" ? "accepted" : "declined";
  const { error: updateError } = await supabase
    .from("gifts")
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return applyCookies(NextResponse.json({ error: updateError.message }, { status: 500 }));

  return applyCookies(NextResponse.json({ ok: true, status: newStatus }));
}
