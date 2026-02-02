"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
type TimelineState = {
  snow: boolean;
  logo: boolean;
  gold: boolean;
};

const FADE_DURATION = 800;
const DEFAULT_VIDEO_SOURCES = [
  { src: "/animations/gacha/uma-cinematic-2-portrait-v2.mp4", type: "video/mp4" },
];
const DEFAULT_AUDIO = "/animations/gacha/uma-cinematic-2.m4a";
const LOGO_ASSET = "/assets/uma-royale-logo-transparent.png";

type Particle = {
  id: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
};

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const createParticles = (count: number, sizeBase: number, sizeRange: number, durationBase: number, durationRange: number, driftRange: number, idPrefix: string): Particle[] =>
  Array.from({ length: count }, (_, index) => {
    const left = pseudoRandom(index + 1) * 100;
    const delay = pseudoRandom(index + 11) * 1.2;
    const duration = durationBase + pseudoRandom(index + 21) * durationRange;
    const size = sizeBase + pseudoRandom(index + 31) * sizeRange;
    const drift = -driftRange / 2 + pseudoRandom(index + 41) * driftRange;
    return {
      id: `${idPrefix}-${index}`,
      left,
      delay,
      duration,
      size,
      drift,
    };
  });

const SNOW_PARTICLES = createParticles(32, 2, 2.5, 3.5, 3.5, 40, "snow");
const GOLD_PARTICLES = createParticles(24, 3, 4, 2.5, 2.5, 30, "gold");

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
  const [timelineState, setTimelineState] = useState<TimelineState>({ snow: false, logo: false, gold: false });
  const [videoOrientation, setVideoOrientation] = useState<"portrait" | "landscape" | "unknown">("unknown");
  const [videoReady, setVideoReady] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoSourceKey = useMemo(() => videoSources.map((source) => source.src).join("|"), [videoSources]);

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

  const resetTimeline = useCallback(() => {
    setTimelineState({ snow: false, logo: false, gold: false });
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (width === 0 || height === 0) {
      setVideoOrientation("portrait");
      setVideoReady(true);
      return;
    }
    setVideoOrientation(height >= width ? "portrait" : "landscape");
    setVideoReady(true);
  }, []);

  const startFade = useCallback(() => {
    if (phase !== "video") return;
    resetTimeline();
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
  }, [phase, setFadeProgress, resetTimeline]);

  const handleFinish = useCallback(() => {
    clearTimers();
    stopAudio();
    videoRef.current?.pause();
    resetTimeline();
    onFinish();
  }, [clearTimers, stopAudio, onFinish, resetTimeline]);

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
    const uniqueSources = Array.from(new Set(videoSources.map((source) => source.src)));
    const links = uniqueSources.map((url) => {
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
  }, [videoSources]);

  useEffect(() => {
    const video = videoRef.current;
    if (!open) {
      clearTimers();
      stopAudio();
      video?.pause();
      const frameReset = requestAnimationFrame(() => {
        resetTimeline();
      });
      return () => cancelAnimationFrame(frameReset);
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
  }, [open, clearTimers, stopAudio, resetTimeline]);

  useEffect(() => {
    if (!open) return;
    let raf: number;
    const trackTimeline = () => {
      const current = videoRef.current?.currentTime ?? 0;
      const next: TimelineState = {
        snow: current >= 5 && current < 10,
        logo: current >= 15 && current < 17,
        gold: current >= 17 && current < 20,
      };
      setTimelineState((prev) =>
        prev.snow === next.snow && prev.logo === next.logo && prev.gold === next.gold ? prev : next,
      );
      raf = requestAnimationFrame(trackTimeline);
    };
    raf = requestAnimationFrame(trackTimeline);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVideoReady(false);
      setVideoOrientation("unknown");
      if (!open) return;
      const video = videoRef.current;
      if (video && video.readyState >= 1) {
        handleLoadedMetadata();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, videoSourceKey, handleLoadedMetadata]);


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

  const needsRotation = videoOrientation === "landscape";
  const videoClassName = needsRotation
    ? "pointer-events-none h-[100vw] w-[100vh] object-cover"
    : "pointer-events-none h-full w-full object-cover";
  const videoStyle: CSSProperties | undefined = needsRotation
    ? { transform: "rotate(90deg)", transformOrigin: "center center" }
    : undefined;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-black transition-opacity duration-300 ${videoReady ? "opacity-100" : "opacity-0"}`}
          >
            <video
              key={videoSourceKey}
              ref={videoRef}
              className={videoClassName}
              style={videoStyle}
              playsInline
              autoPlay
              muted
              preload="auto"
              poster={posterSrc}
              onEnded={startFade}
              onLoadedMetadata={handleLoadedMetadata}
            >
              {videoSources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} media={source.media} />
              ))}
            </video>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <AnimatePresence>
              {timelineState.snow ? <SnowLayer key="snow-layer" /> : null}
              {timelineState.logo ? <LogoPulse key="logo-layer" /> : null}
              {timelineState.gold ? <GoldLayer key="gold-layer" /> : null}
            </AnimatePresence>
          </div>

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

const SnowLayer = () => (
  <motion.div
    className="pointer-events-none absolute inset-0 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    {SNOW_PARTICLES.map((particle) => (
      <motion.span
        key={particle.id}
        className="absolute rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        initial={{ y: "-10%", opacity: 0 }}
        animate={{ y: "110%", opacity: [0, 0.9, 0.2], x: ["0%", `${particle.drift}%`] }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size,
        }}
      />
    ))}
  </motion.div>
);

const GoldLayer = () => (
  <motion.div
    className="pointer-events-none absolute inset-0 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-transparent to-amber-200/15 mix-blend-screen" />
    {GOLD_PARTICLES.map((particle) => (
      <motion.span
        key={particle.id}
        className="absolute rounded-full bg-amber-300/80 blur-[1px] mix-blend-screen"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.2, 1.6], opacity: [0, 0.9, 0] }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{
          left: `${particle.left}%`,
          bottom: "-10%",
          width: particle.size * 6,
          height: particle.size * 6,
          boxShadow: "0 0 25px rgba(255,200,92,0.4)",
        }}
      />
    ))}
  </motion.div>
);

const LogoPulse = () => (
  <motion.div
    className="pointer-events-none absolute inset-0 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="flex flex-col items-center gap-4 text-white"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: [0.6, 1.1, 1.35], opacity: [0, 1, 0] }}
      transition={{ duration: 1.6, ease: "easeInOut" }}
    >
      <Image
        src={LOGO_ASSET}
        alt="UMA Royale Emblem"
        width={360}
        height={360}
        className="w-40 sm:w-48 drop-shadow-[0_0_45px_rgba(255,255,255,0.45)]"
        priority={false}
      />
      <motion.span
        className="text-xs uppercase tracking-[0.8em] text-white/80"
        initial={{ opacity: 0, letterSpacing: "0.4em" }}
        animate={{ opacity: [0, 1, 0], letterSpacing: ["0.4em", "0.8em", "1.2em"] }}
        transition={{ duration: 1.4, ease: "easeIn" }}
      >
        UMA ROYALE
      </motion.span>
    </motion.div>
  </motion.div>
);
