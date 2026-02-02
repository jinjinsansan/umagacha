import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import { canonicalizeGachaId, gachaIdMatches } from "@/lib/utils/gacha";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolvedSlug = canonicalizeGachaId(id) ?? id.toLowerCase();
  const { supabase, applyCookies } = createSupabaseRouteClient(request);

  const { data: gachas, error: gachaError } = await supabase
    .from("gachas")
    .select("id, name, ticket_types(name, code)")
    .eq("is_active", true);

  if (gachaError) {
    return applyCookies(NextResponse.json({ error: gachaError.message }, { status: 500 }));
  }

  const target = (gachas ?? []).find((entry) => {
    const identifiers = [entry.ticket_types?.code, entry.ticket_types?.name, entry.name, entry.id];
    return identifiers.some((candidate) => gachaIdMatches(candidate ?? null, resolvedSlug));
  });

  if (!target) {
    return applyCookies(NextResponse.json({ rates: [] }, { status: 200 }));
  }

  const { data: rates, error } = await supabase
    .from("gacha_rates")
    .select("rate, horses(name, rarity)")
    .eq("gacha_id", target.id)
    .returns<{ rate: number; horses: { name: string; rarity: number } | null }[]>();

  if (error) return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }));

  const normalized = (rates ?? []).map((r) => ({
    name: r.horses?.name ?? "-",
    rarity: r.horses?.rarity ?? 0,
    rate: r.rate,
  }));

  return applyCookies(NextResponse.json({ rates: normalized }));
}
