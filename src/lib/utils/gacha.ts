import type { GachaDefinition } from "@/constants/gacha";
import { resolveApiUrl } from "@/lib/utils/api";

export async function fetchGachaCatalog(): Promise<GachaDefinition[]> {
  const endpoint = resolveApiUrl("/api/gachas");
  const response = await fetch(endpoint, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error("ガチャ一覧の取得に失敗しました");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data?.gachas ?? [];
}

export async function pullGacha(id: string) {
  const endpoint = resolveApiUrl(`/api/gachas/${id}/pull`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ repeat: 1 }),
  });

  if (!response.ok) {
    throw new Error("ガチャの実行に失敗しました");
  }

  return response.json();
}
