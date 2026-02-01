import { Header } from "@/components/layout/header";

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <Header title="利用規約" subtitle="サービスのご利用条件" />
      <div className="space-y-3 rounded-2xl border border-border bg-background/70 p-4 text-sm text-text-muted">
        <p>本サービスはエンターテインメント目的で提供されます。</p>
        <p>アカウントの不正利用が確認された場合、停止措置を取ることがあります。</p>
        <p>コンテンツや提供割合は予告なく変更されることがあります。</p>
      </div>
    </div>
  );
}
