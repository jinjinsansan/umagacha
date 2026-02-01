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
    .select(
      "id, type, ticket_type_id, horse_id, quantity, status, created_at, responded_at, from_user_id, to_user_id, ticket_types(code, name), horses(name, rarity)"
    )
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
    .select("id, to_user_id, from_user_id, status, type, ticket_type_id, horse_id, quantity")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !gift) return applyCookies(NextResponse.json({ error: "見つかりません" }, { status: 404 }));
  if (gift.to_user_id !== user.id) return applyCookies(NextResponse.json({ error: "権限がありません" }, { status: 403 }));
  if (gift.status !== "sent") return applyCookies(NextResponse.json({ error: "処理済みです" }, { status: 400 }));

  const newStatus = action === "accept" ? "accepted" : "declined";

  // 返却処理（拒否時のみ）
  if (action === "decline") {
    if (gift.type === "ticket" && gift.ticket_type_id) {
      const { data: recv } = await supabase
        .from("user_tickets")
        .select("id, quantity")
        .eq("user_id", gift.to_user_id)
        .eq("ticket_type_id", gift.ticket_type_id)
        .limit(1)
        .maybeSingle();

      if (recv) {
        await supabase
          .from("user_tickets")
          .update({ quantity: Math.max((recv.quantity ?? 0) - gift.quantity, 0) })
          .eq("id", recv.id);
      }

      const { data: sender } = await supabase
        .from("user_tickets")
        .select("id, quantity")
        .eq("user_id", gift.from_user_id)
        .eq("ticket_type_id", gift.ticket_type_id)
        .limit(1)
        .maybeSingle();

      await supabase
        .from("user_tickets")
        .upsert({
          id: sender?.id,
          user_id: gift.from_user_id,
          ticket_type_id: gift.ticket_type_id,
          quantity: (sender?.quantity ?? 0) + gift.quantity,
        }, { onConflict: "user_id,ticket_type_id" });
    }

    if (gift.type === "horse" && gift.horse_id) {
      const { data: recv } = await supabase
        .from("user_collections")
        .select("id, quantity")
        .eq("user_id", gift.to_user_id)
        .eq("horse_id", gift.horse_id)
        .limit(1)
        .maybeSingle();

      if (recv) {
        await supabase
          .from("user_collections")
          .update({ quantity: Math.max((recv.quantity ?? 0) - gift.quantity, 0) })
          .eq("id", recv.id);
      }

      const { data: sender } = await supabase
        .from("user_collections")
        .select("id, quantity")
        .eq("user_id", gift.from_user_id)
        .eq("horse_id", gift.horse_id)
        .limit(1)
        .maybeSingle();

      await supabase
        .from("user_collections")
        .upsert({
          id: sender?.id,
          user_id: gift.from_user_id,
          horse_id: gift.horse_id,
          quantity: (sender?.quantity ?? 0) + gift.quantity,
        }, { onConflict: "user_id,horse_id" });
    }
  }

  const { error: updateError } = await supabase
    .from("gifts")
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return applyCookies(NextResponse.json({ error: updateError.message }, { status: 500 }));

  return applyCookies(NextResponse.json({ ok: true, status: newStatus }));
}
