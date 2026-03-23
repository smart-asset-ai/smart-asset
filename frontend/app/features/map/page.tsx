"use client";

import Link from "next/link";

const mapFeatures = [
  { icon: "📍", color: "#16a34a", title: "近くの業者をマップ表示", desc: "物件住所を入力するだけで、周辺エリアにいる施工会社がマップ上にピンで表示されます。" },
  { icon: "🏆", color: "#7c3aed", title: "AIスコア順で優先表示", desc: "Sランク（AIスコア70点以上）の優秀な業者が自動的にマップ上位に表示されます。" },
  { icon: "🔍", color: "#2563eb", title: "工種・エリアで絞り込み", desc: "外壁・防水・電気・設備など21工種から絞り込み。担当エリアで近い業者だけに絞れます。" },
  { icon: "📊", color: "#ea580c", title: "業者プロフィールを確認", desc: "ピンをタップして業者の会社情報・施工事例写真・AIスコア・得意工種を確認できます。" },
  { icon: "💬", color: "#0891b2", title: "その場で見積もり依頼", desc: "気に入った業者が見つかったらそのままチャットで見積もり依頼。電話不要で即座に連絡。" },
  { icon: "📡", color: "#6b7280", title: "リアルタイム更新", desc: "新規登録業者は即座にマップに反映。常に最新の業者情報で検索できます。" },
];

const rankPins = [
  { rank: "S", color: "#7c3aed", desc: "70点以上 — 最優秀", size: "大" },
  { rank: "A", color: "#1d4ed8", desc: "60〜69点 — 優秀", size: "大" },
  { rank: "B", color: "#065f46", desc: "50〜59点 — 良好", size: "中" },
  { rank: "C", color: "#92400e", desc: "40〜49点 — 普通", size: "中" },
  { rank: "D", color: "#6b7280", desc: "30〜39点 — 要確認", size: "小" },
  { rank: "E", color: "#9ca3af", desc: "30点未満", size: "小" },
];

export default function MapFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#14532d 0%,#16a34a 60%,#15803d 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", bottom: "-6rem", right: "-4rem", width: "26rem", height: "26rem", background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#bbf7d0", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — 地図マッチング</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            物件周辺の優良業者を<br />
            <span style={{ background: "linear-gradient(135deg,#bbf7d0,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              マップで即座に発見
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            住所を入力するだけで、AIスコア上位の施工会社がマップ上に表示されます。工種・エリアで絞り込み、気に入った業者にそのまま見積もり依頼できます。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["GPS対応", "21工種対応", "Sランク優先", "即座に見積もり依頼"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Map Mock */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>MAP DISPLAY</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
              ランクバッジ付きピンでひと目でわかる
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>各業者はAIスコアに応じたランクバッジで表示されます</p>
          </div>

          {/* Visual Pin Legend */}
          <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2.5rem", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: "2rem" }}>
            <p style={{ fontWeight: 700, color: "#374151", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>📍 マップ上のピン表示</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem" }}>
              {rankPins.map((rp) => (
                <div key={rp.rank} style={{ textAlign: "center" }}>
                  {/* Pin visual */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.625rem" }}>
                    <div style={{
                      width: rp.size === "大" ? "2.75rem" : rp.size === "中" ? "2.25rem" : "1.875rem",
                      height: rp.size === "大" ? "2.75rem" : rp.size === "中" ? "2.25rem" : "1.875rem",
                      borderRadius: "50%",
                      background: rp.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 900, fontSize: rp.size === "大" ? "1rem" : "0.875rem",
                      boxShadow: `0 4px 12px ${rp.color}55`,
                    }}>
                      {rp.rank}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 700 }}>{rp.rank}ランク</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.4 }}>{rp.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/map-demo" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 700, padding: "1rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1rem", boxShadow: "0 4px 16px rgba(22,163,74,0.35)" }}>
              🗺️ デモマップを見る（無料）
            </a>
            <a href="/contractors" style={{ background: "#fff", color: "#16a34a", fontWeight: 700, padding: "1rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1rem", border: "2px solid #16a34a" }}>
              業者一覧を検索する
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>FEATURES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>地図マッチングの機能</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {mapFeatures.map((f, i) => (
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

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#14532d,#16a34a)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            近くの優良業者をすぐ探す
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            住所を入力してAIスコア上位の施工会社を検索。見積もり依頼まで無料でお使いいただけます。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contractors" style={{ background: "#fff", color: "#16a34a", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              🗺️ 業者マップを見る
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
