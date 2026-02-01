export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-border/40 ${className ?? ""}`} />
  );
}
