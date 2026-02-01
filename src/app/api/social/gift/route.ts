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
  const type = String(body.type ?? "").trim(); // ticket | horse
  const ticketCode = body.ticketCode ? String(body.ticketCode) : null;
  const horseId = body.horseId ? String(body.horseId) : null;
  const quantity = Math.max(Number(body.quantity) || 0, 0);

  if (!toUserId || toUserId === user.id) {
    return applyCookies(NextResponse.json({ error: "不正な相手です" }, { status: 400 }));
  }

  if (type === "ticket") {
    if (!ticketCode || quantity <= 0) {
      return applyCookies(NextResponse.json({ error: "チケット情報が不足" }, { status: 400 }));
    }

    const { data: ticketType } = await supabase
      .from("ticket_types")
      .select("id")
      .eq("code", ticketCode)
      .limit(1)
      .maybeSingle();

    if (!ticketType) return applyCookies(NextResponse.json({ error: "チケット種別が存在しません" }, { status: 400 }));

    const { data: senderBalance } = await supabase
      .from("user_tickets")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("ticket_type_id", ticketType.id)
      .limit(1)
      .maybeSingle();

    if (!senderBalance || (senderBalance.quantity ?? 0) < quantity) {
      return applyCookies(NextResponse.json({ error: "チケットが不足しています" }, { status: 400 }));
    }

    // 減算
    const { error: decError } = await supabase
      .from("user_tickets")
      .update({ quantity: (senderBalance.quantity ?? 0) - quantity })
      .eq("id", senderBalance.id);

    if (decError) return applyCookies(NextResponse.json({ error: decError.message }, { status: 500 }));

    // 加算（upsert）
    const { data: recvBalance } = await supabase
      .from("user_tickets")
      .select("id, quantity")
      .eq("user_id", toUserId)
      .eq("ticket_type_id", ticketType.id)
      .limit(1)
      .maybeSingle();

    const { error: incError } = await supabase
      .from("user_tickets")
      .upsert({
        id: recvBalance?.id,
        user_id: toUserId,
        ticket_type_id: ticketType.id,
        quantity: (recvBalance?.quantity ?? 0) + quantity,
      }, { onConflict: "user_id,ticket_type_id" });

    if (incError) return applyCookies(NextResponse.json({ error: incError.message }, { status: 500 }));

    const { error: logError } = await supabase.from("gifts").insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      type: "ticket",
      ticket_type_id: ticketType.id,
      horse_id: null,
      quantity,
      status: "sent",
    });

    if (logError) return applyCookies(NextResponse.json({ error: logError.message }, { status: 500 }));
  } else if (type === "horse") {
    if (!horseId || quantity <= 0) {
      return applyCookies(NextResponse.json({ error: "馬IDが不足" }, { status: 400 }));
    }

    const { data: senderHorse } = await supabase
      .from("user_collections")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("horse_id", horseId)
      .limit(1)
      .maybeSingle();

    if (!senderHorse || (senderHorse.quantity ?? 0) < quantity) {
      return applyCookies(NextResponse.json({ error: "所持枚数が不足" }, { status: 400 }));
    }

    const { error: decColError } = await supabase
      .from("user_collections")
      .update({ quantity: (senderHorse.quantity ?? 0) - quantity })
      .eq("id", senderHorse.id);

    if (decColError) return applyCookies(NextResponse.json({ error: decColError.message }, { status: 500 }));

    const { data: recvCol } = await supabase
      .from("user_collections")
      .select("id, quantity, first_acquired_at")
      .eq("user_id", toUserId)
      .eq("horse_id", horseId)
      .limit(1)
      .maybeSingle();

    const { error: incColError } = await supabase
      .from("user_collections")
      .upsert({
        id: recvCol?.id,
        user_id: toUserId,
        horse_id: horseId,
        quantity: (recvCol?.quantity ?? 0) + quantity,
        first_acquired_at: recvCol?.quantity ? recvCol.first_acquired_at : new Date().toISOString(),
      }, { onConflict: "user_id,horse_id" });

    if (incColError) return applyCookies(NextResponse.json({ error: incColError.message }, { status: 500 }));

    const { error: logError } = await supabase.from("gifts").insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      type: "horse",
      ticket_type_id: null,
      horse_id: horseId,
      quantity,
      status: "sent",
    });

    if (logError) return applyCookies(NextResponse.json({ error: logError.message }, { status: 500 }));
  } else {
    return applyCookies(NextResponse.json({ error: "typeが不正です" }, { status: 400 }));
  }

  return applyCookies(NextResponse.json({ ok: true }));
}
