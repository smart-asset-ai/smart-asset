"use client";
import Link from "next/link";
import { Shield, CreditCard, CheckCircle, AlertCircle, ChevronRight, Lock, Zap, HelpCircle } from "lucide-react";

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "1.25rem",
  padding: "2rem",
  marginBottom: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  border: "1px solid #e5e7eb",
};

const FAQS = [
  {
    q: "いつ請求されますか？",
    a: "オーナー様と施工会社様の双方が案件成立を確認し、サービス上で「成約」とした時点で請求が発生します。見積もり・問い合わせ段階では一切費用は発生しません。",
  },
  {
    q: "クレジットカード情報は安全ですか？",
    a: "はい。当サービスはクレジットカード情報を一切保持しません。すべての決済はStripe（米国上場企業・PCI DSS Level 1認定）が直接処理します。",
  },
  {
    q: "どのカードが使えますか？",
    a: "Visa・Mastercard・American Express・JCB・Discoverがご利用いただけます。デビットカードにも対応しています。",
  },
  {
    q: "領収書は発行されますか？",
    a: "はい。Stripeより自動的にメールで領収書が送付されます。インボイス制度対応の適格請求書の発行も可能です（設定後）。",
  },
  {
    q: "サービスを介さず直接取引した場合は？",
    a: "AIシステムが自動検知します。不正回避と判断された場合、退会処理となり再入会は不可となります。利用規約第5条をご確認ください。",
  },
  {
    q: "成約後にキャンセルした場合は？",
    a: "成約確定後の返金はできません。成約前（見積もり・問い合わせ段階）はキャンセル自由で費用は発生しません。",
  },
];

export default function StripeInfoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.12)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <CreditCard style={{ width: "28px", height: "28px", color: "white" }} />
          </div>
          <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.75rem" }}>
            Stripe決済について
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
            Smart Asset AIでは、成約時の0.5%手数料のみStripeで安全に決済します。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Stripeとは */}
        <div style={card}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield style={{ width: "1.125rem", height: "1.125rem", color: "#2563eb" }} />
            Stripeとは
          </h2>
          <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p>
              <strong>Stripe</strong>はAmazon・Google・Shopifyなど世界中の企業が採用する、米国上場の決済プラットフォームです。
              日本では三菱UFJ銀行・freee・メルカリなども利用しています。
            </p>
            <p>
              クレジットカード業界の最高水準のセキュリティ規格<strong>「PCI DSS Level 1」</strong>に準拠しており、
              カード情報はStripeのサーバーで直接処理されます。当サービスはカード情報を一切受け取りません。
            </p>
          </div>
        </div>

        {/* 費用の仕組み */}
        <div style={card}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
            費用の仕組み
          </h2>

          {/* フロー */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { step: "01", title: "見積もり・問い合わせ", desc: "費用ゼロ。何度でも無料でご利用いただけます。", color: "#16a34a", check: true },
              { step: "02", title: "成約確定", desc: "オーナー様・施工会社様が双方で合意した時点が成約です。", color: "#2563eb", check: true },
              { step: "03", title: "Stripeで決済", desc: "成約金額（税抜）の0.5%をオーナー様・施工会社様それぞれからStripeで請求します。", color: "#7c3aed", check: false },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "#f8fafc", borderRadius: "0.875rem", border: `1.5px solid ${item.color}20` }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.check
                    ? <CheckCircle style={{ width: "18px", height: "18px", color: "white" }} />
                    : <CreditCard style={{ width: "18px", height: "18px", color: "white" }} />
                  }
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: item.color, marginBottom: "0.2rem" }}>STEP {item.step}</div>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>{item.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 計算例 */}
          <div style={{ background: "#f0fdf4", borderRadius: "0.875rem", padding: "1.25rem", border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#166534", marginBottom: "0.75rem" }}>💡 計算例</p>
            <div style={{ fontSize: "0.875rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <p>外壁塗装工事 成約金額 <strong>100万円（税抜）</strong> の場合：</p>
              <p style={{ paddingLeft: "1rem" }}>
                オーナー様の負担：<strong style={{ color: "#166534" }}>100万円 × 0.5% = 5,000円</strong><br />
                施工会社様の負担：<strong style={{ color: "#166534" }}>100万円 × 0.5% = 5,000円</strong>
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>※ Stripe手数料（3.6%+¥40/件）はサービス側が負担します。</p>
            </div>
          </div>
        </div>

        {/* セキュリティ */}
        <div style={card}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
            セキュリティ
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem", color: "#374151" }}>
            {[
              "カード情報はStripeのサーバーに直接送信。当サービスには届きません",
              "PCI DSS Level 1（カード業界最高水準）準拠",
              "通信はすべてTLS暗号化",
              "3Dセキュア（本人確認）対応",
              "不正利用検知システム搭載",
            ].map(item => (
              <li key={item} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <CheckCircle style={{ width: "16px", height: "16px", color: "#16a34a", marginTop: "2px", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 注意事項 */}
        <div style={{ ...card, borderLeft: "4px solid #f59e0b", background: "#fffbeb" }}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#92400e", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle style={{ width: "1.125rem", height: "1.125rem" }} />
            ご注意事項
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "#92400e", lineHeight: 1.7 }}>
            <li>・ 成約確定後のキャンセル・返金はできません</li>
            <li>・ 当サービスを介して知り合ったオーナー様・施工会社様との直接取引（サービス利用料の回避）はAIが自動検知します。不正回避と判断された場合、退会処理となり再入会は不可となります</li>
            <li>・ 成約後の工事内容・品質に関するトラブルは当事者間でご解決ください（当サービスは仲介のみ）</li>
          </ul>
        </div>

        {/* FAQ */}
        <div style={card}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HelpCircle style={{ width: "1.125rem", height: "1.125rem", color: "#6b7280" }} />
            よくある質問
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #f3f4f6" : "none", paddingBottom: i < FAQS.length - 1 ? "1rem" : 0 }}>
                <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem", marginBottom: "0.375rem" }}>Q. {faq.q}</p>
                <p style={{ color: "#4b5563", fontSize: "0.875rem", lineHeight: 1.75 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
          <Link href="/terms#payment" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#2563eb", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
            利用規約（第5条）を確認する <ChevronRight style={{ width: "1rem", height: "1rem" }} />
          </Link>
        </div>

      </div>
    </div>
  );
}
