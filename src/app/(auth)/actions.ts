"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseActionClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { publicEnv } from "@/lib/env";
import { sendPasswordResetEmail, sendSignupVerificationEmail } from "@/lib/email/auth-emails";
import { hasResendConfig } from "@/lib/email/resend";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    acceptTerms: z.coerce.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })
  .refine((data) => data.acceptTerms, {
    message: "利用規約への同意が必要です",
    path: ["acceptTerms"],
  });

export async function signInAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: "メールアドレスとパスワードを確認してください" };
  }

  const supabase = getSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/home");
}

export async function signUpAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "入力内容を確認してください";
    return { status: "error", message: firstError };
  }

  const redirectTo = `${publicEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`;
  const useResend = hasResendConfig();
  if (!useResend) {
    if (process.env.NODE_ENV === "production") {
      return { status: "error", message: "メール送信設定が完了していません。管理者にお問い合わせください" };
    }

    const supabase = getSupabaseActionClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return { status: "error", message: error.message };
    }

    redirect("/login?signup=1");
  }

  try {
    const service = getSupabaseServiceClient();
    const { data, error } = await service.auth.admin.generateLink({
      type: "signup",
      email: parsed.data.email,
      password: parsed.data.password,
      options: { redirectTo },
    });

    if (error) {
      return { status: "error", message: error.message };
    }

    const link = data?.properties?.action_link;
    if (!link) {
      return { status: "error", message: "確認メールを作成できませんでした" };
    }

    await sendSignupVerificationEmail(parsed.data.email, link);
  } catch (error) {
    console.error("signUpAction", error);
    return { status: "error", message: "メール送信に失敗しました。しばらくしてからお試しください" };
  }

  redirect("/login?signup=1");
}

const passwordResetSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordResetAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = passwordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error", message: "メールアドレスを確認してください" };
  }

  const redirectTo = `${publicEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`;
  const useResend = hasResendConfig();
  if (!useResend) {
    if (process.env.NODE_ENV === "production") {
      return { status: "error", message: "メール送信設定が完了していません。管理者にお問い合わせください" };
    }

    const supabase = getSupabaseActionClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });

    if (error) {
      return { status: "error", message: error.message };
    }

    redirect("/login?reset=1");
  }

  try {
    const service = getSupabaseServiceClient();
    const { data, error } = await service.auth.admin.generateLink({
      type: "recovery",
      email: parsed.data.email,
      options: { redirectTo },
    });

    if (error) {
      return { status: "error", message: error.message };
    }

    const link = data?.properties?.action_link;
    if (!link) {
      return { status: "error", message: "再設定リンクを生成できませんでした" };
    }

    await sendPasswordResetEmail(parsed.data.email, link);
  } catch (error) {
    console.error("requestPasswordResetAction", error);
    return { status: "error", message: "メール送信に失敗しました。しばらくしてからお試しください" };
  }

  redirect("/login?reset=1");
}

export async function signOutAction() {
  const supabase = getSupabaseActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
