"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(auth)/actions";

export default function MenuPage() {
  const [notify, setNotify] = useState(() =>
    typeof window === "undefined" ? false : localStorage.getItem("uma_notify") === "1"
  );
  const [bgm, setBgm] = useState(() =>
    typeof window === "undefined" ? true : localStorage.getItem("uma_bgm") !== "0"
  );

  useEffect(() => {
    localStorage.setItem("uma_notify", notify ? "1" : "0");
  }, [notify]);

  useEffect(() => {
    localStorage.setItem("uma_bgm", bgm ? "1" : "0");
  }, [bgm]);

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    setNotify(false);
    setBgm(true);
    toast.success("キャッシュを削除しました");
  };

  return (
    <div className="space-y-6">
      <Header title="メニュー" subtitle="設定やサポートを参照" />

      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-xs tracking-[0.4em] text-text-muted">アカウント</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>通知設定</span>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                ON/OFF
              </label>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>ログアウト</span>
              <form action={signOutAction}>
                <Button type="submit" size="sm" variant="ghost">
                  サインアウト
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs tracking-[0.4em] text-text-muted">サポート</p>
          <div className="mt-4 space-y-3 text-sm">
            <Link href="/support/news" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>お知らせ</span>
              <span className="text-text-muted">開く</span>
            </Link>
            <Link href="/support/faq" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>FAQ</span>
              <span className="text-text-muted">開く</span>
            </Link>
            <Link href="/support/terms" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>利用規約</span>
              <span className="text-text-muted">開く</span>
            </Link>
            <Link href="/support/law" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>特商法表記</span>
              <span className="text-text-muted">開く</span>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs tracking-[0.4em] text-text-muted">その他</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>BGM</span>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" checked={bgm} onChange={(e) => setBgm(e.target.checked)} />
                ON/OFF
              </label>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>キャッシュ削除</span>
              <Button size="sm" variant="ghost" onClick={handleClearCache}>
                削除
              </Button>
            </div>
            <Link href="/gacha" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>提供割合</span>
              <span className="text-text-muted">開く</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
