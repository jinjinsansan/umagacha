"use client";

import { useState, useTransition } from "react";
import { Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
type DrawResult = {
  horse: string;
  rarity: number;
  animation: string;
};

type PullResponse = {
  ticket: string;
  results: DrawResult[];
  remaining?: number;
  warning?: string;
  error?: string;
};

type Props = {
  gachaId: string;
};

export function GachaDrawPanel({ gachaId }: Props) {
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [results, setResults] = useState<DrawResult[]>([]);

  const runDraw = (repeat: number) => {
    setMessage(null);
    setWarning(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/gachas/${gachaId}/pull`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repeat }),
        });

        const data: PullResponse = await response.json();
        if (!response.ok || data.error) {
          setMessage(data.error ?? "抽選に失敗しました");
          setResults([]);
        } else {
          setResults(data.results ?? []);
          setMessage(`消費: ${repeat} / 残高: ${data.remaining ?? "-"}`);
          if (data.warning) setWarning(data.warning);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "エラーが発生しました");
        setResults([]);
      } finally {
        setModalOpen(true);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button className="flex-1" disabled={pending} onClick={() => runDraw(1)}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "1回ガチャ"}
        </Button>
        <Button variant="outline" className="flex-1" disabled={pending} onClick={() => runDraw(10)}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "10連ガチャ"}
        </Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="ガチャ結果">
        {message && <p className="text-sm text-text-muted mb-3">{message}</p>}
        {warning && <p className="text-xs text-amber-400 mb-2">{warning}</p>}
        {results.length === 0 ? (
          <p className="text-center text-sm text-text-muted">結果なし</p>
        ) : (
          <div className="space-y-3">
            {results.map((item, idx) => (
              <Card key={`${item.horse}-${idx}`} className="border-border/60 bg-background/70">
                <CardHeader className="p-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="font-serif">{item.horse}</span>
                    <span className="flex items-center gap-1 text-accent text-sm">
                      <Ticket className="h-4 w-4" /> ★{item.rarity}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.2em] text-text-muted">
                    演出: {item.animation}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
