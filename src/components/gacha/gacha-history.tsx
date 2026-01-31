"use client";

import { useEffect, useState } from "react";
import { Clock, History } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HistoryEntry = {
  id: string;
  created_at: string;
  animation_type: number | null;
  horses: { name: string; rarity: number } | null;
  gachas: { name: string; ticket_types: { code: string; name: string } | null } | null;
};

type Props = {
  title?: string;
  limit?: number;
};

export function GachaHistory({ title = "最近の結果", limit = 10 }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/gacha/history")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
        return data.history as HistoryEntry[];
      })
      .then((items) => {
        if (mounted) setHistory(items.slice(0, limit));
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
  }, [limit]);

  return (
    <Card className="border-border/60 bg-background/70">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-accent" /> {title}
        </CardTitle>
        <CardDescription className="text-xs text-text-muted">
          直近 {history.length} 件の履歴を表示
        </CardDescription>
      </CardHeader>
      <div className="divide-y divide-border/50">
        {error ? (
          <div className="px-3 py-2 text-xs text-red-400">{error}</div>
        ) : history.length === 0 ? (
          <div className="px-3 py-2 text-xs text-text-muted">履歴がありません</div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="px-3 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-serif">{entry.horses?.name ?? "-"}</span>
                <span className="text-accent text-xs">★{entry.horses?.rarity ?? "-"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[0.75rem] text-text-muted">
                <span>
                  {entry.gachas?.name ?? ""} ({entry.gachas?.ticket_types?.code ?? ""})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(entry.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
