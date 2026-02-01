"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "uma:onboarded";

type Phase = "splash" | "title";

export function SplashGateway() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("splash");
  const logos = {
    crest: "/assets/uma-royale-logo-transparent.png",
    full: "/assets/uma-royale-logo.png",
  };

  useEffect(() => {
    const timer = setTimeout(() => setPhase("title"), 2200);
    return () => clearTimeout(timer);
  }, []);

  const titleLines = useMemo(
    () => ["UMA", "ROYALE"],
    []
  );

  const handleStart = () => {
    const onboarded =
      typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_KEY) === "1";
    router.push(onboarded ? "/login" : "/onboarding");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary blur-[220px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/70 blur-[200px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-8 py-16">
        <AnimatePresence mode="wait">
          {phase === "splash" ? (
            <motion.section
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                className="relative h-28 w-28 overflow-hidden rounded-full border border-accent/40 bg-white/5 shadow-[0_0_60px_rgba(140,95,255,0.45)]"
                initial={{ rotate: -5, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src={logos.crest}
                  alt="UMA Royale crest"
                  fill
                  priority
                  sizes="120px"
                  className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                />
              </motion.div>
              <motion.p
                className="text-xs uppercase tracking-[0.6em] text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                LOADING
              </motion.p>
            </motion.section>
          ) : (
            <motion.section
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <div className="flex justify-center">
                <Image
                  src={logos.full}
                  alt="UMA Royale logo"
                  width={320}
                  height={200}
                  priority
                  className="h-auto w-72 max-w-full object-contain drop-shadow-[0_10px_60px_rgba(0,0,0,0.65)]"
                />
              </div>
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.6em] text-accent">Tap to Start</p>
                <div className="font-serif text-5xl leading-tight">
                  {titleLines.map((line) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-text-muted">
                  重厚なガチャ演出と暗号通貨決済を備えた競馬コレクション体験。
                </p>
              </div>
              <div className="flex w-full flex-col gap-3">
                <Button className="h-14 text-base" onClick={handleStart}>
                  タップしてスタート
                </Button>
                <Button variant="ghost" onClick={() => router.push("/login")}>既にアカウントをお持ちの方</Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
