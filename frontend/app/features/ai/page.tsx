"use client";

import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "建物情報・写真を入力",
    desc: "物件の種類・築年数・気になる箇所を入力し、写真をアップロードするだけ。専門知識は不要です。",
    icon: "📸",
  },
  {
    num: "02",
    title: "AIが建物を詳細分析",
    desc: "修繕コスト試算・工事種別の判定・緊急度評価を数秒で完了。類似案件データと比較した適正価格も表示。",
    icon: "🤖",
  },
  {
    num: "03",
    title: "マッチング業者をスコアで比較",
    desc: "診断結果に合った施工会社がAIスコア順に表示。S〜Eのランクで信頼度を一目で確認できます。",
    icon: "🏆",
  },
];

const benefits = [
  {
    icon: "💡",
    color: "#7c3aed",
    bg: "#f5f3ff",
    title: "適正価格がわかる",
    desc: "「この金額は高すぎないか？」の不安をゼロに。AI診断で市場相場と比較した適正見積もりを把握できます。",
  },
  {
    icon: "🔍",
    color: "#2563eb",
    bg: "#eff6ff",
    title: "悪質業者を排除",
    desc: "AIスコアが低い業者（D・Eランク）は自動的に後回しに。実績・評価・継続年数が数値化されます。",
  },
  {
    icon: "⚡",
    color: "#ea580c",
    bg: "#fff7ed",
    title: "診断は数秒で完了",
    desc: "写真と基本情報を入力するだけ。現地調査なしで修繕の優先度・概算費用・工事種別が即座にわかります。",
  },
  {
    icon: "🗺️",
    color: "#16a34a",
    bg: "#f0fdf4",
    title: "診断結果が業者マップに連携",
    desc: "診断後、そのまま物件周辺の施工会社マップへ。診断結果に合った工種の業者が優先表示されます。",
  },
];

const rankData = [
  { rank: "S", color: "#7c3aed", bg: "#f5f3ff", range: "70点以上", desc: "最優秀・実績豊富" },
  { rank: "A", color: "#1d4ed8", bg: "#eff6ff", range: "60〜69点", desc: "優秀・信頼性高" },
  { rank: "B", color: "#065f46", bg: "#f0fdf4", range: "50〜59点", desc: "標準・良好" },
  { rank: "C", color: "#92400e", bg: "#fffbeb", range: "40〜49点", desc: "普通" },
  { rank: "D", color: "#6b7280", bg: "#f9fafb", range: "30〜39点", desc: "要確認" },
  { rank: "E", color: "#6b7280", bg: "#fff", range: "30点未満", desc: "低スコア" },
];

export default function AIFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#2563eb 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-8rem", right: "-8rem", width: "32rem", height: "32rem", background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#c4b5fd", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — AI診断・スコアリング</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            AIが建物を分析し、<br />
            <span style={{ background: "linear-gradient(135deg,#c4b5fd,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              適正価格と信頼業者を瞬時に提示
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            写真と基本情報を入力するだけ。修繕コスト試算・工事種別判定・業者AIスコアを数秒で算出します。専門知識は一切不要です。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["完全無料", "数秒で完了", "専門知識不要", "業者マップ連携"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>HOW IT WORKS</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>たった3ステップで診断完了</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "2rem" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "3.5rem", height: "3.5rem", background: "linear-gradient(135deg,#7c3aed,#2563eb)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <span style={{ fontWeight: 900, fontSize: "2rem", color: "#e5e7eb", lineHeight: 1 }}>{s.num}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827" }}>{s.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>BENEFITS</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>AI診断でできること</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "3rem", height: "3rem", background: b.bg, borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", marginBottom: "1rem" }}>
                  {b.icon}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "0.5rem" }}>{b.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rank System */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>AI SCORE RANK</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
              S〜Eランクで業者の信頼度を一目把握
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "38rem", margin: "0 auto" }}>
              AIスコアは「会社情報充実度（90点）＋オーナー満足度評価（90点）」の平均と「継続会員ポイント（最大10点）」で算出されます。
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {rankData.map((r) => (
              <div key={r.rank} style={{ background: r.bg, border: `2px solid ${r.color}22`, borderRadius: "1rem", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "2.25rem", color: r.color, lineHeight: 1, marginBottom: "0.375rem" }}>{r.rank}</div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: r.color, marginBottom: "0.25rem" }}>{r.range}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: "1.25rem", padding: "1.75rem 2rem" }}>
            <p style={{ fontWeight: 800, color: "#7c3aed", marginBottom: "0.75rem" }}>📐 AIスコア算出式</p>
            <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#4c1d95", background: "#ede9fe", padding: "1rem 1.25rem", borderRadius: "0.75rem", lineHeight: 1.8 }}>
              （① 会社情報充実度 90点 ＋ ② オーナー満足度評価 90点）÷ 2<br />
              ＋ ③ 継続会員ポイント（最大10点）<br />
              <strong>＝ AIスコア合計点</strong>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#4c1d95,#7c3aed)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            まずは無料でAI診断を試す
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            アカウント不要。写真と住所を入力するだけで、修繕コスト試算・業者マッチングまで完結します。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/diagnosis" style={{ background: "#fff", color: "#7c3aed", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              🤖 AI診断を試す（無料）
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
