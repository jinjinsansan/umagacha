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
import { buildGachaSearchKey, canonicalizeGachaId, fetchGachaCatalog } from "@/lib/utils/gacha";
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
  type RateRow = { name: string; rarity: number; rate: number };

  const requestedSlug = params.id;
  if (!requestedSlug || typeof requestedSlug !== "string") {
    notFound();
  }
  const apiSlug = canonicalizeGachaId(requestedSlug) ?? requestedSlug.toLowerCase();
  const ratesEndpointSlug = encodeURIComponent(apiSlug);
  const searchKey = buildGachaSearchKey(requestedSlug) ?? apiSlug;

  const [catalog, ratesResp] = await Promise.all([
    fetchGachaCatalog(),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/gachas/${ratesEndpointSlug}/rates`, {
      cache: "no-store",
    }).then(async (res) => res.json().catch(() => ({ rates: [] }))),
  ]);

  const detail = catalog.find((item) => buildGachaSearchKey(item.id) === searchKey)
    ?? GACHA_DEFINITIONS.find((item) => buildGachaSearchKey(item.id) === searchKey);

  if (!detail) {
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
