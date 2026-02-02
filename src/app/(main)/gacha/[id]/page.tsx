import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GachaAnimationPreview } from "@/components/gacha/gacha-animation";
import { GachaDrawPanel } from "@/components/gacha/gacha-draw-panel";
import { GachaHistory } from "@/components/gacha/gacha-history";
import {
  buildGachaSearchKey,
  canonicalizeGachaId,
  fetchGachaCatalog,
  gachaIdMatches,
} from "@/lib/utils/gacha";
import { GACHA_DEFINITIONS } from "@/constants/gacha";

type Params = {
  params: { id: string };
};

function formatRarity(range: [number, number]) {
  return `★${range[0]}〜${range[1]}`;
}

function selectAnimation(range: [number, number]) {
  const max = range[1];
  if (max >= 10) return "arima" as const;
  if (max >= 7) return "birth" as const;
  if (max <= 3) return "stables" as const;
  return "g1" as const;
}

export default async function GachaDetailPage({ params }: Params) {
  console.log("[gacha-detail] ========== START ==========");
  console.log("[gacha-detail] Raw params:", JSON.stringify(params, null, 2));
  
  type RateRow = { name: string; rarity: number; rate: number };

  const slugParam = params.id;
  console.log("[gacha-detail] slugParam:", slugParam, "type:", typeof slugParam);
  
  const requestedSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  console.log("[gacha-detail] requestedSlug:", requestedSlug);
  
  if (!requestedSlug || typeof requestedSlug !== "string") {
    console.error("[gacha-detail] NOTFOUND #1: Invalid requestedSlug");
    notFound();
  }
  
  const canonicalSlug = canonicalizeGachaId(requestedSlug);
  console.log("[gacha-detail] canonicalSlug:", canonicalSlug);
  
  const apiSlug = canonicalSlug ?? requestedSlug.toLowerCase();
  console.log("[gacha-detail] apiSlug:", apiSlug);
  
  const ratesEndpointSlug = encodeURIComponent(apiSlug);
  const searchKey = canonicalSlug ?? buildGachaSearchKey(requestedSlug) ?? apiSlug;
  console.log("[gacha-detail] searchKey:", searchKey);

  const catalogPromise = fetchGachaCatalog().catch((error) => {
    console.error("[gacha-detail] Failed to fetch catalog, falling back to defaults", error);
    return GACHA_DEFINITIONS;
  });
  const ratesPromise = fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/gachas/${ratesEndpointSlug}/rates`,
    {
      cache: "no-store",
    }
  ).then(async (res) => res.json().catch(() => ({ rates: [] })));

  const [catalog, ratesResp] = await Promise.all([catalogPromise, ratesPromise]);
  console.log("[gacha-detail] catalog count:", catalog.length);
  console.log("[gacha-detail] catalog IDs:", catalog.map((item) => item.id));

  const detail = catalog.find((item) => {
    const matches = gachaIdMatches(item.id, searchKey);
    console.log(`[gacha-detail] Checking ${item.id} vs ${searchKey}: ${matches}`);
    return matches;
  }) ?? GACHA_DEFINITIONS.find((item) => {
    const matches = gachaIdMatches(item.id, searchKey);
    console.log(`[gacha-detail] [FALLBACK] Checking ${item.id} vs ${searchKey}: ${matches}`);
    return matches;
  });

  console.log("[gacha-detail] detail found:", !!detail, detail ? `id=${detail.id}` : "NONE");

  if (!detail) {
    console.error("[gacha-detail] NOTFOUND #2: Failed to resolve gacha detail", {
      requestedSlug,
      searchKey,
      catalogIds: catalog.map((item) => item.id),
      fallbackIds: GACHA_DEFINITIONS.map((item) => item.id),
    });
    notFound();
  }

  const resolvedGachaId = canonicalizeGachaId(detail.id) ?? detail.id;

  return (
    <div className="space-y-6">
      <Header
        title={`${detail.name}ガチャ`}
        subtitle={`${detail.ticketLabel} / ${formatRarity(detail.rarityRange)}`}
      />

      <Card className="bg-gradient-to-r from-secondary/40 to-background">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-serif">{detail.ticketLabel}</CardTitle>
          <CardDescription>価格: {detail.priceLabel}</CardDescription>
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <GachaDrawPanel gachaId={resolvedGachaId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-0">
          <CardTitle>提供割合</CardTitle>
          <CardDescription>DBに登録された提供割合を表示します。</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0">
          {ratesResp?.rates?.length ? (
            (() => {
              const items = (ratesResp.rates as RateRow[]).sort((a, b) => b.rarity - a.rarity || b.rate - a.rate);
              const total = items.reduce((sum, r) => sum + Number(r.rate || 0), 0);
              return (
                <>
                  <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-xs text-text-muted">
                    <span>合計</span>
                    <span className={total === 100 ? "text-accent" : "text-amber-400"}>{total}</span>
                  </div>
                  {items.map((rate, idx) => (
                    <div
                      key={`${rate.name}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"
                    >
                      <span>
                        {rate.name} (★{rate.rarity})
                      </span>
                      <span className="font-semibold text-accent">{rate.rate}</span>
                    </div>
                  ))}
                </>
              );
            })()
          ) : (
            <p className="text-sm text-text-muted">提供割合が未登録です</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-0">
          <CardTitle>演出</CardTitle>
          <CardDescription>レア度別に4パターンを切り替えます。</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 grid gap-3 p-0 text-sm text-text-muted">
          <p>★1-3: 厩舎トレーニング (4s)</p>
          <p>★4-6: G1レーススタート (5s)</p>
          <p>★7-9: 名馬の誕生 (6s)</p>
          <p>★10-12: 有馬記念フィナーレ (8s)</p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <GachaAnimationPreview animation={selectAnimation(detail.rarityRange)} />
      </Card>

      <GachaHistory title="直近のガチャ履歴" limit={10} />
    </div>
  );
}
