"use client";

import Link from "next/link";

const ledgerItems = [
  { icon: "📸", color: "#ea580c", title: "工事前後の写真記録", desc: "着工前・工事中・完了後の写真を自動タグ付けで保存。「どこを工事したか」が写真で一目でわかります。" },
  { icon: "📄", color: "#2563eb", title: "契約書・見積書の自動保管", desc: "電子契約で締結した契約書・見積書がすべて自動保存。PDFとしていつでもダウンロード可能。" },
  { icon: "📅", color: "#7c3aed", title: "工事履歴のタイムライン", desc: "いつ・どこを・いくらで修繕したかが時系列で表示されます。建物ごとの修繕歴が一覧管理できます。" },
  { icon: "💰", color: "#16a34a", title: "修繕コストの累計管理", desc: "工事費用の累計が自動で集計されます。年間の修繕費を把握して予算管理に活用できます。" },
  { icon: "🔔", color: "#ea580c", title: "修繕時期のリマインド", desc: "「この設備は○年後に交換時期」を自動でリマインド。計画的な修繕で突発的な大きな出費を防ぎます。" },
  { icon: "📊", color: "#0891b2", title: "資産価値レポートの出力", desc: "修繕履歴・写真・コストを一括でPDFに出力。売却・保険申請・確定申告で資産価値を証明できます。" },
];

const usages = [
  {
    icon: "🏠",
    color: "#16a34a",
    title: "売却・査定時",
    desc: "「築20年でも修繕履歴がしっかりある」は大きな武器。修繕台帳を提示することで適正な査定額を引き出せます。",
  },
  {
    icon: "🛡️",
    color: "#2563eb",
    title: "保険申請時",
    desc: "火災・地震保険の申請に必要な工事記録・写真・費用証明がすべて揃っています。申請書類の準備が大幅に楽になります。",
  },
  {
    icon: "📋",
    color: "#7c3aed",
    title: "確定申告時",
    desc: "修繕費の領収書・契約書が一箇所に整理されているので、確定申告の経費計算が格段に楽になります。",
  },
  {
    icon: "🔧",
    color: "#ea580c",
    title: "次の修繕計画に",
    desc: "「外壁は5年前に塗装した」「給湯器は3年前に交換した」という履歴から、次の修繕時期を逆算して計画を立てられます。",
  },
];

export default function LedgerFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 60%,#f97316 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-6rem", right: "-4rem", width: "28rem", height: "28rem", background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#fed7aa", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — 修繕台帳・履歴管理</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            修繕記録が自動蓄積。<br />
            <span style={{ background: "linear-gradient(135deg,#fed7aa,#fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              建物の資産価値を守る台帳
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            工事写真・契約書・完了報告が自動でクラウド保存。いつ・どこを・いくらで修繕したかの履歴が積み上がり、売却・保険・確定申告で活用できる資産台帳が完成します。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["自動保存", "写真付き記録", "PDF出力可能", "確定申告に活用"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#ea580c", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>FEATURES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>修繕台帳でできること</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {ledgerItems.map((f, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                  <div style={{ width: "2.75rem", height: "2.75rem", background: `${f.color}15`, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827" }}>{f.title}</h3>
                </div>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Scenarios */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff7ed" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#ea580c", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>USE CASES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>修繕台帳が役立つ場面</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem" }}>
            {usages.map((u, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #fed7aa", boxShadow: "0 2px 8px rgba(234,88,12,0.08)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{u.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "0.625rem" }}>{u.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Mock */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#ea580c", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>TIMELINE</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>修繕履歴のタイムライン（例）</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              { year: "2024年 9月", work: "外壁塗装（フッ素系）", cost: "¥1,280,000", contractor: "東京建設マスター（Sランク）", icon: "🏠" },
              { year: "2023年 3月", work: "給湯器交換（エコジョーズ）", cost: "¥240,000", contractor: "スマートリフォーム（Aランク）", icon: "🔥" },
              { year: "2022年 7月", work: "屋根防水シート施工", cost: "¥890,000", contractor: "関東防水工業（Bランク）", icon: "💧" },
              { year: "2020年 11月", work: "共用部LED照明交換", cost: "¥125,000", contractor: "埼玉修繕センター（Cランク）", icon: "💡" },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: "flex", gap: "1.5rem" }}>
                {/* Line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "2.5rem" }}>
                  <div style={{ width: "0.875rem", height: "0.875rem", borderRadius: "50%", background: "#ea580c", border: "2px solid #fff", boxShadow: "0 0 0 2px #ea580c", flexShrink: 0, marginTop: "0.375rem" }} />
                  {i < arr.length - 1 && <div style={{ width: "2px", flex: 1, background: "#fed7aa", minHeight: "2rem" }} />}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: i < arr.length - 1 ? "1.75rem" : "0", flex: 1 }}>
                  <div style={{ display: "inline-block", background: "#fff7ed", color: "#ea580c", fontWeight: 700, fontSize: "0.8125rem", padding: "0.2rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>{item.year}</div>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                      <span style={{ fontWeight: 800, color: "#111827", fontSize: "0.9375rem" }}>{item.work}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                      <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem" }}>{item.cost}</span>
                      <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{item.contractor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#7c2d12,#ea580c)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            修繕台帳を今日から始める
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            登録後3ヶ月間は修繕台帳含む全機能が無料。3ヶ月後はAプラン¥550/月（税込）で継続利用できます。無料のまま登録は維持されます。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/auth" style={{ background: "#fff", color: "#ea580c", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
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
