"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TabConfig = {
  value: string;
  label: string;
  badge?: ReactNode;
};

type TabsProps = {
  tabs: TabConfig[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
}: TabsProps) {
  const fallbackValue = tabs[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? fallbackValue);
  const activeValue = value ?? internalValue;

  const indicatorPosition = useMemo(() => {
    if (!tabs.length) {
      return { width: "0%", left: "0%" };
    }
    const index = tabs.findIndex((tab) => tab.value === activeValue);
    const width = 100 / tabs.length;
    return {
      width: `${width}%`,
      left: index === -1 ? "0%" : `${index * width}%`,
    };
  }, [activeValue, tabs]);

  const handleSelect = (nextValue: string) => {
    if (!value) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <div className={cn("relative rounded-full border border-border bg-background/70 p-1", className)}>
      <span
        className="pointer-events-none absolute inset-y-1 rounded-full bg-white/10 transition-all duration-300"
        style={indicatorPosition}
      />
      <div className="relative z-10 flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleSelect(tab.value)}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
                isActive ? "text-text" : "text-text-muted"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
