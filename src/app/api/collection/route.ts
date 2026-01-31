import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: collectionError } = await supabase
    .from("user_collections")
    .select(
      `horse_id, quantity, first_acquired_at,
       horses (id, name, rarity, description, card_image_url)
      `
    )
    .eq("user_id", user.id)
    .order("horses(rarity)", { ascending: false });

  if (collectionError) {
    return applyCookies(NextResponse.json({ error: collectionError.message }, { status: 500 }));
  }

  const totalOwned = data?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  const distinctOwned = data?.length ?? 0;

  // 全馬数（所持以外も含めて進捗用）
  const { data: allHorses } = await supabase
    .from("horses")
    .select("id, name, rarity, card_image_url")
    .order("rarity", { ascending: false });

  return applyCookies(
    NextResponse.json({
      totalOwned,
      distinctOwned,
      totalAvailable: allHorses?.length ?? 0,
      collection: data ?? [],
      horses: allHorses ?? [],
    })
  );
}
