import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "アカウント",
    items: ["マイページ", "通知設定", "ログイン設定"],
  },
  {
    title: "サポート",
    items: ["お知らせ", "FAQ", "利用規約", "特商法表記"],
  },
  {
    title: "その他",
    items: ["提供割合", "BGM ON/OFF", "キャッシュ削除", "ログアウト"],
  },
];

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <Header title="メニュー" subtitle="設定やサポートを参照" />

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-4">
            <p className="text-xs tracking-[0.4em] text-text-muted">{section.title}</p>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                  <span>{item}</span>
                  <Button variant="ghost" size="sm">
                    開く
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
