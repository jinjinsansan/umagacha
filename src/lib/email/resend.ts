import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

let client: Resend | null = null;

export function hasResendConfig(): boolean {
  const { RESEND_API_KEY, RESEND_FROM_EMAIL } = getServerEnv();
  return Boolean(RESEND_API_KEY && RESEND_FROM_EMAIL);
}

export function getResendClient(): Resend {
  if (!client) {
    const { RESEND_API_KEY } = getServerEnv();
    if (!RESEND_API_KEY) {
      throw new Error("Resend API key is not configured");
    }
    client = new Resend(RESEND_API_KEY);
  }

  return client;
}

export function getResendFromAddress(): string {
  const { RESEND_FROM_EMAIL } = getServerEnv();
  if (!RESEND_FROM_EMAIL) {
    throw new Error("Resend sender address is not configured");
  }
  return RESEND_FROM_EMAIL;
}
