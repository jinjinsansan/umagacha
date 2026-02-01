"use client";

import { useEffect, useState } from "react";
import { Users2, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FriendList = {
  friends: { id: string; peer: string; since: string | null }[];
  incoming: { id: string; from: string; at: string | null }[];
  outgoing: { id: string; to: string; at: string | null }[];
};

export function SocialPanel() {
  const [list, setList] = useState<FriendList | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toUser, setToUser] = useState("");
  const [giftTo, setGiftTo] = useState("");
  const [giftTicket, setGiftTicket] = useState("");
  const [giftQty, setGiftQty] = useState(1);

  const load = () => {
    fetch("/api/social/friends")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
        return data as FriendList;
      })
      .then((data) => setList(data))
      .catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const request = async () => {
    try {
      const res = await fetch("/api/social/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: toUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "申請に失敗しました");
      setToUser("");
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
    }
  };

  const respond = async (id: string, action: "accept" | "decline") => {
    try {
      const res = await fetch("/api/social/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "処理に失敗しました");
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
    }
  };

  const sendGift = async () => {
    try {
      const res = await fetch("/api/social/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: giftTo, type: "ticket", ticketCode: giftTicket, quantity: giftQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "送付に失敗しました");
      setGiftTo("");
      setGiftTicket("");
      setGiftQty(1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
    }
  };

  return (
    <div className="space-y-4">
      {err && <p className="text-sm text-red-400">{err}</p>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users2 className="h-4 w-4 text-accent" /> フレンド
          </CardTitle>
          <span className="text-xs text-text-muted">{list?.friends.length ?? 0}人</span>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0">
          {list?.friends?.length ? (
            list.friends.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="font-semibold">{f.peer}</p>
                  <p className="text-xs text-text-muted">since: {f.since ? new Date(f.since).toLocaleString("ja-JP") : "-"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-muted">フレンドがいません</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="text-base">申請</CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0 text-sm">
          <div className="flex gap-2">
            <Input
              placeholder="ユーザーID"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
            />
            <Button onClick={request} disabled={!toUser} size="sm">
              申請
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-text-muted">受信</p>
            {list?.incoming?.length ? (
              list.incoming.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                  <div>
                    <p className="font-semibold">{req.from}</p>
                    <p className="text-[0.7rem] text-text-muted">{req.at ? new Date(req.at).toLocaleString("ja-JP") : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => respond(req.id, "accept")}>承認</Button>
                    <Button size="sm" variant="ghost" onClick={() => respond(req.id, "decline")}>
                      拒否
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted">受信申請なし</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-text-muted">送信</p>
            {list?.outgoing?.length ? (
              list.outgoing.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                  <div>
                    <p className="font-semibold">{req.to}</p>
                    <p className="text-[0.7rem] text-text-muted">{req.at ? new Date(req.at).toLocaleString("ja-JP") : ""}</p>
                  </div>
                  <span className="text-xs text-text-muted">保留中</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted">送信申請なし</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4 text-accent" /> プレゼント（チケット）
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0 text-sm">
          <div className="grid gap-2">
            <Input placeholder="送り先ユーザーID" value={giftTo} onChange={(e) => setGiftTo(e.target.value)} />
            <Input placeholder="チケットコード (free/basic/...)" value={giftTicket} onChange={(e) => setGiftTicket(e.target.value)} />
            <Input
              type="number"
              min={1}
              value={giftQty}
              onChange={(e) => setGiftQty(Number(e.target.value) || 1)}
            />
            <Button onClick={sendGift} disabled={!giftTo || !giftTicket || giftQty <= 0}>
              送る
            </Button>
          </div>
          <p className="text-[0.75rem] text-text-muted">※ 馬カードの贈答は後続UIで対応予定</p>
        </CardContent>
      </Card>
    </div>
  );
}
