"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CollectionItem = {
  horse_id: string;
  quantity: number;
  first_acquired_at: string | null;
  horses: {
    id: string;
    name: string;
    rarity: number;
    description: string | null;
    card_image_url: string | null;
  } | null;
};

type ApiResponse = {
  totalOwned: number;
  distinctOwned: number;
  totalAvailable: number;
  collection: CollectionItem[];
  horses: {
    id: string;
    name: string;
    rarity: number;
    card_image_url: string | null;
  }[];
};

const rarityLabel = (rarity: number) => `★${rarity}`;

export function CollectionList() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<"rarity" | "name">("rarity");

  useEffect(() => {
    let mounted = true;
    fetch("/api/collection")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "取得に失敗しました");
        return json as ApiResponse;
      })
      .then((payload) => {
        if (mounted) setData(payload);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const list = data.collection;
    const lower = keyword.toLowerCase();
    const filteredItems = list.filter((item) => {
      const name = item.horses?.name?.toLowerCase() ?? "";
      return name.includes(lower);
    });

    if (sort === "rarity") {
      return filteredItems.sort((a, b) => (b.horses?.rarity ?? 0) - (a.horses?.rarity ?? 0));
    }
    return filteredItems.sort((a, b) => (a.horses?.name ?? "").localeCompare(b.horses?.name ?? ""));
  }, [data, keyword, sort]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-text-muted">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-background/70">
        <CardHeader className="p-3">
          <CardTitle className="text-base">コレクション進捗</CardTitle>
          <CardDescription className="text-xs text-text-muted">
            所持: {data.distinctOwned} / {data.totalAvailable} （枚数合計: {data.totalOwned}）
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="pl-8"
            placeholder="名前で検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "rarity" | "name")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="rarity">レア度順</option>
          <option value="name">名前順</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">該当するカードがありません</p>
        ) : (
          filtered.map((item) => {
            const horse = item.horses;
            if (!horse) return null;
            return (
              <Card key={item.horse_id} className="border-border/60 bg-background/70">
                <CardContent className="flex items-center gap-3 p-3">
                  {horse.card_image_url ? (
                    <Image
                      src={horse.card_image_url}
                      alt={horse.name}
                      width={72}
                      height={72}
                      className="h-18 w-18 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-18 w-18 items-center justify-center rounded-xl bg-muted/20 text-xs text-text-muted">
                      No Image
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-serif text-lg">{horse.name}</p>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-muted">
                        {rarityLabel(horse.rarity)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{horse.description ?? ""}</p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>所持: {item.quantity}</span>
                      {item.first_acquired_at && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Sparkles className="h-3 w-3" /> NEW
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
