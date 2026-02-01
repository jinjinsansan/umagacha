import { Header } from "@/components/layout/header";

export default function SupportNewsPage() {
  return (
    <div className="space-y-4">
      <Header title="お知らせ" subtitle="最新のアップデート情報" />
      <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-text-muted">
        <p>・ガチャ提供割合をDB連携しました。</p>
        <p>・ソーシャル機能にギフト受信/送信を追加しました。</p>
        <p>・メンテナンスモード切替を管理パネルに追加しました。</p>
      </div>
    </div>
  );
}
