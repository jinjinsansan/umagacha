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

async function upsertGacha(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  const name = String(formData.get("gacha_name") ?? "").trim();
  const ticket_type_id = String(formData.get("ticket_type_id") ?? "");
  const min_rarity = Number(formData.get("min_rarity") ?? 1);
  const max_rarity = Number(formData.get("max_rarity") ?? min_rarity);
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;
  const is_active = formData.get("is_active") === "on";

  if (!name || !ticket_type_id) return;

  await svc.from("gachas").insert({
    name,
    ticket_type_id,
    min_rarity,
    max_rarity,
    is_active,
    sort_order,
  });

  revalidatePath("/admin");
}

async function importRatesCsv(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();

  const gacha_id = String(formData.get("csv_gacha_id") ?? "");
  const raw = String(formData.get("csv_data") ?? "").trim();
  if (!gacha_id || !raw) return;

  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.split(/[,\s]+/).filter(Boolean))
    .filter((cols) => cols.length >= 2)
    .map(([horse_id, rate]) => ({ gacha_id, horse_id, rate: Number(rate) }));

  if (rows.length === 0) return;
  await svc.from("gacha_rates").upsert(rows, { onConflict: "gacha_id,horse_id" });
  revalidatePath("/admin");
}

async function toggleMaintenance(formData: FormData) {
  "use server";
  await requireAdminSession();
  const svc = getSupabaseServiceClient();
  const enabled = formData.get("maintenance_enabled") === "on";
  const message = String(formData.get("maintenance_message") ?? "").trim();

  await svc.from("app_settings").upsert({
    key: "maintenance",
    value: { enabled, message },
    updated_at: new Date().toISOString(),
  });

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

  type RateRow = {
    gacha_id: string;
    rate: number;
    horses: { name: string; rarity: number } | null;
    gachas: { name: string } | null;
  };

  const [horsesResp, gachasResp, animationsResp, usersResp, ticketTypesResp, ratesResp, maintenanceResp] =
    await Promise.all([
      svc.from("horses").select("id, name, rarity, card_image_url").order("rarity"),
      svc
        .from("gachas")
        .select("id, name, ticket_types(name, code), min_rarity, max_rarity, is_active, sort_order")
        .order("sort_order"),
      svc
        .from("gacha_animations")
        .select("id, key, name, min_rarity, max_rarity, type")
        .order("sort_order"),
      svc.auth.admin.listUsers({ page: 1, perPage: 50 }),
      svc.from("ticket_types").select("id, name, code").order("code"),
      svc
        .from("gacha_rates")
        .select("gacha_id, rate, horses(name, rarity), gachas(name)")
        .order("rate", { ascending: false })
        .returns<RateRow[]>(),
      svc.from("app_settings").select("value").eq("key", "maintenance").maybeSingle(),
    ]);

  const horses = horsesResp.data ?? [];
  const gachas = ((gachasResp as unknown) as { data?: AdminGacha[] }).data ?? [];
  const animations = animationsResp.data ?? [];
  const users = usersResp.data?.users ?? [];
  const ticketTypes = ticketTypesResp.data ?? [];
  const rates = ratesResp.data ?? [];
  const maintenance = (maintenanceResp.data?.value as { enabled?: boolean; message?: string } | null) ?? {
    enabled: false,
    message: "",
  };

  const rtp = gachas.map((g) => {
    const entries = rates.filter((r) => r.gacha_id === g.id);
    const totalWeight = entries.reduce((sum, r) => sum + (Number(r.rate) || 0), 0);
    return {
      gacha: g,
      totalWeight,
    };
  });

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
            <CardTitle>ガチャ作成</CardTitle>
            <CardDescription>チケット種別とレア度レンジを指定して追加。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <form action={upsertGacha} className="grid gap-3">
              <Input name="gacha_name" placeholder="ガチャ名" required />
              <select name="ticket_type_id" className="rounded-lg bg-background px-3 py-2" required>
                <option value="">チケット種別を選択</option>
                {ticketTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input name="min_rarity" type="number" min={1} max={12} placeholder="最小レア" required />
                <Input name="max_rarity" type="number" min={1} max={12} placeholder="最大レア" required />
              </div>
              <Input name="sort_order" type="number" min={0} placeholder="並び順 (0〜)" />
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" name="is_active" defaultChecked /> 有効にする
              </label>
              <Button type="submit">ガチャを追加</Button>
            </form>
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
            <div className="mt-4 space-y-2 text-sm text-text-muted">
              <p className="text-xs text-text-muted">CSVインポート (行: horse_id,rate)</p>
              <form action={importRatesCsv} className="grid gap-2">
                <select name="csv_gacha_id" className="rounded-lg bg-background px-3 py-2" required>
                  <option value="">ガチャを選択</option>
                  {gachas?.map((gacha) => (
                    <option key={gacha.id} value={gacha.id}>
                      {gacha.name} ({gacha.ticket_types?.code})
                    </option>
                  ))}
                </select>
                <textarea
                  name="csv_data"
                  className="min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="horse-id-1,25\nhorse-id-2,5"
                  required
                ></textarea>
                <Button type="submit" variant="outline">
                  CSVを反映
                </Button>
              </form>
            </div>
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
            <CardTitle>メンテナンス / RTP</CardTitle>
            <CardDescription>全体メンテナンスの切替と提供割合の合計を確認。</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-3">
            <form action={toggleMaintenance} className="grid gap-2 rounded-lg border border-border px-3 py-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="maintenance_enabled" defaultChecked={maintenance.enabled} />
                メンテナンスモード
              </label>
              <Input
                name="maintenance_message"
                placeholder="メンテナンス告知 (任意)"
                defaultValue={maintenance.message ?? ""}
              />
              <Button type="submit" variant="outline">
                保存
              </Button>
            </form>

            <div className="space-y-2 rounded-lg border border-border px-3 py-3 text-sm text-text-muted">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">RTP overview</p>
              {rtp.map((item) => (
                <div key={item.gacha.id} className="flex items-center justify-between">
                  <span>
                    {item.gacha.name} ({item.gacha.ticket_types?.code})
                  </span>
                  <span className="text-accent text-xs">合計rate: {item.totalWeight}</span>
                </div>
              ))}
            </div>
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
