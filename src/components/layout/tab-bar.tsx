"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TabBarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
};

type TabBarProps = {
  items: TabBarItem[];
};

export function TabBar({ items }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="flex w-[min(420px,calc(100%-2rem))] items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 text-text shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {items.map((item) => {
          const isActive = matchPath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
                item.primary && "-mt-4 bg-accent text-background shadow-[0_12px_30px_rgba(212,175,55,0.45)]",
                isActive && !item.primary && "text-accent",
                !isActive && !item.primary && "text-text-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  item.primary ? "text-background" : isActive ? "text-accent" : "text-text-muted"
                )}
              />
              <span className={cn(item.primary && "text-[0.65rem]")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function matchPath(current: string | null, target: string) {
  if (!current) return false;
  if (target === "/") {
    return current === "/";
  }
  return current === target || current.startsWith(`${target}/`);
}
