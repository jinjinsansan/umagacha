import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: rows, error: fetchError } = await supabase
    .from("friendships")
    .select("id, user_id, friend_user_id, status, requested_by, created_at")
    .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (fetchError) return applyCookies(NextResponse.json({ error: fetchError.message }, { status: 500 }));

  const friends = rows
    ?.filter((row) => row.status === "accepted")
    .map((row) => ({
      id: row.id,
      peer: row.user_id === user.id ? row.friend_user_id : row.user_id,
      since: row.created_at,
    }));

  const incoming = rows
    ?.filter((row) => row.status === "pending" && row.friend_user_id === user.id)
    .map((row) => ({ id: row.id, from: row.user_id, at: row.created_at }));

  const outgoing = rows
    ?.filter((row) => row.status === "pending" && row.user_id === user.id)
    .map((row) => ({ id: row.id, to: row.friend_user_id, at: row.created_at }));

  return applyCookies(
    NextResponse.json({ friends: friends ?? [], incoming: incoming ?? [], outgoing: outgoing ?? [] })
  );
}
