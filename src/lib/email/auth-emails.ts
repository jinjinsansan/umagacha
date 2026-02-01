import { getResendClient, getResendFromAddress } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";

type AuthEmailPayload = {
  to: string;
  link: string;
  headline: string;
  body: string;
  buttonLabel: string;
  subject: string;
};

function buildHtml(payload: AuthEmailPayload): string {
  const { NEXT_PUBLIC_APP_URL } = publicEnv;
  const brand = "UMA ROYALE";
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#0c0c0f; padding:24px; color:#f5f3ff;">
      <div style="max-width:520px;margin:0 auto;background:#15151c;border-radius:16px;padding:32px">
        <p style="letter-spacing:0.4em;font-size:11px;color:#b48aff;margin:0 0 12px;">${brand}</p>
        <h1 style="font-size:24px;margin:0 0 16px;">${payload.headline}</h1>
        <p style="font-size:14px;line-height:1.7;color:#d6d3e8;margin:0 0 24px;">${payload.body}</p>
        <a href="${payload.link}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#b48aff;color:#0c0c0f;font-weight:bold;text-decoration:none;">${payload.buttonLabel}</a>
        <p style="font-size:12px;color:#8f8ca8;margin-top:32px;">リンクの有効期限は短時間です。アクセスできない場合は再度リクエストしてください。</p>
        <p style="font-size:11px;color:#6f6c84;margin-top:24px;">※ このメールに心当たりがない場合は破棄してください。</p>
        ${NEXT_PUBLIC_APP_URL ? `<p style="font-size:11px;color:#6f6c84;">${NEXT_PUBLIC_APP_URL}</p>` : ""}
      </div>
    </div>
  `;
}

function buildText(payload: AuthEmailPayload): string {
  return `${payload.headline}\n${payload.body}\n${payload.link}`;
}

async function sendAuthEmail(payload: AuthEmailPayload) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: payload.to,
    subject: payload.subject,
    html: buildHtml(payload),
    text: buildText(payload),
  });

  if (error) {
    console.error("Resend email error", error);
    throw new Error("メール送信に失敗しました。しばらくしてからお試しください。");
  }

  if (data?.id) {
    console.info(`[email] sent ${payload.subject} to ${payload.to} (id=${data.id})`);
  }
}

export async function sendSignupVerificationEmail(to: string, link: string) {
  await sendAuthEmail({
    to,
    link,
    headline: "メールアドレスを確認してください",
    body: "以下のボタンからUMA ROYALEアカウントの登録を完了できます。",
    buttonLabel: "登録を完了する",
    subject: "【UMA ROYALE】メールアドレス確認のお願い",
  });
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await sendAuthEmail({
    to,
    link,
    headline: "パスワード再設定",
    body: "以下のボタンからパスワードの再設定を行ってください。心当たりがない場合はこのメールを破棄してください。",
    buttonLabel: "パスワードを再設定",
    subject: "【UMA ROYALE】パスワード再設定のご案内",
  });
}

export async function sendEmailChangeVerificationEmail(to: string, link: string, kind: "current" | "new") {
  const isCurrent = kind === "current";
  await sendAuthEmail({
    to,
    link,
    headline: isCurrent ? "メールアドレス変更の確認" : "新しいメールアドレスを確認してください",
    body: isCurrent
      ? "現在ご利用中のメールアドレスで変更リクエストが行われました。以下のボタンから変更を承認してください。"
      : "UMA ROYALEアカウントの新しいメールアドレスとして登録するには、以下のボタンから確認を行ってください。",
    buttonLabel: isCurrent ? "変更を承認する" : "新しいメールを確認",
    subject: isCurrent ? "【UMA ROYALE】メールアドレス変更の確認" : "【UMA ROYALE】新しいメールアドレスの確認",
  });
}
