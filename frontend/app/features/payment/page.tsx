"use client";

import Link from "next/link";

const paymentFeatures = [
  { icon: "🧾", color: "#0f172a", title: "請求書の自動発行", desc: "工事完了後、見積書の金額を引き継いで請求書を自動生成。PDF化してチャット内で即送付できます。" },
  { icon: "✅", color: "#16a34a", title: "入金確認の自動化", desc: "Stripeと連携し、入金が確認されると自動で「入金済み」に変更。未確認の手動照合が不要になります。" },
  { icon: "🔔", color: "#ea580c", title: "未払いリマインド", desc: "支払い期日が過ぎると自動でリマインドメールを送信。追い回しの電話が不要になり、未収リスクを大幅削減。" },
  { icon: "📊", color: "#7c3aed", title: "売上・入金の一元管理", desc: "複数の案件・オーナーへの請求をひとつのダッシュボードで一元管理。月次の売上集計が一瞬で完了。" },
  { icon: "💳", color: "#2563eb", title: "クレジットカード決済対応", desc: "Stripe経由でクレジットカード払いに対応。オーナーがカードで支払い、施工会社に自動振り込みされます。" },
  { icon: "📁", color: "#0891b2", title: "経理書類の一元保存", desc: "請求書・領収書・入金記録がすべてクラウドに保存。確定申告・税務調査にもすぐ対応できます。" },
];

const flow = [
  { icon: "📋", step: "01", title: "工事完了", desc: "施工会社が「工事完了」を報告すると、見積書から請求書が自動生成されます。" },
  { icon: "📤", step: "02", title: "請求書を送付", desc: "ワンタップでオーナーにPDF請求書を送付。メール・チャット・Stripe決済リンクを同時送信。" },
  { icon: "💳", step: "03", title: "オーナーがカード決済", desc: "オーナーはStripeの安全な決済ページでクレジットカード払い。24時間いつでも決済可能。" },
  { icon: "✅", step: "04", title: "入金を自動確認", desc: "Stripeが入金を確認すると「入金済み」に自動更新。施工会社に銀行振り込みされます。" },
];

export default function PaymentFeaturePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-6rem", right: "-4rem", width: "28rem", height: "28rem", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", borderRadius: "50%" }} />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#cbd5e1", fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES — Stripe決済管理</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.75rem,5vw,3rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            請求から入金確認まで<br />
            <span style={{ background: "linear-gradient(135deg,#a5b4fc,#7dd3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              すべて自動で完結
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "38rem", marginBottom: "2rem" }}>
            工事完了後の請求書発行・送付・入金確認・未払いリマインドがすべて自動化。施工会社の経理業務を大幅に削減します。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["Stripe決済", "自動リマインド", "PDF請求書", "入金自動確認"].map((tag) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>PAYMENT FLOW</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>工事完了から入金まで4ステップ</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.5rem" }}>
            {flow.map((f, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ width: "3rem", height: "3rem", background: "linear-gradient(135deg,#0f172a,#334155)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: "1.75rem", color: "#e5e7eb", lineHeight: 1 }}>{f.step}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>FEATURES</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.375rem,3.5vw,2rem)", color: "#0f172a" }}>決済管理でできること</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {paymentFeatures.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                  <div style={{ width: "2.75rem", height: "2.75rem", background: `${f.color}12`, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0, border: `1px solid ${f.color}22` }}>
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

      {/* Stripe Security */}
      <section style={{ padding: "5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg,#f8fafc,#eff6ff)", borderRadius: "1.5rem", padding: "2.5rem", border: "1px solid #bfdbfe" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem" }}>🔒</div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.25rem" }}>Stripeの安全な決済インフラ</h2>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>カード情報はSmart Assetのサーバーに一切保存されません</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              {[
                { icon: "🛡️", title: "PCI DSS準拠", desc: "国際的なカード情報セキュリティ基準に完全準拠" },
                { icon: "🔐", title: "256bit暗号化", desc: "すべての通信はSSL/TLSで暗号化" },
                { icon: "🌍", title: "世界190ヶ国対応", desc: "Stripeは世界で最も信頼される決済プラットフォーム" },
                { icon: "⚡", title: "即時振り込み", desc: "入金確認後に最短翌営業日振り込み" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "0.875rem", padding: "1.25rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem", marginBottom: "0.375rem" }}>{item.title}</div>
                  <div style={{ color: "#6b7280", fontSize: "0.8125rem", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#0f172a,#1e293b)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
            経理業務を自動化する
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
            施工会社様のAプラン・Bプランでご利用いただけます。未収リスクを減らし、現場に集中できる環境を。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contractors/register" style={{ background: "linear-gradient(135deg,#6366f1,#2563eb)", color: "#fff", fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
              施工会社として登録 →
            </a>
            <Link href="/" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "1rem 1.75rem", borderRadius: "0.875rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              ← トップに戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
