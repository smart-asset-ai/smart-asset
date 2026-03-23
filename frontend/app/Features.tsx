"use client";

const features = [
  {
    icon: "🤖",
    color: "#7c3aed",
    bg: "#f5f3ff",
    title: "AI診断・スコアリング",
    desc: "見積金額の適正価格をAIが瞬時に判断。業者のAIスコアで信頼できる職人を一目で発見できます。",
    badge: "無料",
    href: "/features/ai",
  },
  {
    icon: "📝",
    color: "#2563eb",
    bg: "#eff6ff",
    title: "電子契約（印紙税ゼロ）",
    desc: "スマホで電子署名。印紙代・郵送費ゼロで法的に有効な契約書をPDFで自動発行します。",
    badge: "法的有効",
    href: "/features/contract",
  },
  {
    icon: "💬",
    color: "#0891b2",
    bg: "#ecfeff",
    title: "リアルタイムチャット",
    desc: "LINEのような使いやすさ。見積もり交渉・写真共有・ファイル送受信がすべてチャット内で完結。",
    badge: "既読機能",
    href: "/features/chat",
  },
  {
    icon: "🗺️",
    color: "#16a34a",
    bg: "#f0fdf4",
    title: "地図マッチング",
    desc: "物件の近くにいる優良業者をマップで検索。AIスコア上位の業者が優先表示されます。",
    badge: "GPS対応",
    href: "/features/map",
  },
  {
    icon: "📊",
    color: "#ea580c",
    bg: "#fff7ed",
    title: "修繕台帳・履歴管理",
    desc: "工事写真・契約書・完了報告が自動でクラウド保存。建物の資産価値を証明する台帳が積み上がります。",
    badge: "自動保存",
    href: "/features/ledger",
  },
  {
    icon: "💳",
    color: "#0f172a",
    bg: "#f1f5f9",
    title: "Stripe決済管理",
    desc: "請求書発行から入金確認まで一元管理。未払いリマインドも自動化。経理業務を大幅削減。",
    badge: "自動請求",
    href: "/features/payment",
  },
];

export default function Features() {
  return (
    <section style={{ padding: "5rem 0", background: "#fff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>FEATURES</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            業務のすべてがアプリ内で完結
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "40rem", margin: "0 auto" }}>
            見積もり依頼から電子契約・工事管理・修繕台帳まで、不動産修繕に必要な機能をワンストップで提供
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ width: "3.25rem", height: "3.25rem", background: f.bg, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                  {f.icon}
                </div>
                <span style={{ background: f.bg, color: f.color, padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
                  {f.badge}
                </span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7, flex: 1 }}>{f.desc}</p>
              <a href={f.href} style={{
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                color: f.color, fontWeight: 700, fontSize: "0.875rem",
                textDecoration: "none", marginTop: "1.25rem",
              }}>
                詳細を見る →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
