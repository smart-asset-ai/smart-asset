"use client";

const testimonials = [
  {
    avatar: "👨‍💼",
    name: "田中 誠一",
    role: "賃貸オーナー / 東京都",
    rating: 5,
    comment: "印紙代が毎回2万円かかっていたのが、Smart Assetで完全にゼロに。電子契約は最初不安でしたが、めちゃくちゃ簡単でした。",
  },
  {
    avatar: "👩‍🔧",
    name: "佐藤 建設",
    role: "外壁・防水専門 / 神奈川県",
    rating: 5,
    comment: "大手仲介を通さず直接オーナーから受注できるようになり、利益率が大幅アップ。月¥3,000のAプランでここまでできるとは思いませんでした。",
  },
  {
    avatar: "🏢",
    name: "鈴木 房子",
    role: "マンション管理 / 大阪府",
    rating: 5,
    comment: "修繕台帳が自動で積み上がっていくのが最高です。売却の際にも資産価値を証明できる資料として使えました。",
  },
  {
    avatar: "👨‍🔨",
    name: "高橋 塗装工業",
    role: "塗装・防水 / 埼玉県",
    rating: 5,
    comment: "AIスコアで仕事の質が数値化されてオーナーに伝わる。下請け脱却のきっかけになりました。チャットも使いやすい。",
  },
];

export default function Testimonials() {
  return (
    <section style={{ padding: "5rem 0", background: "#fff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>TESTIMONIALS</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a" }}>
            ご利用者の声
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: "#f8fafc",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} style={{ color: "#f59e0b", fontSize: "1rem" }}>★</span>
                ))}
              </div>
              {/* Comment */}
              <p style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.7, flex: 1 }}>
                「{t.comment}」
              </p>
              {/* Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "2rem" }}>{t.avatar}</span>
                <div>
                  <p style={{ fontWeight: 800, color: "#111827", fontSize: "0.9375rem" }}>{t.name}</p>
                  <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
