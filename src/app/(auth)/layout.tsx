import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary via-secondary/40 to-background text-text">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute right-10 top-16 h-64 w-64 rounded-full bg-accent blur-[140px]" />
        <div className="absolute left-4 bottom-10 h-48 w-48 rounded-full bg-secondary blur-[120px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        {children}
      </div>
    </div>
  );
}
