import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchGachaCatalog } from "@/lib/utils/gacha";
import { LoginBonusCard } from "@/components/home/login-bonus-card";

const tickets = [
  { label: "FREE", amount: 3, color: "bg-gacha-free" },
  { label: "BASIC", amount: 5, color: "bg-gacha-basic" },
  { label: "EPIC", amount: 1, color: "bg-gacha-epic" },
  { label: "PREMIUM", amount: 0, color: "bg-gacha-premium" },
  { label: "EX", amount: 0, color: "bg-gacha-ex" },
];

function formatRarity([min, max]: [number, number]) {
  return `★${min}〜${max}`;
}

export default async function HomePage() {
  const gachaTiers = await fetchGachaCatalog();

  return (
    <div className="space-y-6">
      <Header title="ホーム" subtitle="ログインボーナスを受け取り、好きなガチャを選択" />

      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>本日のチケット残高</span>
          <Link href="/menu" className="text-accent">履歴を見る</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.label}
              className="rounded-2xl border border-border bg-background/70 px-3 py-4 text-center"
            >
              <p className="text-[0.6rem] tracking-[0.4em] text-text-muted">{ticket.label}</p>
              <p className="mt-2 text-2xl font-semibold">{ticket.amount}</p>
            </div>
          ))}
        </div>
      </section>

      <LoginBonusCard />

      <section className="space-y-3">
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
                  <span>{tier.name}ガチャ</span>
                  <span className="text-sm text-accent">{formatRarity(tier.rarityRange)}</span>
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-5 flex items-center justify-between p-0">
                <div className="text-xs text-text-muted">{tier.ticketLabel}</div>
                <Button variant="ghost" asChild>
                  <Link href={`/gacha/${tier.id}`} className="flex items-center gap-1 text-accent">
                    回す
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
