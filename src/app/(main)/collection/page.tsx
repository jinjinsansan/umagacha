import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";

const tabItems = [
  { value: "all", label: "全て" },
  { value: "owned", label: "所持" },
  { value: "missing", label: "未所持" },
];

const sections = [
  {
    title: "★10-12 伝説",
    horses: [
      { name: "ディープインパクト", status: "owned" },
      { name: "ナリタブライアン", status: "missing" },
    ],
  },
  {
    title: "★7-9 名馬",
    horses: [
      { name: "ダンスインザダーク", status: "owned" },
      { name: "エルコンドルパサー", status: "owned" },
    ],
  },
];

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <Header title="コレクション" subtitle="全50頭の進捗を確認" />

      <section className="space-y-4">
        <Input placeholder="馬名・レア度で検索" />
        <Tabs tabs={tabItems} />
        <div className="rounded-3xl border border-border bg-background/60 p-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-text-muted">コンプリート率</span>
            <span className="font-semibold">18 / 50</span>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-white/5">
            <div className="h-full rounded-full bg-accent" style={{ width: "36%" }} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs tracking-[0.4em] text-text-muted">{section.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {section.horses.map((horse) => (
                <Card
                  key={horse.name}
                  className={horse.status === "owned" ? "border-accent/40" : "border-dashed border-border/60 bg-background/40"}
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-base">{horse.name}</CardTitle>
                    <CardDescription>
                      {horse.status === "owned" ? "取得済" : "未取得"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4 p-0 text-xs text-text-muted">
                    {horse.status === "owned" ? "NEW!" : "SILHOUETTE"}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
