"use client";

import { useState } from "react";
import Link from "next/link";

type SignState = "idle" | "signing_owner" | "owner_done" | "signing_contractor" | "both_done";

const CONTRACT = {
  title: "工事請負契約書",
  subtitle: "外壁塗装工事",
  property: "田中アパート（東京都渋谷区〇〇1-2-3）",
  rows: [
    { label: "工事金額", value: "¥580,000（税込）", highlight: false },
    { label: "前払い金（30%）", value: "¥174,000", highlight: false },
    { label: "完工時残金（70%）", value: "¥406,000", highlight: false },
    { label: "工　　期", value: "2026/04/07 〜 04/13（7日間）", highlight: false },
    { label: "保　　証", value: "10年保証（外壁塗膜剥離）", highlight: false },
    { label: "印　紙　代", value: "¥0（電子契約のため不要）", highlight: true },
  ],
};

export default function DemoSign() {
  const [state, setState]         = useState<SignState>("idle");
  const [ownerName, setOwnerName] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [error, setError]         = useState("");

  function startSign(who: "owner" | "contractor") {
    setNameInput("");
    setError("");
    setState(who === "owner" ? "signing_owner" : "signing_contractor");
  }

  function confirmSign() {
    if (nameInput.trim().length < 2) {
      setError("お名前を2文字以上入力してください");
      return;
    }
    if (state === "signing_owner") {
      setOwnerName(nameInput.trim());
      setState("owner_done");
    } else {
      setContractorName(nameInput.trim());
      setState("both_done");
    }
  }

  const isComplete = state === "both_done";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
        padding: "0.75rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem" }}>← ホーム</Link>
          <span style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            fontSize: "0.75rem", padding: "0.2rem 0.75rem",
            borderRadius: "9999px", fontWeight: 700,
          }}>
            🎮 デモモード — データは保存されません
          </span>
        </div>
        <a href="/demo/chat" style={{
          color: "rgba(255,255,255,0.8)", textDecoration: "none",
          fontSize: "0.8125rem", fontWeight: 600,
        }}>
          💬 チャットデモも見る
        </a>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            ELECTRONIC SIGNATURE DEMO
          </p>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            電子署名デモ
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>
            実際の署名フローを体験できます。印紙代ゼロ・その日のうちに契約締結。
          </p>
        </div>

        {/* Completion overlay */}
        {isComplete && (
          <div style={{
            background: "linear-gradient(135deg,#dcfce7,#ecfdf5)",
            border: "2px solid #86efac", borderRadius: "1.5rem",
            padding: "2.5rem", textAlign: "center", marginBottom: "2rem",
            boxShadow: "0 8px 32px rgba(22,163,74,0.2)",
          }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <h2 style={{ fontWeight: 900, fontSize: "1.75rem", color: "#15803d", marginBottom: "0.5rem" }}>
              契約締結完了！
            </h2>
            <p style={{ color: "#374151", fontSize: "0.9375rem", marginBottom: "1.25rem" }}>
              PDF契約書が自動発行されました。クラウドに永続保管されます。
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.875rem",
                padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{ fontSize: "1.25rem" }}>📄</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "#15803d" }}>PDF自動発行</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>contract_2026_0407.pdf</p>
                </div>
              </div>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.875rem",
                padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{ fontSize: "1.25rem" }}>☁️</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "#15803d" }}>クラウド保管</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>永続保存・修繕台帳に記録</p>
                </div>
              </div>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.875rem",
                padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{ fontSize: "1.25rem" }}>💰</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "#15803d" }}>印紙代節約</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>¥20,000 → ¥0（100%削減）</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setState("idle"); setOwnerName(""); setContractorName(""); }}
              style={{
                marginTop: "1.5rem", background: "rgba(22,163,74,0.1)", border: "1px solid #86efac",
                color: "#15803d", padding: "0.625rem 1.5rem", borderRadius: "0.75rem",
                fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              }}>
              🔄 もう一度試す
            </button>
          </div>
        )}

        {/* Contract document */}
        <div style={{
          background: "#fff", borderRadius: "1.25rem", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.09)", border: "1px solid #e5e7eb",
          marginBottom: "1.5rem",
        }}>
          {/* Contract header */}
          <div style={{
            background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
            padding: "1.75rem 2rem",
          }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: "0.375rem", letterSpacing: "0.05em" }}>
              電子工事請負契約書 — デモ
            </p>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "1.375rem", marginBottom: "0.25rem" }}>
              {CONTRACT.subtitle}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
              📍 {CONTRACT.property}
            </p>
          </div>

          {/* Contract rows */}
          <div style={{ padding: "1.5rem 2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {CONTRACT.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.875rem 0", color: "#9ca3af", fontSize: "0.875rem", width: "40%" }}>
                      {row.label}
                    </td>
                    <td style={{
                      padding: "0.875rem 0", fontWeight: 700, fontSize: "0.9375rem",
                      color: row.highlight ? "#16a34a" : "#111827",
                    }}>
                      {row.highlight && <span style={{ marginRight: "0.375rem" }}>✅</span>}
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature section */}
          <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "1rem", flexWrap: "wrap" }}>

            {/* Owner sig box */}
            <div style={{
              flex: 1, minWidth: "200px",
              background: ownerName ? "#f0fdf4" : "#fafafa",
              border: `2px solid ${ownerName ? "#86efac" : "#e5e7eb"}`,
              borderRadius: "1rem", padding: "1.25rem",
              transition: "all 0.3s",
            }}>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>オーナー署名</p>
              {ownerName ? (
                <>
                  <p style={{
                    fontFamily: "cursive", fontSize: "1.625rem", color: "#1e3a8a",
                    fontWeight: 700, marginBottom: "0.375rem",
                  }}>
                    {ownerName}
                  </p>
                  <p style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                    {new Date().toLocaleDateString("ja-JP")} ✓ 電子認証済み
                  </p>
                  <span style={{
                    display: "inline-block", marginTop: "0.5rem",
                    background: "#dcfce7", color: "#15803d",
                    fontSize: "0.6875rem", padding: "0.2rem 0.625rem",
                    borderRadius: "9999px", fontWeight: 700,
                  }}>
                    ✓ 署名完了
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    height: "2.5rem", borderBottom: "2px dashed #d1d5db",
                    marginBottom: "0.625rem",
                  }} />
                  <button
                    onClick={() => startSign("owner")}
                    style={{
                      background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                      color: "#fff", border: "none", borderRadius: "0.625rem",
                      padding: "0.5rem 1.25rem", fontWeight: 700,
                      fontSize: "0.8125rem", cursor: "pointer", width: "100%",
                    }}>
                    ✍️ オーナーとして署名
                  </button>
                </>
              )}
            </div>

            {/* Contractor sig box */}
            <div style={{
              flex: 1, minWidth: "200px",
              background: contractorName ? "#f0fdf4" : "#fafafa",
              border: `2px solid ${contractorName ? "#86efac" : (ownerName ? "#e5e7eb" : "#e5e7eb")}`,
              borderRadius: "1rem", padding: "1.25rem",
              opacity: !ownerName ? 0.5 : 1,
              transition: "all 0.3s",
            }}>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>施工会社署名</p>
              {contractorName ? (
                <>
                  <p style={{
                    fontFamily: "cursive", fontSize: "1.625rem", color: "#1e3a8a",
                    fontWeight: 700, marginBottom: "0.375rem",
                  }}>
                    {contractorName}
                  </p>
                  <p style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                    {new Date().toLocaleDateString("ja-JP")} ✓ 電子認証済み
                  </p>
                  <span style={{
                    display: "inline-block", marginTop: "0.5rem",
                    background: "#dcfce7", color: "#15803d",
                    fontSize: "0.6875rem", padding: "0.2rem 0.625rem",
                    borderRadius: "9999px", fontWeight: 700,
                  }}>
                    ✓ 署名完了
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    height: "2.5rem", borderBottom: "2px dashed #d1d5db",
                    marginBottom: "0.625rem",
                  }} />
                  <button
                    disabled={!ownerName}
                    onClick={() => ownerName && startSign("contractor")}
                    style={{
                      background: ownerName
                        ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                        : "#e5e7eb",
                      color: ownerName ? "#fff" : "#9ca3af",
                      border: "none", borderRadius: "0.625rem",
                      padding: "0.5rem 1.25rem", fontWeight: 700,
                      fontSize: "0.8125rem",
                      cursor: ownerName ? "pointer" : "not-allowed",
                      width: "100%",
                    }}>
                    {ownerName ? "✍️ 施工会社として署名" : "オーナー署名後に解放"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            padding: "1rem 2rem",
            background: isComplete ? "linear-gradient(135deg,#f0fdf4,#ecfdf5)" : "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "オーナー署名", done: !!ownerName },
                { label: "施工会社署名", done: !!contractorName },
                { label: "PDF発行", done: isComplete },
                { label: "クラウド保管", done: isComplete },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <div style={{
                    width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                    background: s.done ? "#16a34a" : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.5625rem", color: "#fff", fontWeight: 900,
                  }}>
                    {s.done ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: s.done ? "#15803d" : "#9ca3af", fontWeight: s.done ? 700 : 400 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {isComplete && (
              <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px" }}>
                🎉 締結完了
              </span>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "💰", title: "印紙代ゼロ", desc: "電子契約は収入印紙不要。¥20,000〜¥60,000の節約。" },
            { icon: "⚡", title: "当日中に締結", desc: "郵送・持参不要。スマホで完結。" },
            { icon: "🔒", title: "法的効力あり", desc: "電子署名法に準拠。裁判でも有効な証拠。" },
            { icon: "☁️", title: "永続クラウド保管", desc: "PDF自動発行・修繕台帳に自動記録。" },
          ].map((c, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "1rem", padding: "1.25rem",
              border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <span style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}>{c.icon}</span>
              <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#111827", marginBottom: "0.25rem" }}>{c.title}</p>
              <p style={{ color: "#6b7280", fontSize: "0.8125rem", lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
          borderRadius: "1.5rem", padding: "2rem",
          textAlign: "center", boxShadow: "0 8px 32px rgba(37,99,235,0.2)",
        }}>
          <h3 style={{ fontWeight: 900, fontSize: "1.375rem", color: "#fff", marginBottom: "0.5rem" }}>
            実際に使ってみませんか？
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
            登録無料・オーナー様は永久無料・施工会社様は¥3,000/月〜
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/auth" style={{
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: "#fff", padding: "0.875rem 2rem", borderRadius: "0.875rem",
              textDecoration: "none", fontWeight: 800, fontSize: "1rem",
              boxShadow: "0 4px 16px rgba(37,99,235,0.5)", display: "inline-block",
            }}>
              無料でアカウント作成 →
            </a>
            <a href="/demo/chat" style={{
              background: "rgba(255,255,255,0.1)", color: "#fff",
              padding: "0.875rem 1.5rem", borderRadius: "0.875rem",
              textDecoration: "none", fontWeight: 700, fontSize: "1rem",
              border: "1px solid rgba(255,255,255,0.2)", display: "inline-block",
            }}>
              💬 チャットデモを試す
            </a>
          </div>
        </div>
      </div>

      {/* Signature modal */}
      {(state === "signing_owner" || state === "signing_contractor") && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setState(state === "signing_owner" ? "idle" : "owner_done"); }}
        >
          <div style={{
            background: "#fff", borderRadius: "1.5rem",
            padding: "2rem", width: "100%", maxWidth: "420px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}>
            <h3 style={{ fontWeight: 900, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.375rem" }}>
              ✍️ 電子署名
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {state === "signing_owner" ? "オーナーとして" : "施工会社として"}署名します
            </p>

            <label style={{ display: "block", fontWeight: 700, fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
              お名前（漢字・ひらがな）
            </label>
            <input
              autoFocus
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setError(""); }}
              onKeyDown={e => { if (e.key === "Enter") confirmSign(); }}
              placeholder={state === "signing_owner" ? "例：田中 誠一" : "例：山田 太郎"}
              style={{
                width: "100%", border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`,
                borderRadius: "0.875rem", padding: "0.875rem 1rem",
                fontSize: "1rem", outline: "none", boxSizing: "border-box",
                marginBottom: "0.5rem",
              }}
            />

            {/* Preview */}
            {nameInput && (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "0.75rem", padding: "0.875rem 1rem",
                marginBottom: "0.875rem", textAlign: "center",
              }}>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>署名プレビュー</p>
                <p style={{ fontFamily: "cursive", fontSize: "1.75rem", color: "#1e3a8a", fontWeight: 700 }}>
                  {nameInput}
                </p>
              </div>
            )}

            {error && <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</p>}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setState(state === "signing_owner" ? "idle" : "owner_done")}
                style={{
                  flex: 1, background: "#f8fafc", border: "1px solid #e5e7eb",
                  color: "#6b7280", padding: "0.75rem", borderRadius: "0.75rem",
                  fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer",
                }}>
                キャンセル
              </button>
              <button
                onClick={confirmSign}
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  color: "#fff", border: "none", borderRadius: "0.75rem",
                  padding: "0.75rem", fontWeight: 800, fontSize: "0.9375rem",
                  cursor: "pointer",
                }}>
                この署名で確定する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
