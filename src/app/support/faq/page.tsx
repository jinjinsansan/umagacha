import { Header } from "@/components/layout/header";

const faqs = [
  { q: "ログインボーナスはいつリセットされますか？", a: "毎日10:00 (JST) にリセットされます。" },
  { q: "提供割合はどこで確認できますか？", a: "ガチャ詳細ページの提供割合セクションをご覧ください。" },
  { q: "フレンドにギフトを送れますか？", a: "ソーシャル画面からチケットを送付できます。" },
];

export default function FAQPage() {
  return (
    <div className="space-y-4">
      <Header title="FAQ" subtitle="よくある質問" />
      <div className="space-y-3">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-2xl border border-border bg-background/70 p-4 text-sm">
            <p className="font-semibold">Q. {item.q}</p>
            <p className="mt-2 text-text-muted">A. {item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
