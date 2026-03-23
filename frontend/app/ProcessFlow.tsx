"use client";

const ownerSteps = [
  { step: "01", icon: "🏠", title: "物件登録",        desc: "物件情報を入力。AI診断で適正価格を即算出" },
  { step: "02", icon: "🤖", title: "AI診断・掲載",    desc: "AIスコアが業者を自動ランキング。優良業者が見つかる" },
  { step: "03", icon: "💬", title: "チャットで交渉",  desc: "複数業者から見積もり受取。チャットで詳細確認" },
  { step: "04", icon: "📝", title: "電子契約締結",    desc: "印紙代ゼロ。スマホで署名して即契約完了" },
  { step: "05", icon: "✅", title: "工事・完了管理",  desc: "進捗確認・写真管理・修繕台帳が自動生成" },
];

const contractorSteps = [
  { step: "01", icon: "📋", title: "プロフィール登録", desc: "実績・得意エリアを登録。AIスコアで信頼可視化" },
  { step: "02", icon: "🔍", title: "案件発見",         desc: "エリア・工種でフィルタ。マップで物件を確認" },
  { step: "03", icon: "📤", title: "見積もり提出",     desc: "チャットで現地調査報告・見積書を送付" },
  { step: "04", icon: "✍️", title: "電子契約で受注",  desc: "印紙税ゼロ・即日契約。請求書も自動生成" },
  { step: "05", icon: "⭐", title: "評価でランクアップ", desc: "完工後レビューがAIスコアに反映。次案件受注に好影響" },
];

export default function ProcessFlow() {
  return (
    <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>HOW IT WORKS</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a" }}>
            ご利用の流れ
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "2.5rem" }}>
          {[
            { title: "オーナー様", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", steps: ownerSteps },
            { title: "施工会社様", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", steps: contractorSteps },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "0.25rem", height: "1.5rem", background: col.color, borderRadius: "9999px" }} />
                <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0f172a" }}>{col.title}</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {col.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                    {/* connector */}
                    {i < col.steps.length - 1 && (
                      <div style={{ position: "absolute", left: "1.1875rem", top: "2.75rem", width: "2px", height: "calc(100% - 0.5rem)", background: `${col.border}` }} />
                    )}
                    {/* Circle */}
                    <div style={{ flexShrink: 0, width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: col.bg, border: `2px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", zIndex: 1 }}>
                      {s.icon}
                    </div>
                    <div style={{ paddingBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: col.color, fontWeight: 800, fontSize: "0.75rem" }}>STEP {s.step}</span>
                        <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#111827" }}>{s.title}</span>
                      </div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
