import { NextRequest, NextResponse } from "next/server";
import { GACHA_ANIMATIONS, GACHA_DEFINITIONS } from "@/constants/gacha";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import type { Database } from "@/types/database";
import { pickWeighted } from "@/lib/utils/api";

type DbGacha = Database["public"]["Tables"]["gachas"]["Row"] & {
  ticket_types: Pick<Database["public"]["Tables"]["ticket_types"]["Row"], "id" | "name" | "code" | "color">;
  gacha_rates: ({ rate: number } & {
    horses: Pick<Database["public"]["Tables"]["horses"]["Row"], "id" | "name" | "rarity" | "card_image_url">;
  })[];
};

type DbAnimation = Database["public"]["Tables"]["gacha_animations"]["Row"];

const FALLBACK_HORSES: { id: string; name: string; rarity: number; card_image_url?: string }[] = [
  { id: "fallback-1", name: "ディープインパクト", rarity: 12 },
  { id: "fallback-2", name: "ナリタブライアン", rarity: 11 },
  { id: "fallback-3", name: "ダンスインザダーク", rarity: 9, card_image_url: "/assets/dance-in-the-dark.png" },
  { id: "fallback-4", name: "エルコンドルパサー", rarity: 8 },
  { id: "fallback-5", name: "ナイスネイチャ", rarity: 6 },
  { id: "fallback-6", name: "ツインターボ", rarity: 5 },
  { id: "fallback-7", name: "ハルウララ", rarity: 3 },
  { id: "fallback-8", name: "サクラバクシンオー", rarity: 7 },
  { id: "fallback-9", name: "メイショウドトウ", rarity: 4 },
  { id: "fallback-10", name: "地方馬A", rarity: 2 },
];

function resolveAnimation(rarity: number, animations: DbAnimation[]) {
  const matched = animations.find(
    (anim) => rarity >= anim.min_rarity && rarity <= anim.max_rarity && anim.is_active !== false
  );

  if (matched) {
    return {
      key: matched.key,
      name: matched.name,
      type: matched.type ?? "css",
      asset_url: matched.asset_url ?? null,
      duration_seconds: matched.duration_seconds ?? null,
    };
  }

  const fallback = GACHA_ANIMATIONS.find(
    (anim) => rarity >= anim.rarityRange[0] && rarity <= anim.rarityRange[1]
  );

  return {
    key: fallback?.key ?? "g1",
    name: fallback?.name ?? "",
    type: "css",
    asset_url: null,
    duration_seconds: fallback?.duration ?? null,
  };
}

function fallbackResult(id: string, repeat: number) {
  const gacha = GACHA_DEFINITIONS.find((item) => item.id === id);
  const [min, max] = gacha?.rarityRange ?? [1, 3];
  const pool = FALLBACK_HORSES.filter((horse) => horse.rarity >= min && horse.rarity <= max);
  const results = Array.from({ length: repeat }).map(() => {
    const selection = pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? FALLBACK_HORSES[0];
    return {
      horse: selection.name,
      rarity: selection.rarity,
      animation: resolveAnimation(selection.rarity, []).key,
      horseId: selection.id,
    };
  });

  return { results, ticketLabel: gacha?.ticketLabel ?? "" };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({ repeat: 1 }));
  const repeat = Math.min(Math.max(Number(body.repeat) || 1, 1), 10);
  const { supabase, applyCookies } = createSupabaseRouteClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: gachaRows } = await supabase
    .from("gachas")
    .select("*, ticket_types(id, name, code, color), gacha_rates(rate, horses(id, name, rarity, card_image_url))")
    .eq("ticket_types.code", id)
    .eq("is_active", true)
    .limit(1)
    .returns<DbGacha[]>();

  const gacha = gachaRows?.[0];

  if (!gacha) {
    const fallback = fallbackResult(id, repeat);
    return applyCookies(
      NextResponse.json(
        {
          ticket: fallback.ticketLabel,
          results: fallback.results,
          warning: "Fallback result used (gacha not found)",
        },
        { status: 200 }
      )
    );
  }

  const { data: balances, error: balanceError } = await supabase
    .from("user_tickets")
    .select("id, quantity, ticket_type_id")
    .eq("user_id", user.id)
    .eq("ticket_type_id", gacha.ticket_type_id)
    .limit(1)
    .maybeSingle();

  if (balanceError) {
    return applyCookies(NextResponse.json({ error: balanceError.message }, { status: 500 }));
  }

  if (!balances || balances.quantity < repeat) {
    return applyCookies(
      NextResponse.json({ error: "チケットが不足しています" }, { status: 400 })
    );
  }

  const candidates = gacha.gacha_rates
    .filter((item) => item.horses)
    .map((item) => ({
      item: item.horses,
      weight: Number(item.rate) || 0,
    }));

  const { data: animations } = await supabase
    .from("gacha_animations")
    .select(
      "id, key, name, min_rarity, max_rarity, duration_seconds, asset_url, type, is_active, sort_order, created_at"
    )
    .order("sort_order", { ascending: true });

  const results = Array.from({ length: repeat }).map(() => {
    const picked = pickWeighted(candidates) ?? FALLBACK_HORSES[0];
    const animation = resolveAnimation(picked.rarity, animations ?? []);
    return {
      horseId: picked.id,
      horse: picked.name,
      rarity: picked.rarity,
      cardImageUrl: ("card_image_url" in picked ? (picked as { card_image_url?: string | null }).card_image_url : null) ?? null,
      animation: animation.key,
      animationName: animation.name,
      animationType: animation.type,
      animationAssetUrl: animation.asset_url,
    };
  });

  // Update tickets
  const { error: updateError } = await supabase
    .from("user_tickets")
    .update({ quantity: balances.quantity - repeat })
    .eq("id", balances.id);

  if (updateError) {
    return applyCookies(NextResponse.json({ error: updateError.message }, { status: 500 }));
  }

  // Upsert collections
  const byHorse = results.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.horseId] = (acc[curr.horseId] ?? 0) + 1;
    return acc;
  }, {});

  const horseIds = Object.keys(byHorse);
  let isNewMap = new Map<string, boolean>();
  if (horseIds.length > 0) {
    const existing = await supabase
      .from("user_collections")
      .select("horse_id, quantity")
      .eq("user_id", user.id)
      .in("horse_id", horseIds);

    const currentMap = new Map<string, number>(
      existing.data?.map((row) => [row.horse_id, row.quantity ?? 0]) ?? []
    );

    isNewMap = new Map(horseIds.map((id) => [id, !currentMap.has(id)]));

    const upserts = horseIds.map((horseId) => ({
      user_id: user.id,
      horse_id: horseId,
      quantity: (currentMap.get(horseId) ?? 0) + byHorse[horseId],
      first_acquired_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("user_collections")
      .upsert(upserts, { onConflict: "user_id,horse_id" });

    if (upsertError) {
      return applyCookies(NextResponse.json({ error: upsertError.message }, { status: 500 }));
    }
  }

  const enrichedResults = results.map((r) => ({
    ...r,
    isNew: isNewMap.get(r.horseId) ?? false,
  }));

  // Insert history
  const historyRows = results.map((result) => {
    const animIndexDb = animations ? animations.findIndex((anim) => anim.key === result.animation) : -1;
    const animIndexConst = GACHA_ANIMATIONS.findIndex((anim) => anim.key === result.animation);

    return {
      user_id: user.id,
      gacha_id: gacha.id,
      horse_id: result.horseId,
      animation_type: (animIndexDb >= 0 ? animIndexDb : animIndexConst) + 1,
    };
  });

  const { error: historyError } = await supabase.from("gacha_history").insert(historyRows);
  if (historyError) {
    return applyCookies(NextResponse.json({ error: historyError.message }, { status: 500 }));
  }

  return applyCookies(
    NextResponse.json(
      {
        ticket: gacha.ticket_types.name,
        results: enrichedResults,
        remaining: balances.quantity - repeat,
      },
      { status: 200 }
    )
  );
}
