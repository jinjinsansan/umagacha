import Link from "next/link";
import { Sparkles, Video, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { GACHA_ANIMATIONS } from "@/constants/gacha";
import { fetchGachaCatalog } from "@/lib/utils/gacha";

const categories = [
  { value: "spot", label: "ピックアップ" },
  { value: "limited", label: "限定" },
  { value: "ex", label: "EX" },
];

export default async function GachaHubPage() {
  const catalog = await fetchGachaCatalog();
  const featured = catalog.filter((gacha) => gacha.featuredNote).slice(0, 3);

  return (
    <div className="space-y-6">
      <Header title="ガチャ" subtitle="提供割合と演出を確認" />

      <Tabs tabs={categories} />

      <section className="space-y-4">
        {featured.map((item) => (
          <Card key={item.id} className="bg-gradient-to-br from-secondary/40 to-background">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center justify-between">
                <span className="font-serif text-2xl">{item.name}ガチャ</span>
                <span className="text-xs text-accent">{item.featuredNote}</span>
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-5 flex items-center justify-between p-0 text-sm">
              <span className="flex items-center gap-2 text-text-muted">
                <Sparkles className="h-4 w-4 text-accent" />演出強化中
              </span>
              <Link href={`/gacha/${item.id}`} className="text-accent underline-offset-4 hover:underline">
                詳細を見る
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4 text-accent" /> ガチャ演出バリエーション
          </CardTitle>
          <CardDescription>Framer Motionで4種類の演出を切替予定。</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 grid gap-3 p-0 text-sm">
          {GACHA_ANIMATIONS.map((animation) => (
            <div key={animation.key} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>{animation.name}</span>
              <span className="text-text-muted">{animation.duration}s</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/60 to-background">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-accent" /> 即時スキップ設定
          </CardTitle>
          <CardDescription>次回演出をスキップするトグルを実装予定です。</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
