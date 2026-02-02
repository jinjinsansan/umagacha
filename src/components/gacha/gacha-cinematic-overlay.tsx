"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SkipForward } from "lucide-react";
import type { DrawResult } from "@/components/gacha/gacha-draw-panel";

type CinematicOverlayProps = {
  open: boolean;
  results: DrawResult[];
  onFinish: () => void;
  videoSources?: {
    src: string;
    type?: string;
    media?: string;
  }[];
  posterSrc?: string;
  audioSrc?: string;
  primedAudio?: HTMLAudioElement;
};

type Phase = "video" | "fade" | "result";

const FADE_DURATION = 800;
const DEFAULT_VIDEO_SOURCES = [
  { src: "/animations/gacha/uma-cinematic-1.mp4", type: "video/mp4" },
];
const DEFAULT_AUDIO = "/animations/gacha/uma-cinematic-1.m4a";
const VIDEO_PREFETCH_LIST = [
  "/animations/gacha/uma-cinematic-1.mp4",
  "/animations/gacha/uma-cinematic-1-mobile.mp4",
];

export function GachaCinematicOverlay({
  open,
  results,
  onFinish,
  videoSources = DEFAULT_VIDEO_SOURCES,
  posterSrc,
  audioSrc,
  primedAudio,
}: CinematicOverlayProps) {
  const [phase, setPhase] = useState<Phase>("video");
  const [fadeProgress, setFadeProgress] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const highlight = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((top, current) => (current.rarity > top.rarity ? current : top), results[0]);
  }, [results]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const stopAudio = useCallback(() => {
    const media = audioRef.current;
    if (!media) return;
    media.pause();
    media.currentTime = 0;
    audioRef.current = null;
  }, []);

  const startFade = useCallback(() => {
    if (phase !== "video") return;
    setPhase("fade");
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      setFadeProgress(progress);
      if (progress < 1) {
        timersRef.current.push(setTimeout(tick, 16));
      } else {
        setPhase("result");
      }
    };
    tick();
  }, [phase, setFadeProgress]);

  const handleFinish = useCallback(() => {
    clearTimers();
    stopAudio();
    videoRef.current?.pause();
    onFinish();
  }, [clearTimers, stopAudio, onFinish]);

  useEffect(() => {
    if (!open) return;
    const usingPrimed = Boolean(primedAudio);
    const media = (() => {
      if (primedAudio) return primedAudio;
      const created = new Audio(audioSrc ?? DEFAULT_AUDIO);
      created.loop = false;
      created.volume = 0.85;
      return created;
    })();
    media.currentTime = 0;
    const playPromise = media.play();
    if (playPromise) {
      playPromise.catch(() => null);
    }
    audioRef.current = media;
    return () => {
      if (!usingPrimed) {
        media.pause();
      }
    };
  }, [open, audioSrc, primedAudio]);

  useEffect(() => {
    const links = VIDEO_PREFETCH_LIST.map((url) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = url;
      link.crossOrigin = "anonymous";
      link.dataset.prefetchTarget = "gacha-cinematic";
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => link.parentNode?.removeChild(link));
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!open) {
      clearTimers();
      stopAudio();
      video?.pause();
      return;
    }

    const frame = requestAnimationFrame(() => {
      setPhase("video");
      setFadeProgress(0);
    });

    return () => {
      cancelAnimationFrame(frame);
      clearTimers();
      stopAudio();
      video?.pause();
    };
  }, [open, clearTimers, stopAudio]);

  const handleSkip = () => {
    if (phase === "result") return;
    clearTimers();
    stopAudio();
    const video = videoRef.current;
    if (video) {
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      if (duration && duration > 0) {
        video.currentTime = Math.max(duration - 0.3, 0);
      }
      video.pause();
    }
    startFade();
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <video
            key={videoSources.map((source) => source.src).join("|")}
            ref={videoRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain md:object-cover bg-black"
            playsInline
            autoPlay
            muted
            preload="auto"
            poster={posterSrc}
            onEnded={startFade}
          >
            {videoSources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} media={source.media} />
            ))}
          </video>

          <motion.div
            className="pointer-events-none absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "fade" ? fadeProgress : phase === "result" ? 1 : 0 }}
          />

          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80 hover:border-white hover:text-white"
            aria-label="Skip cinematic"
          >
            <SkipForward className="h-4 w-4" /> SKIP
          </button>

          {phase === "result" ? (
            <div className="relative z-20 flex h-full flex-col items-center justify-center bg-black/95">
              <motion.div
                className="flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-sm uppercase tracking-[0.6em] text-white/60">結果</p>
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="font-serif text-4xl">{highlight?.horse ?? "???"}</p>
                  <span className="rounded-full border border-white/30 px-6 py-2 text-lg tracking-[0.4em]">
                    ★{highlight?.rarity ?? "-"}
                  </span>
                </div>
                {highlight?.cardImageUrl ? (
                  <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-6">
                    <div className="relative w-full overflow-hidden rounded-2xl bg-black/30">
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={highlight.cardImageUrl}
                          alt={highlight.horse}
                          fill
                          sizes="(max-width: 768px) 80vw, 320px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleFinish}
                  className="mt-4 rounded-full bg-white/90 px-10 py-3 text-base font-semibold text-black transition hover:bg-white"
                >
                  結果を見る
                </button>
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
