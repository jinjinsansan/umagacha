import { Users2, Gift } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const friendTabs = [
  { value: "friends", label: "フレンド" },
  { value: "requests", label: "申請" },
  { value: "pending", label: "承認待ち" },
];

const friends = [
  { name: "UMR-8391", status: "オンライン" },
  { name: "JPN-1024", status: "3時間前" },
];

const requests = [
  { name: "TOK-7788", message: "コレクション交換希望" },
];

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <Header title="ソーシャル" subtitle="フレンドとカードを共有" />

      <Tabs tabs={friendTabs} />

      <section className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users2 className="h-4 w-4 text-accent" /> フレンド {friends.length}/100
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
              フレンド追加
            </Button>
          </CardHeader>
          <CardContent className="mt-4 space-y-3 p-0">
            {friends.map((friend) => (
              <div key={friend.name} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-xs text-text-muted">{friend.status}</p>
                </div>
                <Button variant="outline" size="sm">
                  プレゼント
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4 text-accent" /> 申請/プレゼント
            </CardTitle>
            <span className="text-xs text-text-muted">{requests.length}件</span>
          </CardHeader>
          <CardContent className="mt-4 space-y-3 p-0">
            {requests.map((request) => (
              <div key={request.name} className="rounded-2xl border border-border px-4 py-3">
                <p className="font-semibold">{request.name}</p>
                <p className="text-xs text-text-muted">{request.message}</p>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" className="flex-1">
                    承認
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1">
                    拒否
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
