"use client";

import Link from "next/link";

const chatFeatures = [
  { icon: "✅", color: "#16a34a", title: "既読確認", desc: "メッセージが読まれたかどうかをリアルタイムで確認。「見た？」の確認電話が不要になります。" },
  { icon: "📸", color: "#2563eb", title: "写真・ファイル共有", desc: "施工箇所の写真・見積もりPDF・設計図面をチャット内で直接送受信。メールよりずっと簡単。" },
  { icon: "💬", color: "#7c3aed", title: "見積もり交渉", desc: "「この金額を下げられますか？」「工期を1週間早められますか？」の交渉もすべてチャット内で完結。" },
  { icon: "🔔", color: "#ea580c", title: "プッシュ通知", desc: "新着メッセージはプッシュ通知で即座にお知らせ。見逃しゼロで円滑なコミュニケーションが実現。" },
  { icon: "🗂️", color: "#0891b2", title: "会話履歴の自動保存", desc: "すべてのやり取りが永久保存。「以前こう言っていた」のトラブル防止に役立ちます。" },
  { icon: "📋", color: "#6b7280", title: "テンプレートメッセージ", desc: "よく使うメッセージをテンプレート登録。見積もり依頼・進捗確認・完了報告が1タップで送信。" },
];

const useCases = [
  {
    persona: "🏠 オーナー様の場合",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#16a34a",
    items: [
      "気になる施工会社に見積もりを依頼",
      "写真を送って「この部分を直してほしい」と伝える",
      "複数の業者と同時に交渉・比較",
      "工事中の進捗写真を受け取る",
      "完了後の仕上がり写真を確認",
    ],
  },
  {
    persona: "🔨 施工会社様の場合",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#2563eb",
    items: [
      "オーナーから案件依頼を受信",
      "現地確認なしで写真から見積もりを作成",
      "見積もりPDFを直接チャットで送付",
      "工事中の進捗写真をリアルタイム報告",
      "完了後に写真付き完了報告を送信",
    ],
  },
];

export default function ChatFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#0c4a6e 0%,#0891b2 60%,#06b6d4 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-8rem", left: "-4rem", width: "30rem", height: "30rem", background: "radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#bae6fd", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — リアルタイムチャット</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            LINEのように使いやすい<br />
            <span style={{ background: "linear-gradient(135deg,#bae6fd,#a5f3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ビジネスチャット
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            見積もり依頼から写真共有・価格交渉・進捗報告まで、オーナーと施工会社のすべてのやり取りをひとつのチャット内で完結。電話・メール不要。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["既読確認", "写真共有", "履歴永久保存", "プッシュ通知"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Features Grid */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#0891b2", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>FEATURES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>チャットでできること</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {chatFeatures.map((f, i) => (
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

      {/* Use Cases */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#0891b2", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>USE CASES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>こんな場面で活躍します</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
            {useCases.map((uc, i) => (
              <div key={i} style={{ background: uc.bg, borderRadius: "1.25rem", padding: "2rem", border: `1px solid ${uc.border}` }}>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: uc.color, marginBottom: "1.25rem" }}>{uc.persona}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {uc.items.map((item, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", color: "#374151", fontSize: "0.9375rem" }}>
                      <span style={{ color: uc.color, fontWeight: 800, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS Traditional */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>従来の連絡方法との比較</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ background: "#fff5f5", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #fecaca" }}>
              <h3 style={{ fontWeight: 800, color: "#b91c1c", marginBottom: "1rem" }}>😓 従来の方法</h3>
              {["電話で連絡、メモが残らない", "メールで写真を送るのが面倒", "FAXで見積書をやり取り", "「言った・言わない」のトラブル", "担当者が変わると履歴が消える"].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", color: "#7f1d1d", fontSize: "0.875rem", marginBottom: "0.625rem" }}>
                  <span>✗</span>{item}
                </div>
              ))}
            </div>
            <div style={{ background: "#f0fdf4", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #bbf7d0" }}>
              <h3 style={{ fontWeight: 800, color: "#15803d", marginBottom: "1rem" }}>✨ Smart Asset チャット</h3>
              {["すべてのやり取りがテキストで記録", "写真・PDFをチャット内で直接送受信", "見積もりから契約までシームレス", "会話履歴が証拠として残る", "担当者が変わっても履歴は永久保存"].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", color: "#14532d", fontSize: "0.875rem", marginBottom: "0.625rem" }}>
                  <span>✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#0c4a6e,#0891b2)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            チャット機能を試してみる
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            登録後3ヶ月間はチャット機能含む全機能が無料。3ヶ月後はAプラン¥550/月（税込）で継続利用できます。無料のまま登録は維持されます。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/auth" style={{ background: "#fff", color: "#0891b2", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
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
