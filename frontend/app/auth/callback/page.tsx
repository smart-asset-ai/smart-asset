"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function detectRole(userId: string, email: string): Promise<"/owner/mypage" | "/contractor/mypage"> {
  // Check owner_profiles first
  const { data: op } = await supabase.from("owner_profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (op) return "/owner/mypage";
  // Check contractors by email
  const { data: cs } = await supabase.from("contractors").select("id").eq("email", email).maybeSingle();
  if (cs) return "/contractor/mypage";
  // Default to owner mypage
  return "/owner/mypage";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [redirectMsg, setRedirectMsg] = useState("認証中...");

  useEffect(() => {
    // Read intent from localStorage (set before sending magic link, may be empty if different browser)
    const storedNext = typeof window !== "undefined" ? localStorage.getItem("auth-next-intent") : null;
    const urlNext = new URLSearchParams(window.location.search).get("next");
    const intent = storedNext || urlNext;
    if (typeof window !== "undefined") localStorage.removeItem("auth-next-intent");

    // Resolve destination based on intent + DB role check
    const resolveDestination = async (userId: string, email: string): Promise<string> => {
      if (intent === "contractor-register") return "/contractors/register?step=2";
      if (intent === "owner-register") return "/owner/register?step=2";
      if (intent === "contractor-mypage") return "/contractor/mypage";
      if (intent === "owner-mypage") return "/owner/mypage";
      // No intent or unknown → detect from DB
      return await detectRole(userId, email);
    };

    const doRedirect = async (userId: string, email: string) => {
      const dest = await resolveDestination(userId, email);
      const labels: Record<string, string> = {
        "/owner/mypage": "オーナーマイページへ移動します...",
        "/contractor/mypage": "業者マイページへ移動します...",
        "/contractors/register?step=2": "業者登録フォームへ戻ります...",
        "/owner/register?step=2": "オーナー登録フォームへ戻ります...",
      };
      setRedirectMsg(labels[dest] || "マイページへ移動します...");
      setStatus("success");
      setTimeout(() => router.push(dest), 1200);
    };

    // Method 1: Listen for Supabase auto-processing hash tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        subscription.unsubscribe();
        doRedirect(session.user.id, session.user.email ?? "");
      }
    });

    // Method 2: Session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        subscription.unsubscribe();
        doRedirect(data.session.user.id, data.session.user.email ?? "");
        return;
      }

      // Method 3: Manual token_hash (admin generate_link path)
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (tokenHash && type) {
        supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "magiclink" | "email",
        }).then(async ({ data: otpData, error }) => {
          if (!error && otpData.user) {
            subscription.unsubscribe();
            await doRedirect(otpData.user.id, otpData.user.email ?? "");
          } else {
            // Wait up to 8s for onAuthStateChange
            setTimeout(async () => {
              const { data: d2 } = await supabase.auth.getSession();
              if (d2.session?.user) {
                subscription.unsubscribe();
                await doRedirect(d2.session.user.id, d2.session.user.email ?? "");
              } else {
                setStatus("error");
              }
            }, 8000);
          }
        });
      } else {
        // No token_hash — rely on onAuthStateChange, timeout after 10s
        setTimeout(async () => {
          const { data: d3 } = await supabase.auth.getSession();
          if (d3.session?.user) {
            subscription.unsubscribe();
            await doRedirect(d3.session.user.id, d3.session.user.email ?? "");
          } else {
            setStatus("error");
          }
        }, 10000);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem", maxWidth: "24rem", width: "100%", textAlign: "center" }}>
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin" style={{ width: "3rem", height: "3rem", color: "#2563eb", margin: "0 auto 1.25rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>認証処理中...</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>しばらくお待ちください</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle style={{ width: "3rem", height: "3rem", color: "#16a34a", margin: "0 auto 1.25rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>ログイン完了</h2>
            <p style={{ color: "#16a34a", fontSize: "0.9375rem", fontWeight: 600 }}>{redirectMsg}</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle style={{ width: "3rem", height: "3rem", color: "#ef4444", margin: "0 auto 1.25rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>認証エラー</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              リンクの有効期限が切れているか、すでに使用済みです。<br />
              再度ログイン画面からメールを送信してください。
            </p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#2563eb", color: "white", fontWeight: 700, borderRadius: "0.875rem", padding: "0.875rem 1.75rem", textDecoration: "none", fontSize: "0.9375rem" }}>
              トップページへ戻る
            </a>
          </>
        )}
      </div>
    </div>
  );
}
