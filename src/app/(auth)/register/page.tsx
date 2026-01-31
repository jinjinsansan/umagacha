import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
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
        <p className="text-xs tracking-[0.4em] text-accent">CREATE ACCOUNT</p>
        <h1 className="font-serif text-3xl font-semibold">JOIN UMA ROYALE</h1>
        <p className="text-sm text-text-muted">
          高級感あふれる演出と50頭のコレクション体験を今すぐ先行プレイ。
        </p>
      </header>

      <Card>
        <CardHeader className="p-0">
          <CardTitle>メールで登録</CardTitle>
          <CardDescription>Supabase Authと接続するフォームです。</CardDescription>
        </CardHeader>
        <CardContent className="mt-6 p-0">
          <RegisterForm />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-text-muted">
        すでにアカウントをお持ちの場合は{" "}
        <Link href="/login" className="text-accent underline-offset-4 hover:underline">
          ログイン
        </Link>
      </div>
    </section>
  );
}
