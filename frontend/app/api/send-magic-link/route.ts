import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(req: NextRequest) {
  const { email, next } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 });
  }

  try {
    // Generate magic link via Supabase Admin API
    const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        type: "magiclink",
        email: email,
        options: {
          redirect_to: "https://smart-asset.ai/auth/callback",
        },
      }),
    });

    if (!linkRes.ok) {
      const err = await linkRes.json().catch(() => ({}));
      throw new Error(err.message || "マジックリンク生成に失敗しました");
    }

    const linkData = await linkRes.json();
    const actionLink: string = linkData.action_link;

    if (!actionLink) {
      throw new Error("マジックリンクの取得に失敗しました");
    }

    // Extract token_hash from the Supabase action_link and build direct callback URL
    // action_link format: https://xxx.supabase.co/auth/v1/verify?token=XXXX&type=magiclink&redirect_to=...
    const actionUrl = new URL(actionLink);
    const tokenHash = actionUrl.searchParams.get("token") || actionUrl.searchParams.get("token_hash");
    const linkType = actionUrl.searchParams.get("type") || "magiclink";

    // Build direct link to OUR callback page (no Supabase redirect needed)
    let directLink: string;
    if (tokenHash) {
      const cbUrl = new URL("https://smart-asset.ai/auth/callback");
      cbUrl.searchParams.set("token_hash", tokenHash);
      cbUrl.searchParams.set("type", linkType);
      directLink = cbUrl.toString();
    } else {
      // Fallback: use the raw action_link
      directLink = actionLink;
    }

    // Send via Resend
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Smart Asset AI <info@smart-asset.ai>",
        to: [email],
        subject: "【Smart Asset AI】ログイン・会員登録のご確認",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8fafc;">
            <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 28px;">
                <img src="https://smart-asset.ai/ai-mascot-email.svg" width="48" height="48" alt="AI" style="border-radius: 10px; display: block;" onerror="this.style.display=&apos;none&apos;" />
                <h1 style="margin: 0; color: #0a0f2e; font-size: 20px; font-weight: 800;">Smart Asset AI</h1>
              </div>
              <h2 style="color: #1e3a8a; margin: 0 0 16px; font-size: 22px;">ログイン確認メール</h2>
              <p style="color: #374151; line-height: 1.7; margin-bottom: 8px;">
                以下のボタンをクリックして、ログイン・会員登録を完了してください。
              </p>
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 28px;">
                ※ このリンクは24時間有効です。使い捨てリンクのため、再送信が必要な場合は再度ログイン操作を行ってください。
              </p>
              <a href="${directLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 700; font-size: 16px; margin-bottom: 28px; letter-spacing: 0.02em;">
                ✓ ログイン・登録を完了する
              </a>
              <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
                  ボタンが押せない場合は以下のURLをコピーしてブラウザに貼り付けてください：<br/>
                  <span style="color: #2563eb; word-break: break-all;">${directLink}</span>
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 20px; line-height: 1.7;">
                このメールに心当たりがない場合は無視してください。<br />
                Smart Asset AI | 運営：合同会社GOAT | <a href="mailto:info@smart-asset.ai" style="color: #2563eb;">info@smart-asset.ai</a>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json().catch(() => ({}));
      throw new Error(err.message || "メール送信に失敗しました");
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}
