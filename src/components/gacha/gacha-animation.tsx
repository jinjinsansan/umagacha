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
  animation: AnimationKey;
};

export function GachaAnimationPreview({ animation }: Props) {
  const Component = registry[animation] ?? G1RaceAnimation;
  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.4em] text-text-muted">演出プレビュー</p>
      <Component />
    </div>
  );
}
