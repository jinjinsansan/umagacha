import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type HeaderProps = {
  title: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
};

export function Header({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-3 rounded-3xl border border-border/60 bg-background/60 px-4 py-3 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {leftSlot ?? <span className="text-sm uppercase tracking-[0.4em] text-accent">UMA ROYALE</span>}
        {rightSlot}
      </div>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
