"use client";

import { useEffect, useState } from "react";
import { Users2, Gift } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type FriendList = {
  friends: { id: string; peer: string; since: string | null }[];
  incoming: { id: string; from: string; at: string | null }[];
  outgoing: { id: string; to: string; at: string | null }[];
};

type GiftItem = {
  id: string;
  type: string;
  ticket_types?: { code?: string | null; name?: string | null } | null;
  horses?: { name?: string | null; rarity?: number | null } | null;
  quantity: number;
  status: string;
  created_at: string | null;
  from_user_id: string;
  to_user_id: string;
};

export function SocialPanel() {
  const [list, setList] = useState<FriendList | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toUser, setToUser] = useState("");
  const [giftTo, setGiftTo] = useState("");
  const [giftTicket, setGiftTicket] = useState("");
  const [giftQty, setGiftQty] = useState(1);
  const [incomingGifts, setIncomingGifts] = useState<GiftItem[]>([]);
  const [outgoingGifts, setOutgoingGifts] = useState<GiftItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; email: string | null }[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/social/friends")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
          return data as FriendList;
        })
        .then((data) => setList(data))
        .catch((e: Error) => setErr(e.message)),
      fetch("/api/social/gifts")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
          return data as { incoming: GiftItem[]; outgoing: GiftItem[] };
        })
        .then((data) => {
          setIncomingGifts(data.incoming ?? []);
          setOutgoingGifts(data.outgoing ?? []);
        })
        .catch((e: Error) => setErr(e.message)),
    ]).finally(() => setLoading(false));
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
      toast.success("フレンド申請を送信しました");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
      toast.error(e instanceof Error ? e.message : "エラー");
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
      toast.success(action === "accept" ? "承認しました" : "拒否しました");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
      toast.error(e instanceof Error ? e.message : "エラー");
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
      load();
      toast.success("ギフトを送信しました");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラー");
      toast.error(e instanceof Error ? e.message : "エラー");
    }
  };

  const searchUsers = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/social/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.users ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="メールアドレスで検索"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1 rounded-2xl border border-border p-2">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setToUser(u.id);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left rounded-lg px-2 py-1 text-xs text-text-muted hover:bg-border/20"
                  >
                    {u.email}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="ユーザーID (または検索から選択)"
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="text-base">受信ギフト</CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0 text-sm">
          {incomingGifts.length === 0 ? (
            <p className="text-text-muted text-xs">受信ギフトなし</p>
          ) : (
            incomingGifts.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{g.type === "ticket" ? g.ticket_types?.code : g.horses?.name}</span>
                  <span className="text-xs text-text-muted">x{g.quantity}</span>
                </div>
                <p className="text-[0.75rem] text-text-muted">from: {g.from_user_id}</p>
                <div className="mt-2 flex gap-2">
                  {g.status === "sent" ? (
                    <>
                      <Button size="sm" onClick={() => respond(g.id, "accept")}>
                        受け取る
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => respond(g.id, "decline")}>
                        拒否
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-text-muted">{g.status}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="text-base">送信ギフト</CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-3 p-0 text-sm">
          {outgoingGifts.length === 0 ? (
            <p className="text-text-muted text-xs">送信ギフトなし</p>
          ) : (
            outgoingGifts.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{g.type === "ticket" ? g.ticket_types?.code : g.horses?.name}</span>
                  <span className="text-xs text-text-muted">x{g.quantity}</span>
                </div>
                <p className="text-[0.75rem] text-text-muted">to: {g.to_user_id}</p>
                <p className="text-[0.7rem] text-text-muted">status: {g.status}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
