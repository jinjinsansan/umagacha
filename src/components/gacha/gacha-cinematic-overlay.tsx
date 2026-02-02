"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SkipForward, Sparkles } from "lucide-react";
import type { DrawResult } from "@/components/gacha/gacha-draw-panel";

type CinematicOverlayProps = {
  open: boolean;
  results: DrawResult[];
  onFinish: () => void;
};

const PHASE_TIMINGS = [4000, 9000, 12000];

export function GachaCinematicOverlay({ open, results, onFinish }: CinematicOverlayProps) {
  const [phase, setPhase] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const highlight = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((top, current) => (current.rarity > top.rarity ? current : top), results[0]);
  }, [results]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const startTimeline = useCallback(() => {
    clearTimers();
    timersRef.current = [
      setTimeout(() => setPhase(1), PHASE_TIMINGS[0]),
      setTimeout(() => setPhase(2), PHASE_TIMINGS[1]),
      setTimeout(() => setPhase(3), PHASE_TIMINGS[2]),
    ];
  }, [clearTimers]);

  const handleFinish = useCallback(() => {
    clearTimers();
    onFinish();
  }, [clearTimers, onFinish]);

  useEffect(() => {
    if (!open) {
      clearTimers();
      return;
    }

    startTimeline();
    return clearTimers;
  }, [open, startTimeline, clearTimers]);

  const handleSkip = () => {
    clearTimers();
    setPhase(3);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80 hover:border-white hover:text-white"
            aria-label="Skip cinematic"
          >
            <SkipForward className="h-4 w-4" /> SKIP
          </button>

          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08)_0%,_transparent_70%)]"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 1.5 }}
              >
                <div className="absolute left-1/2 top-0 h-full w-1/3 -translate-x-1/2 bg-gradient-to-b from-white/30 via-transparent to-transparent blur-3xl" />
              </motion.div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 text-white">
              <motion.div
                initial={{ opacity: 0, letterSpacing: "1em" }}
                animate={{ opacity: phase >= 0 ? 1 : 0, letterSpacing: phase >= 1 ? "0.7em" : "1em" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-xs uppercase tracking-[1em] text-white/70"
              >
                {phase < 2 ? "扉が開く" : "運命の瞬間"}
              </motion.div>

              {phase < 2 ? (
                <motion.div
                  className="relative h-72 w-72 overflow-hidden rounded-full border border-white/20"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: phase >= 1 ? 1 : 0.8, opacity: phase >= 1 ? 1 : 0.5 }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="h-full w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_30%,_transparent_70%)]" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/5 px-8 py-6 backdrop-blur"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.5em] text-white/60">
                    <Sparkles className="h-4 w-4" /> RESULT
                  </div>
                  <p className="text-center font-serif text-3xl">{highlight?.horse ?? "???"}</p>
                  <p className="rounded-full border border-white/30 px-4 py-2 text-sm tracking-[0.4em]">
                    ★{highlight?.rarity ?? "-"}
                  </p>
                  {highlight?.cardImageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/20">
                      <Image
                        src={highlight.cardImageUrl}
                        alt={highlight.horse}
                        fill
                        sizes="(max-width: 768px) 80vw, 400px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="mt-4 w-full rounded-full bg-white/90 py-3 text-sm font-semibold text-black transition hover:bg-white"
                  >
                    結果を見る
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
