import { NextResponse, type NextRequest } from "next/server";
import { GACHA_DEFINITIONS } from "@/constants/gacha";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import type { Database } from "@/types/database";

type DbGacha = Database["public"]["Tables"]["gachas"]["Row"] & {
  ticket_types: Pick<Database["public"]["Tables"]["ticket_types"]["Row"], "name" | "code" | "color">;
};

function mapDbToDefinition(gacha: DbGacha) {
  const code = (gacha.ticket_types.code ?? "").toLowerCase() as (typeof GACHA_DEFINITIONS)[number]["id"];
  return {
    id: code,
    name: gacha.name,
    rarityRange: [gacha.min_rarity, gacha.max_rarity] as [number, number],
    ticketLabel: gacha.ticket_types.name,
    description: "", // Optional: extend with column when available
    priceLabel: "",
    gradient: "from-background to-background",
    rates: [],
  };
}

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);

  const { data, error } = await supabase
    .from("gachas")
    .select("*, ticket_types(name, code, color)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return applyCookies(NextResponse.json({ gachas: GACHA_DEFINITIONS }, { status: 200 }));
  }

  const mapped = ((data ?? []) as DbGacha[]).map(mapDbToDefinition);
  const payload = mapped.length > 0 ? mapped : GACHA_DEFINITIONS;
  return applyCookies(NextResponse.json({ gachas: payload }, { status: 200 }));
}
