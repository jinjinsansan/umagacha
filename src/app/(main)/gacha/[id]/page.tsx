import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  params: Promise<{ id: string }>;
};

function formatRarity(range: [number, number]) {
  return `★${range[0]}〜${range[1]}`;
}

export default async function GachaDetailPage({ params }: Params) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.id;
  const requestedSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!requestedSlug || typeof requestedSlug !== "string") {
    notFound();
  }

  const canonicalSlug = canonicalizeGachaId(requestedSlug);
  const searchKey = canonicalSlug ?? buildGachaSearchKey(requestedSlug) ?? requestedSlug.toLowerCase();

  const catalog = await fetchGachaCatalog().catch(() => GACHA_DEFINITIONS);

  const detail = catalog.find((item) => gachaIdMatches(item.id, searchKey))
    ?? GACHA_DEFINITIONS.find((item) => gachaIdMatches(item.id, searchKey));

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

      <GachaHistory title="直近のガチャ履歴" limit={10} />
    </div>
  );
}
