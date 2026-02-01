"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {
  status: "idle",
};

export function RegisterForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input type="email" name="email" placeholder="メールアドレス" required autoComplete="email" />
      <Input type="password" name="password" placeholder="パスワード (6文字以上)" required autoComplete="new-password" />
      <Input type="password" name="confirmPassword" placeholder="パスワード確認" required autoComplete="new-password" />
      <label className="flex items-start gap-3 text-xs text-text-muted">
        <input
          type="checkbox"
          name="acceptTerms"
          value="true"
          className="mt-1 h-4 w-4 rounded border-border bg-background"
          required
        />
        利用規約とプライバシーポリシーに同意します。
      </label>
      {state.status === "error" && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
      <SubmitButton>登録して始める</SubmitButton>
    </form>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "送信中..." : children}
    </Button>
  );
}
