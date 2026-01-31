import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "五種の至高なガチャ",
    description: "フリーからEXまで、レア度に応じた演出と提供割合をシームレスに体験。",
  },
  {
    title: "50頭の名馬図鑑",
    description: "入手状況に応じたシルエット演出と詳細モーダルでコレクション魂を刺激。",
  },
  {
    title: "ソーシャル & ギフト",
    description: "フレンド、プレゼント、ログインボーナスが日次のリテンションを強化。",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 right-4 h-64 w-64 rounded-full bg-secondary/40 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary/50 blur-[200px]" />
      </div>
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-10 px-6 py-12">
        <section className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-accent">UMA ROYALE</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            重厚なガチャ体験で
            <br />
            名馬をコレクション
          </h1>
          <p className="text-sm text-text-muted">
            ダークで高級感ある演出と暗号通貨決済を備えた競馬ガチャアプリ。Supabaseとone.lat連携でスケールする基盤を提供します。
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full text-base">
              <Link href="/register">新規登録して始める</Link>
            </Button>
            <Button variant="outline" asChild className="w-full text-base">
              <Link href="/login">既存アカウントでログイン</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <ArrowUpRight className="h-4 w-4 text-accent" />
            <span>デモUI・機能を順次実装中</span>
          </div>
        </section>

        <section className="space-y-4">
          {highlights.map((highlight) => (
            <Card key={highlight.title}>
              <CardHeader className="p-0">
                <CardTitle>{highlight.title}</CardTitle>
                <CardDescription>{highlight.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4 text-xs uppercase tracking-[0.4em] text-accent">
                PREMIUM EXPERIENCE
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
