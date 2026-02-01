import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetForm } from "@/components/auth/reset-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ResetPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/home");
  }

  return (
    <section className="mt-12 space-y-6 text-text">
      <header className="space-y-2 text-center">
        <p className="text-xs tracking-[0.4em] text-accent">RESET PASSWORD</p>
        <h1 className="font-serif text-3xl font-semibold">ACCESS RECOVERY</h1>
        <p className="text-sm text-text-muted">登録メールアドレス宛にパスワード再設定リンクをお送りします。</p>
      </header>

      <Card>
        <CardHeader className="p-0">
          <CardTitle>再設定メールを送信</CardTitle>
          <CardDescription>数分以内にメールが届かない場合は迷惑メールフォルダもご確認ください。</CardDescription>
        </CardHeader>
        <CardContent className="mt-6 p-0">
          <ResetForm />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="text-accent underline-offset-4 hover:underline">
          新規登録
        </Link>
      </div>
    </section>
  );
}
