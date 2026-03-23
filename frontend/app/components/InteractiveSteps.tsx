"use client";

import { useState } from "react";

type Role = "owner" | "contractor";

const OWNER_STEPS = [
  {
    icon: "🤖", title: "AI建物診断",    time: "約5分", free: true,
    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
    desc: "スマホで建物を撮影するだけ。AIが外壁・屋根・防水の劣化状態を判定し、修繕優先度と概算費用をまとめたレポートを即時生成します。",
    points: ["外壁・屋根の劣化度を自動判定", "修繕優先度を高中低の3段階で評価", "概算工事費用の目安を即提示", "業者選びに必要な情報を整理"],
    cta: { label: "🤖 AI診断を無料で試す", href: "/diagnosis" },
  },
  {
    icon: "🗺️", title: "業者マップ検索", time: "約2分", free: true,
    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
    desc: "物件の周辺にいる優良業者をAIスコア付きの地図で検索。S〜Eランクで業者の信頼度が一目でわかり、実績・口コミ・対応エリアもすぐ確認できます。",
    points: ["AIスコアS〜Eランクで信頼度を可視化", "地図上でエリア絞り込み", "実績・口コミ・対応工種を確認", "プロフィールページへワンタップ"],
    cta: { label: "🗺️ 業者マップを見る", href: "/contractors" },
  },
  {
    icon: "💬", title: "チャットで見積り", time: "リアルタイム", free: true,
    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
    desc: "LINEのようなチャットで複数業者と同時にやり取り。写真・PDF・見積書をその場で送受信でき、工事の詳細確認から価格交渉まですべてアプリ内で完結します。",
    points: ["複数業者への一括見積り依頼", "写真・PDF・見積書を即共有", "既読確認つきのリアルタイム通知", "過去のやり取りを全件記録・検索"],
    cta: { label: "💬 チャットデモを体験", href: "/demo/chat" },
  },
  {
    icon: "✍️", title: "電子契約締結",   time: "当日中", free: true,
    color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
    desc: "見積もりが決まったらスマホで電子署名するだけ。印紙代・郵送費が完全ゼロになり、その日のうちに契約締結できます。PDF契約書も自動発行。",
    points: ["印紙代¥20,000〜¥60,000が完全ゼロ", "当日契約締結が可能", "PDF契約書を自動発行", "クラウドに永続保管"],
    cta: { label: "✍️ 電子署名デモを体験", href: "/demo/sign" },
  },
  {
    icon: "🗂️", title: "修繕台帳・完了管理", time: "自動", free: true,
    color: "#ea580c", bg: "#fff7ed", border: "#fed7aa",
    desc: "工事写真・契約書・完了報告が自動でクラウド保存。積み上がった修繕台帳は建物の価値証明になり、売却・保険申請・確定申告の根拠資料として活用できます。",
    points: ["修繕履歴が自動でクラウド蓄積", "売却時の建物価値証明に活用", "保険申請・確定申告の根拠資料", "写真・契約書を永続保管"],
    cta: { label: "台帳デモを見る", href: "/map-demo" },
  },
];

const CONTRACTOR_STEPS = [
  {
    icon: "📋", title: "プロフィール登録", time: "約10分", free: true,
    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
    desc: "会社情報・得意工種・対応エリア・施工事例を登録すると、AIが自動でスコアを算出して地図に表示します。写真で実績をアピールできます。",
    points: ["AIスコアで信頼性を数値化・可視化", "地図ピンで周辺オーナーにアピール", "施工事例写真で実力を証明", "対応エリア・工種を細かく設定"],
    cta: { label: "📋 業者登録（無料）", href: "/contractors/register" },
  },
  {
    icon: "🔍", title: "案件発見・応募",  time: "いつでも", free: false,
    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
    desc: "エリア・工種でフィルタして物件を発見。地図で物件の場所を確認してから応募できます。Aプランで月10件、Bプランで月20件まで応募可能。",
    points: ["エリア・工種フィルタで絞り込み", "地図で物件の場所を確認", "月10〜20件の応募枠", "AIマッチングで自分に合う案件を優先表示"],
    cta: { label: "プランを見る", href: "/#pricing" },
  },
  {
    icon: "💬", title: "見積り提出・交渉", time: "リアルタイム", free: false,
    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
    desc: "チャットで現地調査報告・見積書を送付。オーナーと直接やり取りして受注確率を上げます。写真やPDFもその場で共有可能。",
    points: ["ファイル・写真を即共有", "リアルタイムメッセージで返信率アップ", "見積書PDFを簡単送付", "価格交渉もチャット内で完結"],
    cta: { label: "💬 チャットデモを体験", href: "/demo/chat" },
  },
  {
    icon: "✍️", title: "電子契約で受注",  time: "即日", free: false,
    color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
    desc: "印紙税ゼロ・即日契約で受注コストを大幅削減。工事請負契約書はPDF自動発行。請求書・前払い確認も自動生成されます。",
    points: ["印紙税ゼロで受注コストを削減", "当日受注・即着工が可能", "前払い30%・完工時残金70%を管理", "請求書を自動生成"],
    cta: { label: "✍️ 電子署名デモを体験", href: "/demo/sign" },
  },
  {
    icon: "⭐", title: "評価でランクアップ", time: "施工完了後", free: true,
    color: "#ea580c", bg: "#fff7ed", border: "#fed7aa",
    desc: "完工後のオーナー評価がAIスコアに直接反映。スコアが上がるほど地図での表示順位が上がり、次の受注につながる好循環が生まれます。",
    points: ["オーナー評価がAIスコアに直結", "ランクアップで検索上位に表示", "実績の見える化で新規顧客獲得", "優良業者バッジで信頼性アップ"],
    cta: { label: "AIスコアの仕組みを確認", href: "/contractors" },
  },
];

export default function InteractiveSteps() {
  const [role, setRole]       = useState<Role>("owner");
  const [active, setActive]   = useState(0);

  const steps = role === "owner" ? OWNER_STEPS : CONTRACTOR_STEPS;
  const step  = steps[active];

  return (
    <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            ご利用の流れ
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>各ステップをクリックして詳細を確認</p>
        </div>

        {/* Role tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          {(["owner","contractor"] as Role[]).map(r => (
            <button key={r} onClick={() => { setRole(r); setActive(0); }} style={{
              padding: "0.625rem 1.75rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.9375rem",
              border: "2px solid",
              borderColor: role === r ? "#2563eb" : "#e5e7eb",
              background: role === r ? "#2563eb" : "#fff",
              color: role === r ? "#fff" : "#6b7280",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {r === "owner" ? "🏠 オーナー" : "🔨 施工会社"}
            </button>
          ))}
        </div>

        {/* Step number buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding: "0.5rem 1.25rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.875rem",
              border: "2px solid",
              borderColor: active === i ? step.color : "#e5e7eb",
              background: active === i ? step.color : "#fff",
              color: active === i ? "#fff" : "#6b7280",
              cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "0.375rem",
            }}>
              <span style={{
                width: "1.25rem", height: "1.25rem", borderRadius: "50%",
                background: active === i ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.625rem", fontWeight: 900,
                color: active === i ? "#fff" : "#9ca3af",
              }}>
                {i + 1}
              </span>
              <span style={{ display: "none" }}>Step</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Detail card */}
        <div style={{
          background: "#fff", borderRadius: "1.5rem",
          border: `2px solid ${step.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
          overflow: "hidden",
          transition: "border-color 0.3s",
        }}>
          {/* Card header */}
          <div style={{
            background: `linear-gradient(135deg, ${step.bg}, #fff)`,
            padding: "2rem",
            borderBottom: `1px solid ${step.border}`,
            display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap",
          }}>
            <div style={{
              width: "4rem", height: "4rem", borderRadius: "1.25rem",
              background: "#fff", border: `2px solid ${step.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
            }}>
              {step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span style={{
                  background: step.bg, color: step.color,
                  fontSize: "0.6875rem", fontWeight: 700,
                  padding: "0.2rem 0.625rem", borderRadius: "9999px",
                  border: `1px solid ${step.border}`,
                }}>
                  STEP {active + 1}
                </span>
                <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>⏱ {step.time}</span>
                {step.free && (
                  <span style={{ background: "#f0fdf4", color: "#15803d", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #bbf7d0" }}>
                    無料
                  </span>
                )}
              </div>
              <h3 style={{ fontWeight: 900, fontSize: "1.375rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                {step.title}
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.75, maxWidth: "42rem" }}>
                {step.desc}
              </p>
            </div>
          </div>

          {/* Points + CTA */}
          <div style={{ padding: "1.75rem 2rem", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "220px" }}>
              {step.points.map((pt, j) => (
                <li key={j} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{
                    width: "1.375rem", height: "1.375rem", borderRadius: "50%",
                    background: step.bg, border: `1px solid ${step.border}`,
                    color: step.color, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.625rem", fontWeight: 900,
                    flexShrink: 0, marginTop: "0.1rem",
                  }}>
                    ✓
                  </span>
                  <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6 }}>{pt}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "200px" }}>
              <a href={step.cta.href} style={{
                background: step.color,
                color: "#fff", textDecoration: "none",
                padding: "0.875rem 1.75rem", borderRadius: "0.875rem",
                fontWeight: 800, fontSize: "0.9375rem",
                display: "inline-block", textAlign: "center",
                boxShadow: `0 4px 16px ${step.color}40`,
                transition: "opacity 0.2s",
              }}>
                {step.cta.label}
              </a>
              {/* Next step button */}
              {active < steps.length - 1 && (
                <button onClick={() => setActive(active + 1)} style={{
                  background: "#f8fafc", border: "1px solid #e5e7eb",
                  color: "#6b7280", padding: "0.75rem 1.25rem", borderRadius: "0.875rem",
                  fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                }}>
                  次のステップ →
                </button>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ padding: "0 2rem 1.5rem", display: "flex", gap: "0.375rem" }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setActive(i)} style={{
                flex: i === active ? 3 : 1,
                height: "4px", borderRadius: "9999px",
                background: i === active ? step.color : "#e5e7eb",
                cursor: "pointer", transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
