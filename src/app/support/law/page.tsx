import { Header } from "@/components/layout/header";

export default function LawPage() {
  return (
    <div className="space-y-4">
      <Header title="特定商取引法に基づく表示" subtitle="販売事業者情報" />
      <div className="space-y-2 rounded-2xl border border-border bg-background/70 p-4 text-sm text-text-muted">
        <p>販売事業者: UMA ROYALE Inc.</p>
        <p>所在地: 東京都渋谷区（仮）</p>
        <p>連絡先: support@example.com</p>
        <p>販売価格: 各購入画面に表示</p>
        <p>支払方法: one.lat決済（実装予定）</p>
        <p>返品/キャンセル: デジタルコンテンツのため不可</p>
      </div>
    </div>
  );
}
