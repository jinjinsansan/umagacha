"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "uma:onboarded";

type Slide = {
  title: string;
  description: string;
  highlight: string;
};

const slides: Slide[] = [
  {
    title: "圧巻のガチャ演出",
    description: "G1から有馬記念まで4パターンのアニメーションでレア度を体感。",
    highlight: "ANIMATION",
  },
  {
    title: "50頭の名馬コレクション",
    description: "取得状況によってカードビジュアルとシルエットが切り替わります。",
    highlight: "COLLECTION",
  },
  {
    title: "ソーシャルで贈り合う",
    description: "フレンド申請やプレゼント機能で推し馬をシェア。",
    highlight: "SOCIAL",
  },
  {
    title: "暗号通貨決済に対応",
    description: "one.lat × Supabase で安全にチケットを購入。",
    highlight: "CRYPTO",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_KEY) === "1") {
      router.replace("/login");
    }
  }, [router]);

  const indicators = useMemo(() => slides.map((_, index) => index), []);

  const markCompleted = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    }
  };

  const exitToLogin = () => {
    markCompleted();
    router.replace("/login");
  };

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      exitToLogin();
    }
  };

  const handleSkip = () => exitToLogin();

  const currentSlide = slides[step];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-10 text-text">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-secondary blur-[200px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/60 blur-[220px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-8">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-text-muted">
          <span>GUIDE</span>
          <button className="text-accent" onClick={handleSkip}>
            スキップ
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-between gap-6">
          <AnimatePresence mode="popLayout">
            <motion.section
              key={currentSlide.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 rounded-[2rem] border border-border bg-background/70 p-6 backdrop-blur-xl"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-accent">
                {currentSlide.highlight}
              </p>
              <h1 className="font-serif text-3xl leading-snug">{currentSlide.title}</h1>
              <p className="text-sm text-text-muted">{currentSlide.description}</p>
            </motion.section>
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {indicators.map((index) => (
                <span
                  key={index}
                  className={`h-2 w-10 rounded-full ${
                    index === step ? "bg-accent" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Button className="h-12 text-base" onClick={handleNext}>
                {step === slides.length - 1 ? "はじめよう" : "次へ"}
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                後で設定する
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-text-muted">
          {String(step + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
