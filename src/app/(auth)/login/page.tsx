import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/home");
  }

  const status = typeof searchParams?.signup === "string"
    ? "signup"
    : typeof searchParams?.reset === "string"
      ? "reset"
      : null;

  return (
    <section className="mt-12 space-y-6 text-text">
      <header className="space-y-2 text-center">
        <p className="text-xs tracking-[0.4em] text-accent">SIGN IN</p>
        <h1 className="font-serif text-3xl font-semibold">WELCOME BACK</h1>
        <p className="text-sm text-text-muted">
          登録済みのメールアドレスでログインし、プレミアムなガチャを体験してください。
        </p>
      </header>

      {status === "signup" && (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          確認メールを送信しました。メール内のリンクから登録を完了してください。
        </p>
      )}
      {status === "reset" && (
        <p className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          パスワード再設定メールを送信しました。記載のリンクから手続きを行ってください。
        </p>
      )}

      <Card>
        <CardHeader className="p-0">
          <CardTitle>メールログイン</CardTitle>
          <CardDescription>Supabase Authと連携するフォームです。</CardDescription>
        </CardHeader>
        <CardContent className="mt-6 p-0">
          <LoginForm />
        </CardContent>
      </Card>

      <div className="space-y-2 text-center text-sm text-text-muted">
        <div>
          パスワードをお忘れの方は{" "}
          <Link href="/reset" className="text-accent underline-offset-4 hover:underline">
            再設定
          </Link>
        </div>
        <div>
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-accent underline-offset-4 hover:underline">
            新規登録
          </Link>
        </div>
      </div>
    </section>
  );
}
