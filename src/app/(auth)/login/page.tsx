import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/home");
  }

  return (
    <section className="mt-12 space-y-6 text-text">
      <header className="space-y-2 text-center">
        <p className="text-xs tracking-[0.4em] text-accent">SIGN IN</p>
        <h1 className="font-serif text-3xl font-semibold">WELCOME BACK</h1>
        <p className="text-sm text-text-muted">
          登録済みのメールアドレスでログインし、プレミアムなガチャを体験してください。
        </p>
      </header>

      <Card>
        <CardHeader className="p-0">
          <CardTitle>メールログイン</CardTitle>
          <CardDescription>Supabase Authと連携するフォームです。</CardDescription>
        </CardHeader>
        <CardContent className="mt-6 p-0">
          <LoginForm />
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
