import type { ReactNode } from "react";
import {
  Home,
  BookMarked,
  Sparkles,
  Users2,
  Menu as MenuIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { TabBar, type TabBarItem } from "@/components/layout/tab-bar";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const tabs: TabBarItem[] = [
  { label: "ホーム", href: "/home", icon: Home },
  { label: "図鑑", href: "/collection", icon: BookMarked },
  { label: "ガチャ", href: "/gacha", icon: Sparkles, primary: true },
  { label: "ソーシャル", href: "/social", icon: Users2 },
  { label: "メニュー", href: "/menu", icon: MenuIcon },
];

type MainLayoutProps = {
  children: ReactNode;
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-background text-text">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4a1942_0%,transparent_45%)]" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-28 pt-8">
        {children}
      </div>
      <TabBar items={tabs} />
    </div>
  );
}
