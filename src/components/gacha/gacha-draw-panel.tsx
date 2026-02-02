"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Loader2, Sparkles, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GachaAnimationPreview } from "@/components/gacha/gacha-animation";
type DrawResult = {
  horseId: string;
  horse: string;
  rarity: number;
  cardImageUrl?: string | null;
  animation: string;
  animationName?: string;
  animationType?: string;
  animationAssetUrl?: string | null;
  isNew?: boolean;
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

  const highlight = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((top, current) => (current.rarity > top.rarity ? current : top), results[0]);
  }, [results]);

  const secondaryResults = useMemo(() => {
    if (!highlight) return results;
    let consumed = false;
    return results.filter((item) => {
      if (!consumed && item === highlight) {
        consumed = true;
        return false;
      }
      return true;
    });
  }, [results, highlight]);

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
          toast.error(data.error ?? "抽選に失敗しました");
        } else {
          setResults(data.results ?? []);
          setMessage(`消費: ${repeat} / 残高: ${data.remaining ?? "-"}`);
          if (data.warning) setWarning(data.warning);
          toast.success(`ガチャを${repeat}回実行しました`);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "エラーが発生しました");
        setResults([]);
        toast.error(error instanceof Error ? error.message : "エラーが発生しました");
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
        {(message || warning) && (
          <div className="mb-4 space-y-1 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm">
            {message && <p className="text-text-muted">{message}</p>}
            {warning && <p className="text-xs text-amber-400">{warning}</p>}
          </div>
        )}

        {results.length === 0 ? (
          <p className="text-center text-sm text-text-muted">結果なし</p>
        ) : (
          <div className="space-y-5">
            {highlight ? (
              <div className="overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 via-background to-background">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 opacity-40">
                    <motion.div
                      className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f6d365_0%,transparent_55%)]"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>
                  <div className="relative p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-text-muted">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>SPOTLIGHT</span>
                    </div>
                    <GachaAnimationPreview
                      animation={highlight.animation}
                      type={highlight.animationType}
                      assetUrl={highlight.animationAssetUrl}
                      name={highlight.animationName ?? undefined}
                    />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">獲得</p>
                        <p className="font-serif text-2xl">{highlight.horse}</p>
                      </div>
                      <span className="rounded-full border border-accent/50 px-4 py-2 text-lg font-semibold text-accent">
                        ★{highlight.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {[highlight, ...secondaryResults].filter(Boolean).map((item, idx) => {
                if (!item) return null;
                return (
                  <motion.div
                    key={`${item.horse}-${idx}`}
                    className="rounded-2xl border border-border/70 bg-background/80 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-serif flex items-center gap-2">
                        {item.cardImageUrl ? (
                          <Image
                            src={item.cardImageUrl}
                            alt={item.horse}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-xl object-cover"
                          />
                        ) : null}
                        {item.horse}
                      </span>
                      <span className="flex items-center gap-1 text-accent text-xs">
                        <Ticket className="h-3.5 w-3.5" /> ★{item.rarity}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.7rem] uppercase tracking-[0.3em] text-text-muted">
                      {item.animationName ?? item.animation}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
