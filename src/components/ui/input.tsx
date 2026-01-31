import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        className={cn(
          "h-12 rounded-2xl border border-border bg-background/70 px-4 text-base text-text placeholder:text-text-muted focus:border-accent focus:outline-none",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}
