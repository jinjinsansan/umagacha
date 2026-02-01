"use client";

import type { ComponentType } from "react";
import { ArimaFinaleAnimation } from "@/components/gacha/animations/arima-finale";
import { G1RaceAnimation } from "@/components/gacha/animations/g1-race";
import { HorseBirthAnimation } from "@/components/gacha/animations/horse-birth";
import { TrainingLossAnimation } from "@/components/gacha/animations/training-loss";

type AnimationKey = "g1" | "stables" | "birth" | "arima";

const registry: Record<AnimationKey, ComponentType> = {
  g1: G1RaceAnimation,
  stables: TrainingLossAnimation,
  birth: HorseBirthAnimation,
  arima: ArimaFinaleAnimation,
};

type Props = {
  animation: string;
  type?: string | null;
  assetUrl?: string | null;
  name?: string | null;
};

export function GachaAnimationPreview({ animation, type, assetUrl, name }: Props) {
  const Component = registry[animation as AnimationKey] ?? G1RaceAnimation;
  const isVideo = type === "video" && assetUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs tracking-[0.3em] text-text-muted">
        <span>演出プレビュー</span>
        {name && <span className="text-[0.65rem] text-text-muted/70">{name}</span>}
      </div>

      {isVideo ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-background/60">
          <video
            src={assetUrl ?? undefined}
            className="h-48 w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>
      ) : (
        <Component />
      )}
    </div>
  );
}
