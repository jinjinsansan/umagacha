"use client";

import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type BonusState = {
  status: "idle" | "success" | "error" | "claimed";
  message?: string;
  nextResetAt?: string;
};

export function LoginBonusCard() {
  const [claiming, setClaiming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [state, setState] = useState<BonusState>({ status: "idle" });

  useEffect(() => {
    let mounted = true;
    fetch("/api/tickets/bonus")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
        return data;
      })
      .then((data) => {
        if (!mounted) return;
        if (data.claimed) {
          setState({ status: "claimed", nextResetAt: data.nextResetAt });
        }
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const response = await fetch("/api/tickets/bonus", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "取得に失敗しました");
      }
      setState({ status: "success", message: data.message, nextResetAt: data.nextResetAt });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "予期せぬエラー" });
    } finally {
      setClaiming(false);
      setModalOpen(true);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/70 to-background">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-accent" />
            本日のログインボーナス
          </CardTitle>
          <CardDescription>1日1回のフリーチケット。10:00にリセット予定。</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex items-center justify-between p-0">
          <div>
            <p className="text-4xl font-serif">+1</p>
            <p className="text-sm text-text-muted">FREE TICKET</p>
          </div>
          <Button
            variant="gold"
            className="px-6"
            onClick={handleClaim}
            disabled={claiming || state.status === "claimed"}
          >
            {state.status === "claimed" ? "受取済" : claiming ? "付与中..." : "受け取る"}
          </Button>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="ログインボーナス">
        {state.status === "success" || state.status === "claimed" ? (
          <div className="space-y-3 text-center">
            <p className="text-4xl font-serif text-accent">+1</p>
            <p className="text-sm text-text-muted">{state.message ?? "フリーチケットを付与しました"}</p>
            {state.nextResetAt && (
              <p className="text-xs text-text-muted/70">
                次回受取: {new Date(state.nextResetAt).toLocaleString("ja-JP")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-red-400">
            {state.message ?? "エラーが発生しました"}
          </p>
        )}
      </Modal>
    </>
  );
}
