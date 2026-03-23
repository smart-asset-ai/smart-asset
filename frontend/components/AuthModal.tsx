"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AIMascot from "@/components/AIMascot";
import { X, Mail, CheckCircle, AlertCircle, Loader2, Building2, HardHat } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

type Step = "role" | "input" | "sent" | "error";
type Role = "owner" | "contractor" | null;

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>(null);
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
      // Store role intent before sending magic link
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
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
    >
      <div style={{
        background: "white", borderRadius: "1.25rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        width: "100%", maxWidth: "420px", overflow: "hidden",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", padding: "1.25rem 1.5rem" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "0.5rem", padding: "0.375rem", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AIMascot size={40} animated={false} bg1="#1e3a8a" bg2="#1e40af" style={{ borderRadius: "0.5rem" }} />
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1.0625rem" }}>Smart Asset AI</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8125rem" }}>ログイン / アカウント作成</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>

          {/* STEP: Role Selection */}
          {step === "role" && (
            <>
              <p style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 700, marginBottom: "1.25rem", textAlign: "center" }}>
                どちらとしてログインしますか？
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("owner")}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    border: "2px solid #dbeafe", borderRadius: "1rem",
                    padding: "1rem 1.25rem", background: "#eff6ff",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLButtonElement).style.background = "#dbeafe"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#dbeafe"; (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; }}
                >
                  <div style={{ width: "3rem", height: "3rem", background: "#2563eb", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1e3a8a" }}>オーナー（建物所有者）</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>物件登録・AI診断・業者検索</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("contractor")}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    border: "2px solid #dcfce7", borderRadius: "1rem",
                    padding: "1rem 1.25rem", background: "#f0fdf4",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#16a34a"; (e.currentTarget as HTMLButtonElement).style.background = "#dcfce7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#dcfce7"; (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; }}
                >
                  <div style={{ width: "3rem", height: "3rem", background: "#16a34a", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HardHat style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#14532d" }}>施工会社</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>物件情報・修繕依頼の確認</div>
                  </div>
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
                ※オーナーと業者を兼ねる場合はそれぞれ別にログインできます
              </p>
            </>
          )}

          {/* STEP: Email Input */}
          {step === "input" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <button type="button" onClick={() => setStep("role")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  ← 戻る
                </button>
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  {role === "owner" ? "🏢 オーナーとしてログイン" : "🔨 施工会社としてログイン"}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.25rem" }}>
                パスワード不要でメールリンク認証、またはGoogleで安全にログインできます。
              </p>

              {/* Google */}
              <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1rem", background: "white", cursor: "pointer", fontSize: "0.9375rem", fontWeight: 600, color: "#374151", opacity: googleLoading ? 0.6 : 1 }}>
                {googleLoading ? (
                  <Loader2 style={{ width: "1.25rem", height: "1.25rem", animation: "spin 1s linear infinite", color: "#6b7280", flexShrink: 0 }} />
                ) : (
                  <svg style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Googleでログイン
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>またはメールで</span>
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              </div>

              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>メールアドレス</label>
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <Mail style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                    style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={loading || !email.trim()}
                  style={{ width: "100%", background: loading || !email.trim() ? "#93c5fd" : "#2563eb", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.875rem", fontWeight: 700, fontSize: "0.9375rem", cursor: loading || !email.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {loading ? <><Loader2 style={{ width: "1rem", height: "1rem" }} />送信中...</> : <><Mail style={{ width: "1rem", height: "1rem" }} />ログインリンクを送信</>}
                </button>
              </form>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
                ログインすることで<a href="/terms" style={{ color: "#2563eb" }}>利用規約</a>・<a href="/terms#privacy" style={{ color: "#2563eb" }}>プライバシーポリシー</a>に同意します
              </p>
            </>
          )}

          {step === "sent" && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ width: "4rem", height: "4rem", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <CheckCircle style={{ width: "2rem", height: "2rem", color: "#22c55e" }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>メールを送信しました</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                <strong style={{ color: "#374151" }}>{email}</strong> にログインリンクを送信しました。<br />
                メールを開いてリンクをクリックしてください。<br />
                <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>※迷惑メールフォルダもご確認ください</span>
              </p>
              <button onClick={() => { setStep("role"); setEmail(""); }} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                別のメールアドレスを使う
              </button>
            </div>
          )}

          {step === "error" && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ width: "4rem", height: "4rem", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <AlertCircle style={{ width: "2rem", height: "2rem", color: "#ef4444" }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>エラーが発生しました</h3>
              <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{errorMsg}</p>
              <button onClick={() => setStep("input")} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.625rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
                もう一度試す
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
