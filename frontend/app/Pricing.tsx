"use client";

// ─── 定数 ───────────────────────────────────────
export const PLAN = {
  free_label: "3ヶ月無料（フル機能）",
  a_price_ex: 500,
  a_price_in: 550,
  b_price_ex: 800,
  b_price_in: 880,
};

const LOCKED_AFTER_FREE = ["チャット機能", "電子サイン契約", "修繕履歴の蓄積"];

const PLAN_A_UNLOCK = ["チャット機能", "修繕履歴の蓄積"];
const PLAN_B_UNLOCK = ["チャット機能", "修繕履歴の蓄積", "電子サイン契約（印紙税ゼロ・即日締結）"];

const ALWAYS_FREE = [
  "AI建物診断",
  "業者マップ検索・閲覧",
  "案件投稿・見積もり受取",
  "プロフィール掲載・地図表示",
];

const COST_ITEMS = [
  { icon: "🤖", label: "AI診断エンジン", note: "Anthropic Claude API（診断・マッチング処理）" },
  { icon: "🗄️", label: "クラウドデータベース", note: "Supabase（物件・修繕履歴・契約書の安全保管）" },
  { icon: "🗺️", label: "地図APIシステム", note: "Mapbox（業者マップのリアルタイム表示）" },
  { icon: "✍️", label: "電子署名インフラ", note: "法的効力のある電子サイン処理・記録保全" },
  { icon: "🔒", label: "セキュリティ・バックアップ", note: "SSL・データ暗号化・定期バックアップ" },
];

// ─── コンポーネント ──────────────────────────────
export default function Pricing() {
  return (
    <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>PRICING</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            シンプルな料金体系
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            まず3ヶ月間、全機能を無料で体験。その後は必要な機能だけ選べます。
          </p>
        </div>

        {/* 3ヶ月無料バナー */}
        <div style={{
          background: "linear-gradient(135deg,#ecfdf5,#eff6ff)",
          border: "2px solid #bbf7d0",
          borderRadius: "1.25rem",
          padding: "1.75rem 2rem",
          marginBottom: "2rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎁</span>
            <span style={{ fontWeight: 900, fontSize: "1.125rem", color: "#065f46" }}>
              登録後3ヶ月間は全機能を完全無料で利用できます
            </span>
          </div>
          <p style={{ color: "#374151", fontSize: "0.9rem", margin: "0 0 1rem" }}>
            オーナー様・施工会社様ともに、登録してすぐ全機能をお試しいただけます。クレジットカード登録不要。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["AI建物診断","業者マップ検索","チャット","見積もり・案件管理","電子サイン契約","修繕履歴の蓄積"].map((f,i) => (
              <span key={i} style={{ background: "#fff", border: "1px solid #bbf7d0", color: "#065f46", borderRadius: "9999px", padding: "0.3rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* 無料継続の案内 */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "1.25rem 1.75rem",
          marginBottom: "1rem",
          display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "1.25rem" }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>
              3ヶ月経過後も、無料のまま登録・利用を続けられます
            </div>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
              無料継続の場合は一部機能が制限されます。AI診断・マップ検索・案件閲覧などの基本機能は引き続き無料でご利用いただけます。
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              {LOCKED_AFTER_FREE.map((f,i) => (
                <span key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#92400e", borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600 }}>
                  🔒 {f}
                </span>
              ))}
              <span style={{ color: "#9ca3af", fontSize: "0.8125rem", alignSelf: "center" }}>← 有料プランで解除</span>
            </div>
          </div>
        </div>

        {/* 常時無料機能の明示 */}
        <div style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "1.25rem 1.75rem",
          marginBottom: "3rem",
          display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center",
        }}>
          <span style={{ fontWeight: 700, color: "#374151", fontSize: "0.875rem", whiteSpace: "nowrap" }}>ずっと無料の機能：</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ALWAYS_FREE.map((f,i) => (
              <span key={i} style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.8125rem" }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* プランカード */}
        <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#374151", marginBottom: "1.5rem", textAlign: "center" }}>
          🔓 有料プランで機能を解除
        </h3>

        {/* オーナー */}
        <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>🏠 オーナー様</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem", marginBottom: "3rem", maxWidth: "620px" }}>
          <PlanCard
            name="Aプラン" price="¥500" priceIn="¥550" sub="/月"
            color="#2563eb" border="#3b82f6" bg="#eff6ff"
            unlocks={PLAN_A_UNLOCK}
            note="チャットで業者と直接やりとり。修繕履歴が自動蓄積され、次の計画がいつでも一目瞭然。"
          />
          <PlanCard
            name="Bプラン" price="¥800" priceIn="¥880" sub="/月"
            color="#7c3aed" border="#7c3aed" bg="#0f172a" dark
            badge="全機能解放"
            unlocks={PLAN_B_UNLOCK}
            note="電子サインで契約書の印刷・郵送・保管がゼロに。どこからでも即日締結。"
          />
        </div>

        {/* 施工会社 */}
        <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>🔨 施工会社様</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem", marginBottom: "3.5rem", maxWidth: "620px" }}>
          <PlanCard
            name="Aプラン" price="¥500" priceIn="¥550" sub="/月"
            color="#2563eb" border="#3b82f6" bg="#eff6ff"
            unlocks={PLAN_A_UNLOCK}
            note="オーナーとチャットで直接交渉・見積もり提出。施工実績を履歴として自動管理。"
          />
          <PlanCard
            name="Bプラン" price="¥800" priceIn="¥880" sub="/月"
            color="#7c3aed" border="#7c3aed" bg="#0f172a" dark
            badge="全機能解放"
            unlocks={PLAN_B_UNLOCK}
            note="電子サインで契約を即日締結。優先表示・AIスコアレポートで受注率アップ。"
          />
        </div>

        {/* 運営費用の透明性 */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "1.25rem",
          padding: "2rem",
          marginBottom: "2rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.25rem" }}>💡</span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111827" }}>なぜ有料プランがあるのか</span>
          </div>
          <p style={{ color: "#374151", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: 1.7 }}>
            Smart Asset AIは、以下のシステムを24時間365日稼働させることで成り立っています。
            3ヶ月の無料期間を経て、継続してご利用いただく方に運営費の一部をご負担いただく形で、
            サービスの品質維持・継続的な機能改善を図っています。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem" }}>
            {COST_ITEMS.map((c,i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
                <div style={{ fontSize: "1.25rem", marginBottom: "0.375rem" }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", marginBottom: "0.25rem" }}>{c.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.note}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8125rem" }}>
          ※ 表示価格は税抜。税込はAプラン¥550、Bプラン¥880です。<br />
          ※ 有料プランはStripeによるクレジットカード決済。3ヶ月の無料期間後に課金開始。いつでもキャンセル可能。
        </p>
      </div>
    </section>
  );
}

function PlanCard({ name, price, priceIn, sub, color, border, bg, dark=false, badge, unlocks, note }: {
  name: string; price: string; priceIn: string; sub: string;
  color: string; border: string; bg: string; dark?: boolean;
  badge?: string; unlocks: string[]; note: string;
}) {
  return (
    <div style={{
      background: dark ? bg : "#fff",
      borderRadius: "1.25rem",
      padding: "1.75rem",
      border: `2px solid ${border}`,
      position: "relative",
      boxShadow: dark ? "0 8px 32px rgba(124,58,237,0.2)" : "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      {badge && (
        <div style={{
          position: "absolute", top: "-0.875rem", left: "50%", transform: "translateX(-50%)",
          background: `linear-gradient(135deg,${color},#2563eb)`, color: "#fff",
          padding: "0.25rem 1.25rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
        }}>{badge}</div>
      )}
      <p style={{ color: dark ? "#c4b5fd" : "#6b7280", fontWeight: 700, fontSize: "0.8125rem", marginBottom: "0.25rem", marginTop: badge ? "0.5rem" : 0 }}>{name}</p>
      <div style={{ marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "2.25rem", fontWeight: 900, color: dark ? "#fff" : "#111827" }}>{price}</span>
        <span style={{ fontSize: "0.875rem", color: dark ? "#c4b5fd" : "#6b7280", marginLeft: "0.25rem" }}>税抜{sub}</span>
      </div>
      <div style={{ fontSize: "0.75rem", color: dark ? "#a78bfa" : "#9ca3af", marginBottom: "1.25rem" }}>
        税込 {priceIn}/月
      </div>
      <div style={{ fontSize: "0.8125rem", color: dark ? "#a78bfa" : color, fontWeight: 700, marginBottom: "0.625rem" }}>解除される機能：</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {unlocks.map((f,j) => (
          <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: dark ? "#e2e8f0" : "#374151", fontSize: "0.875rem" }}>
            <span style={{ color: dark ? "#a78bfa" : color, fontWeight: 800, flexShrink: 0 }}>🔓</span>{f}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "0.8125rem", color: dark ? "#94a3b8" : "#6b7280", margin: 0, lineHeight: 1.6, borderTop: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}`, paddingTop: "0.875rem" }}>
        {note}
      </p>
    </div>
  );
}
