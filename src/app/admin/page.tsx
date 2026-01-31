import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function requireAdminSession() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL)) {
    redirect("/home");
  }

  return session;
}

async function addHorse(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  const name = String(formData.get("name") ?? "").trim();
  const rarity = Number(formData.get("rarity") ?? 1);
  const description = String(formData.get("description") ?? "").trim() || null;
  const card_image_url = String(formData.get("card_image_url") ?? "").trim() || null;
  const silhouette_image_url = String(formData.get("silhouette_image_url") ?? "").trim() || null;

  if (!name) return;

  await svc.from("horses").insert({
    name,
    rarity,
    description,
    card_image_url,
    silhouette_image_url,
    is_active: true,
  });

  revalidatePath("/admin");
}

async function upsertRate(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  const gacha_id = String(formData.get("gacha_id") ?? "");
  const horse_id = String(formData.get("horse_id") ?? "");
  const rate = Number(formData.get("rate") ?? 0);

  if (!gacha_id || !horse_id || rate <= 0) return;

  await svc.from("gacha_rates").upsert({ gacha_id, horse_id, rate });
  revalidatePath("/admin");
}

async function addAnimation(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const min_rarity = Number(formData.get("min_rarity") ?? 1);
  const max_rarity = Number(formData.get("max_rarity") ?? 3);
  const duration_seconds = Number(formData.get("duration_seconds") ?? 0) || null;
  const asset_url = String(formData.get("asset_url") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "css").trim();

  if (!key || !name) return;

  await svc.from("gacha_animations").upsert({
    key,
    name,
    min_rarity,
    max_rarity,
    duration_seconds,
    asset_url,
    type,
    is_active: true,
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  type AdminGacha = {
    id: string;
    name: string;
    ticket_types?: { code?: string | null; name?: string | null } | null;
    min_rarity?: number | null;
    max_rarity?: number | null;
  };

  const [horsesResp, gachasResp, animationsResp, usersResp] = await Promise.all([
    svc.from("horses").select("id, name, rarity").order("rarity"),
    svc
      .from("gachas")
      .select("id, name, ticket_types(name, code), min_rarity, max_rarity")
      .order("sort_order"),
    svc.from("gacha_animations").select("id, key, name, min_rarity, max_rarity, type").order("sort_order"),
    svc.auth.admin.listUsers({ page: 1, perPage: 50 }),
  ]);

  const horses = horsesResp.data ?? [];
  const gachas = ((gachasResp as unknown) as { data?: AdminGacha[] }).data ?? [];
  const animations = animationsResp.data ?? [];
  const users = usersResp.data?.users ?? [];

  return (
    <div className="space-y-6">
      <Header title="管理パネル" subtitle="ホース・演出・提供割合の管理" />

      <Tabs
        tabs={[
          { value: "horses", label: "馬カード" },
          { value: "rates", label: "提供割合" },
          { value: "animations", label: "演出" },
          { value: "users", label: "ユーザー" },
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="p-0">
            <CardTitle>馬カードの追加</CardTitle>
            <CardDescription>名前とレア度だけでも登録できます。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <form action={addHorse} className="grid gap-3">
              <Input name="name" placeholder="名前" required />
              <Input name="rarity" type="number" min={1} max={12} placeholder="レア度 1-12" required />
              <Input name="description" placeholder="説明 (任意)" />
              <Input name="card_image_url" placeholder="カード画像URL (任意)" />
              <Input name="silhouette_image_url" placeholder="シルエットURL (任意)" />
              <Button type="submit">追加</Button>
            </form>
            <div className="mt-4 text-sm text-text-muted">現在の登録: {horses?.length ?? 0}件</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <CardTitle>提供割合（ガチャ×馬）</CardTitle>
            <CardDescription>ガチャに馬を紐付け、rate は重み（合計は任意）。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <form action={upsertRate} className="grid gap-3">
              <select name="gacha_id" className="rounded-lg bg-background px-3 py-2" required>
                <option value="">ガチャを選択</option>
                {gachas?.map((gacha) => (
                  <option key={gacha.id} value={gacha.id}>
                    {gacha.name} ({gacha.ticket_types?.code})
                  </option>
                ))}
              </select>
              <select name="horse_id" className="rounded-lg bg-background px-3 py-2" required>
                <option value="">馬を選択</option>
                {horses?.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} (★{horse.rarity})
                  </option>
                ))}
              </select>
              <Input name="rate" type="number" step="0.01" min={0} placeholder="重み (例: 25)" required />
              <Button type="submit">追加 / 更新</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <CardTitle>演出マスタ</CardTitle>
            <CardDescription>レア度レンジと演出キーを登録。asset_url は動画など将来用。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <form action={addAnimation} className="grid gap-3">
              <Input name="key" placeholder="キー (例: g1)" required />
              <Input name="name" placeholder="名称 (例: G1レース)" required />
              <div className="grid grid-cols-2 gap-3">
                <Input name="min_rarity" type="number" min={1} max={12} placeholder="最小レア" required />
                <Input name="max_rarity" type="number" min={1} max={12} placeholder="最大レア" required />
              </div>
              <Input name="duration_seconds" type="number" min={0} placeholder="秒数 (任意)" />
              <Input name="asset_url" placeholder="動画/アセットURL (任意)" />
              <Input name="type" placeholder="種別 (css/video など)" defaultValue="css" />
              <Button type="submit">登録 / 更新</Button>
            </form>
            <div className="mt-4 text-sm text-text-muted">登録演出: {animations?.length ?? 0}件</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <CardTitle>ユーザー一覧 (50件まで)</CardTitle>
            <CardDescription>サービスロールで取得。読み取りのみ。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 text-sm text-text-muted">
            <ul className="space-y-2">
              {(users.length === 0 ? [{ id: "none", email: "ユーザーがいません" }] : users).map((u) => (
                <li key={u.id} className="rounded-lg border border-border px-3 py-2">
                  <div className="font-semibold">{u.email}</div>
                  <div className="text-xs">{u.id}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
