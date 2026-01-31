import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CollectionList } from "@/components/collection/collection-list";
import { Button } from "@/components/ui/button";

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <Header title="コレクション" subtitle="所持カードの進捗を確認" />
      <CollectionList />
      <Button asChild variant="ghost" className="w-full text-sm">
        <Link href="/home">ホームに戻る</Link>
      </Button>
    </div>
  );
}
