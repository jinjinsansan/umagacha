import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginBonusCard } from "@/components/home/login-bonus-card";
import { fetchGachaCatalog } from "@/lib/utils/gacha";
import { fetchTicketBalances, type TicketBalanceItem } from "@/lib/utils/tickets";
import { TicketBalanceCarousel } from "@/components/home/ticket-balance-carousel";

const FALLBACK_TICKETS: TicketBalanceItem[] = [
  { code: "free", name: "フリーチケット", quantity: 0, colorToken: "gacha-free", sortOrder: 0 },
  { code: "basic", name: "ベーシック", quantity: 0, colorToken: "gacha-basic", sortOrder: 1 },
  { code: "epic", name: "エピック", quantity: 0, colorToken: "gacha-epic", sortOrder: 2 },
  { code: "premium", name: "プレミアム", quantity: 0, colorToken: "gacha-premium", sortOrder: 3 },
  { code: "ex", name: "EX", quantity: 0, colorToken: "gacha-ex", sortOrder: 4 },
];

function formatRarity([min, max]: [number, number]) {
  return `★${min}〜${max}`;
}

export default async function HomePage() {
  const [ticketBalances, gachaTiers] = await Promise.all([
    fetchTicketBalances().catch(() => FALLBACK_TICKETS),
    fetchGachaCatalog(),
  ]);

  const tickets = ticketBalances.length > 0 ? ticketBalances : FALLBACK_TICKETS;

  return (
    <div className="space-y-8">
      <Header title="ホーム" subtitle="ログインボーナスを受け取り、好きなガチャを選択" />

      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>本日のチケット残高</span>
          <Link href="/menu" className="text-accent">
            履歴を見る
          </Link>
        </div>
        <TicketBalanceCarousel tickets={tickets} />
      </section>

      <LoginBonusCard />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">ガチャラインナップ</p>
          <Link href="/gacha" className="text-xs text-accent underline-offset-4 hover:underline">
            もっと見る
          </Link>
        </div>
        <div className="space-y-4">
          {gachaTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`bg-gradient-to-r ${tier.gradient} relative overflow-hidden`}
            >
              <CardHeader className="p-0">
                <CardTitle className="flex items-center justify-between">
                  <span className="font-serif text-2xl">{tier.name}ガチャ</span>
                  <span className="text-sm text-accent">{formatRarity(tier.rarityRange)}</span>
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-5 space-y-4 p-0">
                {tier.featuredNote && (
                  <p className="text-xs uppercase tracking-[0.3em] text-accent">{tier.featuredNote}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{tier.ticketLabel}</span>
                  <span className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {tier.priceLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/gacha/${tier.id}`}>1回ガチャ</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gacha/${tier.id}?mode=multi`}>10連ガチャ</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/gacha/${tier.id}#rates`} className="text-xs">
                      提供割合
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Button asChild className="h-14 w-full text-base">
        <Link href="/menu">
          チケット購入 <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
