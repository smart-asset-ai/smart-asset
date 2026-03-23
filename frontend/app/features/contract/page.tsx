"use client";

import Link from "next/link";

const steps = [
  { num: "01", icon: "📋", title: "見積もりに合意", desc: "チャット内で金額・工事内容に合意したら「電子契約を作成」をタップ。見積書が自動で契約書ひな型に変換されます。" },
  { num: "02", icon: "✍️", title: "スマホで電子署名", desc: "両者がスマホ・PC上でサインするだけ。場所を問わず、郵送不要で数分以内に契約が締結できます。" },
  { num: "03", icon: "📄", title: "PDF契約書が自動発行", desc: "署名完了後、法的に有効なPDF契約書がすぐに発行され、双方のアカウントに保存されます。" },
];

const savings = [
  { label: "印紙代（工事金額100万〜200万円の場合）", traditional: "2,000円", sa: "0円", note: "電子文書は非課税" },
  { label: "印紙代（工事金額200万〜300万円の場合）", traditional: "2,000円", sa: "0円", note: "" },
  { label: "印紙代（工事金額1,000万円超の場合）", traditional: "10,000円〜", sa: "0円", note: "" },
  { label: "郵送費（書留往復）", traditional: "1,000円〜", sa: "0円", note: "" },
  { label: "契約締結にかかる時間", traditional: "1〜2週間", sa: "数分", note: "即日完了" },
];

const legalPoints = [
  { icon: "⚖️", title: "電子署名法に準拠", desc: "電子署名及び認証業務に関する法律（電子署名法）に基づいた法的有効性があります。" },
  { icon: "🔒", title: "改ざん防止技術", desc: "署名後のドキュメントはハッシュ値で保護。内容の改ざんを技術的に防止します。" },
  { icon: "📁", title: "クラウド永久保存", desc: "署名済み契約書はクラウドに永久保存。いつでもPDFダウンロードが可能です。" },
  { icon: "🧾", title: "建設工事に対応", desc: "建設工事請負契約書・設備工事契約・リフォーム契約など幅広い工事種別に対応。" },
];

export default function ContractFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#0284c7 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-6rem", right: "-6rem", width: "28rem", height: "28rem", background: "radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#bfdbfe", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — 電子契約</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            印紙税ゼロ。スマホで<br />
            <span style={{ background: "linear-gradient(135deg,#bfdbfe,#7dd3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              即日・法的有効な電子契約
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            印紙代2,000円〜10,000円が完全ゼロに。郵送不要で数分以内に契約締結。工事開始までの時間を大幅に短縮します。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["印紙税ゼロ", "即日締結", "法的有効", "PDF自動発行"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Table */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>COST SAVING</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
              電子契約で削減できるコスト
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>電子文書は印紙税法の課税対象外。毎回の工事で必ず節約できます。</p>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg,#1d4ed8,#0284c7)", color: "#fff" }}>
                  {["項目", "紙の契約書", "Smart Asset 電子契約", "備考"].map((h) => (
                    <th key={h} style={{ padding: "1rem 1.25rem", textAlign: h === "項目" ? "left" : "center", fontWeight: 700, fontSize: "0.9375rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {savings.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                    <td style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>{row.label}</td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "center", color: "#ef4444", fontWeight: 700 }}>{row.traditional}</td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "center", color: "#16a34a", fontWeight: 800 }}>{row.sa}</td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "center", color: "#6b7280", fontSize: "0.8125rem" }}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "2rem", background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", borderRadius: "1.25rem", padding: "1.5rem 2rem", border: "1px solid #bfdbfe", textAlign: "center" }}>
            <p style={{ fontSize: "1.125rem", color: "#374151", fontWeight: 600 }}>
              年間10件の工事契約で&nbsp;
              <span style={{ fontSize: "1.875rem", fontWeight: 900, color: "#16a34a" }}>最大10万円以上</span>
              &nbsp;の節約
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>HOW IT WORKS</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>契約締結まで3ステップ</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "2rem" }}>
            {steps.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", background: "linear-gradient(135deg,#1d4ed8,#0284c7)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: "2rem", color: "#e5e7eb", lineHeight: 1 }}>{s.num}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.5rem" }}>{s.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Points */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>LEGAL & SECURITY</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>法的有効性と安全性</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem" }}>
            {legalPoints.map((lp, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{lp.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "0.5rem" }}>{lp.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{lp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#1e3a8a,#2563eb)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            電子契約を今すぐ体験する
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            登録後3ヶ月間は電子サイン含む全機能が無料。3ヶ月後はBプラン¥880/月（税込）で継続利用できます。無料のまま登録は維持されます。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/auth" style={{ background: "#fff", color: "#2563eb", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              無料で始める →
            </a>
            <Link href="/" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "1rem 1.75rem", borderRadius: "0.875rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)" }}>
              ← トップに戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
