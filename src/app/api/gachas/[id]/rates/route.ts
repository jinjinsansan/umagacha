import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, applyCookies } = createSupabaseRouteClient(request);

  const { data: rates, error } = await supabase
    .from("gacha_rates")
    .select("rate, horses(name, rarity), gachas!inner(ticket_types!inner(code), is_active)")
    .eq("gachas.ticket_types.code", id)
    .eq("gachas.is_active", true)
    .returns<{ rate: number; horses: { name: string; rarity: number } | null }[]>();

  if (error) return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }));

  const normalized = (rates ?? []).map((r) => ({
    name: r.horses?.name ?? "-",
    rarity: r.horses?.rarity ?? 0,
    rate: r.rate,
  }));

  return applyCookies(NextResponse.json({ rates: normalized }));
}
