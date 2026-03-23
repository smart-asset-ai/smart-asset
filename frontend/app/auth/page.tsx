"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Mail, CheckCircle, AlertCircle, Loader2,
  Building2, HardHat, ArrowLeft, Smartphone, Shield, Zap,
} from "lucide-react";

type Step = "role" | "input" | "sent" | "error";
type Role = "owner" | "contractor" | null;

export default function AuthPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep("input");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    if (role) localStorage.setItem("auth-next-intent", role === "owner" ? "owner-mypage" : "contractor-mypage");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMsg(error.message || "Googleログインに失敗しました。");
      setStep("error");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      if (role) localStorage.setItem("auth-next-intent", role === "owner" ? "owner-mypage" : "contractor-mypage");
      const res = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信に失敗しました");
      setStep("sent");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました。もう一度お試しください。");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "0.875rem" }}>
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
          トップへ戻る
        </a>
        <div style={{ color: "white", fontWeight: 900, fontSize: "1rem" }}>🏗️ Smart Asset AI</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Card */}
          <div style={{ background: "white", borderRadius: "1.5rem", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            {/* Card Header */}
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "1.75rem 1.5rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🏗️</div>
              <h1 style={{ color: "white", fontWeight: 900, fontSize: "1.25rem", marginBottom: "0.25rem" }}>Smart Asset AI</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>ログイン / アカウント作成</p>
            </div>

            {/* Card Body */}
            <div style={{ padding: "1.75rem 1.5rem" }}>

              {/* ── STEP: Role ── */}
              {step === "role" && (
                <>
                  <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9375rem", textAlign: "center", marginBottom: "1.25rem" }}>
                    どちらとしてご利用ですか？
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    <RoleButton
                      icon={<Building2 style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />}
                      bg="#2563eb"
                      borderColor="#dbeafe"
                      hoverBorder="#2563eb"
                      cardBg="#eff6ff"
                      hoverCardBg="#dbeafe"
                      title="オーナー（建物所有者）"
                      sub="物件登録・AI診断・業者検索・修繕台帳"
                      titleColor="#1e3a8a"
                      onClick={() => handleRoleSelect("owner")}
                    />
                    <RoleButton
                      icon={<HardHat style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />}
                      bg="#16a34a"
                      borderColor="#dcfce7"
                      hoverBorder="#16a34a"
                      cardBg="#f0fdf4"
                      hoverCardBg="#dcfce7"
                      title="施工会社・職人"
                      sub="案件応募・電子契約・写真管理・請求書"
                      titleColor="#14532d"
                      onClick={() => handleRoleSelect("contractor")}
                    />
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
                    ※オーナーと業者を兼ねる場合は別々にログインできます
                  </p>
                </>
              )}

              {/* ── STEP: Input ── */}
              {step === "input" && (
                <>
                  <button type="button" onClick={() => setStep("role")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.25rem", padding: 0 }}>
                    <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
                    {role === "owner" ? "🏢 オーナーとしてログイン" : "🔨 施工会社としてログイン"}
                  </button>

                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.25rem", lineHeight: 1.7 }}>
                    パスワード不要。メールリンクまたはGoogleで安全にログインできます。
                  </p>

                  {/* Google */}
                  <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.875rem", padding: "0.8125rem 1rem", marginBottom: "1rem", background: "white", cursor: googleLoading ? "not-allowed" : "pointer", fontSize: "0.9375rem", fontWeight: 600, color: "#374151", opacity: googleLoading ? 0.6 : 1, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    {googleLoading
                      ? <Loader2 style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280" }} />
                      : <GoogleIcon />
                    }
                    Googleでログイン
                  </button>

                  <Divider />

                  <form onSubmit={handleSubmit}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                      メールアドレス
                    </label>
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                      <Mail style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com" required autoFocus
                        style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.8125rem", paddingBottom: "0.8125rem", border: "1.5px solid #e5e7eb", borderRadius: "0.75rem", fontSize: "1rem", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" }} />
                    </div>
                    <button type="submit" disabled={loading || !email.trim()}
                      style={{ width: "100%", background: loading || !email.trim() ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", border: "none", borderRadius: "0.875rem", padding: "0.9375rem", fontWeight: 700, fontSize: "1rem", cursor: loading || !email.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: loading || !email.trim() ? "none" : "0 4px 12px rgba(37,99,235,0.35)" }}>
                      {loading
                        ? <><Loader2 style={{ width: "1rem", height: "1rem" }} />送信中…</>
                        : <><Mail style={{ width: "1rem", height: "1rem" }} />ログインリンクを送信</>
                      }
                    </button>
                  </form>

                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
                    ログインすることで
                    <a href="/terms" style={{ color: "#2563eb" }}>利用規約</a>・
                    <a href="/terms#privacy" style={{ color: "#2563eb" }}>プライバシーポリシー</a>
                    に同意します
                  </p>
                </>
              )}

              {/* ── STEP: Sent ── */}
              {step === "sent" && (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ width: "4.5rem", height: "4.5rem", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <CheckCircle style={{ width: "2.25rem", height: "2.25rem", color: "#22c55e" }} />
                  </div>
                  <h2 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.75rem", color: "#111827" }}>メールを送信しました</h2>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                    <strong style={{ color: "#374151" }}>{email}</strong> に<br />ログインリンクを送りました。<br />
                    <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>迷惑メールフォルダもご確認ください</span>
                  </p>
                  <button onClick={() => { setStep("role"); setEmail(""); }}
                    style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                    別のメールアドレスを使う
                  </button>
                </div>
              )}

              {/* ── STEP: Error ── */}
              {step === "error" && (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ width: "4.5rem", height: "4.5rem", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <AlertCircle style={{ width: "2.25rem", height: "2.25rem", color: "#ef4444" }} />
                  </div>
                  <h2 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.75rem", color: "#111827" }}>エラーが発生しました</h2>
                  <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{errorMsg}</p>
                  <button onClick={() => setStep("input")}
                    style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem 2rem", fontWeight: 700, cursor: "pointer" }}>
                    もう一度試す
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          {(step === "role" || step === "input") && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
              {[
                { icon: <Shield style={{ width: "0.875rem", height: "0.875rem", color: "#4ade80" }} />, text: "パスワード不要" },
                { icon: <Smartphone style={{ width: "0.875rem", height: "0.875rem", color: "#60a5fa" }} />, text: "スマホ対応" },
                { icon: <Zap style={{ width: "0.875rem", height: "0.875rem", color: "#fbbf24" }} />, text: "即座にログイン" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                  {b.icon}{b.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub components ──

function RoleButton({ icon, bg, borderColor, hoverBorder, cardBg, hoverCardBg, title, sub, titleColor, onClick }: any) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: "1rem",
        border: `2px solid ${hover ? hoverBorder : borderColor}`,
        borderRadius: "1rem", padding: "1rem 1.125rem",
        background: hover ? hoverCardBg : cardBg,
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.15s",
      }}>
      <div style={{ width: "3rem", height: "3rem", background: bg, borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "1rem", color: titleColor }}>{title}</div>
        <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{sub}</div>
      </div>
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      <span style={{ fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap" }}>またはメールで</span>
      <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
