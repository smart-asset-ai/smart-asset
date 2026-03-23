"use client";

const ownerPlans = [
  {
    name: "オーナー無料プラン",
    price: "¥0",
    sub: "ずっと無料",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    features: [
      "物件登録（無制限）",
      "AI診断・適正価格確認",
      "業者マップ検索",
      "チャット・見積もり受取",
      "電子契約・修繕台帳閲覧",
      "成約時のみ 成約額×0.5%",
    ],
  },
];

const contractorPlans = [
  {
    name: "FREEプラン",
    price: "¥0",
    sub: "永久無料",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    featured: false,
    dark: false,
    features: [
      "プロフィール・地図掲載",
      "AIスコア表示",
      "案件閲覧",
      "問い合わせ受信",
    ],
  },
  {
    name: "Aプラン",
    price: "¥3,000",
    sub: "/月（税込）",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#3b82f6",
    featured: false,
    dark: false,
    features: [
      "FREEプランの全機能",
      "案件への応募 10件/月",
      "チャット・ファイル送受信",
      "施工事例写真 3枚",
      "電子サイン契約（印紙税ゼロ）",
    ],
  },
  {
    name: "Bプラン",
    price: "¥6,000",
    sub: "/月（税込）",
    color: "#60a5fa",
    bg: "#0f172a",
    border: "#3b82f6",
    featured: true,
    dark: true,
    badge: "最上位プラン",
    features: [
      "Aプランの全機能",
      "案件への応募 20件/月",
      "優先表示（検索上位）",
      "施工事例写真 4枚＋会社写真 1枚",
      "AIスコア分析レポート",
      "専用バッジ表示",
    ],
  },
];

export default function Pricing() {
  return (
    <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>PRICING</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            シンプルな料金体系
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>まずは無料で始めて、必要になったら有料プランへ</p>
        </div>

        {/* Owner */}
        <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#374151", marginBottom: "1rem" }}>🏠 オーナー様</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem", marginBottom: "3rem", maxWidth: "420px" }}>
          {ownerPlans.map((p, i) => (
            <PlanCard key={i} plan={p} dark={false} />
          ))}
        </div>

        {/* Contractor */}
        <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#374151", marginBottom: "1rem" }}>🔨 施工会社様</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {contractorPlans.map((p, i) => (
            <PlanCard key={i} plan={p} dark={p.dark} />
          ))}
        </div>

        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8125rem", marginTop: "2rem" }}>
          ※ 施工会社様の有料プランはStripeによるクレジットカード決済。いつでもキャンセル可能。
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan, dark }: { plan: any; dark: boolean }) {
  return (
    <div style={{
      background: dark ? plan.bg : "#fff",
      borderRadius: "1.25rem",
      padding: "2rem",
      border: `2px solid ${plan.border}`,
      position: "relative",
      boxShadow: dark ? "0 8px 32px rgba(37,99,235,0.25)" : "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      {plan.badge && (
        <div style={{
          position: "absolute", top: "-0.875rem", left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff",
          padding: "0.25rem 1.25rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
        }}>
          {plan.badge}
        </div>
      )}
      <p style={{ color: dark ? "#93c5fd" : "#6b7280", fontWeight: 700, fontSize: "0.8125rem", marginBottom: "0.375rem" }}>{plan.name}</p>
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "2.25rem", fontWeight: 900, color: dark ? "#fff" : "#111827" }}>{plan.price}</span>
        <span style={{ fontSize: "0.875rem", color: dark ? "#93c5fd" : "#6b7280", marginLeft: "0.25rem" }}>{plan.sub}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {plan.features.map((f: string, j: number) => (
          <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: dark ? "#e2e8f0" : "#374151", fontSize: "0.875rem" }}>
            <span style={{ color: dark ? "#60a5fa" : plan.color, fontWeight: 800, flexShrink: 0, marginTop: "0.1rem" }}>✓</span>{f}
          </li>
        ))}
      </ul>
    </div>
  );
}
