import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import {
  sendEmailChangeVerificationEmail,
  sendPasswordResetEmail,
  sendSignupVerificationEmail,
} from "@/lib/email/auth-emails";

type EmailHookPayload = {
  user: {
    email: string;
    email_new?: string | null;
  };
  email_data: {
    email_action_type: string;
    token?: string;
    token_hash?: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to?: string | null;
    site_url?: string | null;
  };
};

export async function POST(req: NextRequest) {
  const rawSecret = process.env.SUPABASE_EMAIL_HOOK_SECRET;
  if (!rawSecret) {
    console.error("SUPABASE_EMAIL_HOOK_SECRET is not configured");
    return NextResponse.json({ error: "hook not configured" }, { status: 500 });
  }

  const secret = normalizeSecret(rawSecret);
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let data: EmailHookPayload;
  try {
    const wh = new Webhook(secret);
    data = wh.verify(payload, headers) as EmailHookPayload;
  } catch (error) {
    console.error("send-email hook signature verification failed", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  try {
    await handleEmailHook(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("send-email hook handler failed", error);
    return NextResponse.json({ error: "failed to send email" }, { status: 500 });
  }
}

function normalizeSecret(secret: string) {
  return secret.startsWith("v1,whsec_") ? secret.replace("v1,whsec_", "") : secret;
}

async function handleEmailHook({ user, email_data }: EmailHookPayload) {
  const action = email_data.email_action_type;
  switch (action) {
    case "signup":
    case "magiclink":
    case "invite": {
      const link = buildActionLink(email_data, pickTokenHash(email_data));
      await sendSignupVerificationEmail(user.email, link);
      return;
    }
    case "recovery": {
      const link = buildActionLink(email_data, pickTokenHash(email_data));
      await sendPasswordResetEmail(user.email, link);
      return;
    }
    case "email_change": {
      await handleEmailChange(user, email_data);
      return;
    }
    default: {
      console.warn(`Unhandled email action type: ${action}`);
    }
  }
}

async function handleEmailChange(
  user: EmailHookPayload["user"],
  emailData: EmailHookPayload["email_data"]
) {
  const tasks: Promise<unknown>[] = [];

  if (emailData.token_hash_new) {
    const currentLink = buildActionLink(emailData, emailData.token_hash_new);
    tasks.push(sendEmailChangeVerificationEmail(user.email, currentLink, "current"));
  }

  if (emailData.token_hash && user.email_new) {
    const newLink = buildActionLink(emailData, emailData.token_hash);
    tasks.push(sendEmailChangeVerificationEmail(user.email_new, newLink, "new"));
  }

  if (!tasks.length) {
    throw new Error("email_change payload missing token hashes");
  }

  await Promise.all(tasks);
}

function pickTokenHash(emailData: EmailHookPayload["email_data"]) {
  return emailData.token_hash ?? emailData.token_hash_new;
}

function buildActionLink(emailData: EmailHookPayload["email_data"], tokenHash?: string) {
  const siteUrl = emailData.site_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!siteUrl) {
    throw new Error("site_url is not provided in email payload");
  }
  if (!tokenHash) {
    throw new Error("token_hash is not provided in email payload");
  }

  const url = new URL("/auth/v1/verify", siteUrl);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", emailData.email_action_type);
  if (emailData.redirect_to) {
    url.searchParams.set("redirect_to", emailData.redirect_to);
  }
  return url.toString();
}
