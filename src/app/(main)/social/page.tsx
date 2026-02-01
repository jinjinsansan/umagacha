import { Header } from "@/components/layout/header";
import { SocialPanel } from "@/components/social/social-panel";

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <Header title="ソーシャル" subtitle="フレンドとカードを共有" />
      <SocialPanel />
    </div>
  );
}
