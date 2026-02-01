"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {
  status: "idle",
};

export function ResetForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input type="email" name="email" placeholder="登録メールアドレス" required autoComplete="email" />
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      <SubmitButton>再設定メールを送信</SubmitButton>
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
