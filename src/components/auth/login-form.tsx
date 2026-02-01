"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {
  status: "idle",
};

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input type="email" name="email" placeholder="メールアドレス" required autoComplete="email" />
      <Input type="password" name="password" placeholder="パスワード" required autoComplete="current-password" />
      {state.status === "error" && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
      <SubmitButton>ログイン</SubmitButton>
    </form>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "認証中..." : children}
    </Button>
  );
}
