"use client";
import Link from "next/link";
import AIMascot from "@/components/AIMascot";
import { useState, useEffect } from "react";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <footer style={{ background: "#0a0f1e", borderTop: "1px solid rgba(255,255,255,0.07)" }}>

      {/* AdSense space */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0.75rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "728px", margin: "0 auto", minHeight: "90px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Google AdSense — フッターバナー */}
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6875rem" }}>広告スペース（728×90）</span>
        </div>
      </div>

      <div style={{ padding: "3rem 1.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

          {/* 免責 */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "2.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            ⚠️ 当サービスはオーナーと施工会社をつなぐ情報提供プラットフォームです。実際の工事契約は当事者間で直接締結してください。施工内容・費用・品質・納期等について Smart Asset AI（運営：合同会社GOAT）は一切の責任を負いません。
          </div>

          {/* Cols */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1.4fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
                <AIMascot size={32} animated={false} bg1="#1e3a8a" bg2="#1e40af" style={{ borderRadius: "0.5rem" }} />
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>Smart Asset AI</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: "0.875rem", maxWidth: "200px" }}>
                地元の職人と直接つながる小規模修繕プラットフォーム。99% AI運営だから中間コストゼロ。
              </p>
              {/* SNSリンク */}
              <div style={{ marginBottom: "0.875rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>SNS・公式</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {[
                    { label: "X (Twitter)", href: "https://x.com/smartassetai", color: "#1d9bf0" },
                    { label: "Instagram", href: "https://instagram.com/smartassetai", color: "#e1306c" },
                    { label: "YouTube", href: "https://youtube.com/@smartassetai", color: "#ff0000" },
                    { label: "LINE公式", href: "#", color: "#06c755" },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.6875rem", padding: "0.25rem 0.625rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 600 }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Owner */}
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#86efac", marginBottom: "1rem" }}>🏠 オーナー向け</p>
              {[
                { href: "/owners", label: "サービス概要" },
                { href: "/diagnosis", label: "AI建物診断（無料）" },
                { href: "/properties/new", label: "修繕案件を掲載" },
                { href: "/owner/contractors", label: "業者マップ検索" },
                { href: "/owner/knowledge", label: "📚 知識ハブ" },
                { href: "/owner/mypage", label: "マイページ" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "0.5rem" }}>{label}</Link>
              ))}
            </div>

            {/* Contractor */}
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#93c5fd", marginBottom: "1rem" }}>🔨 施工会社向け</p>
              {[
                { href: "/contractors", label: "サービス概要" },
                { href: "/contractors/register", label: "無料で会社登録" },
                { href: "/contractors/register?plan=a", label: "有料プラン（無料）" },
                { href: "/owner/contractors", label: "会社一覧マップ" },
                { href: "/contractor/mypage", label: "マイページ" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "0.5rem" }}>{label}</Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fcd34d", marginBottom: "1rem" }}>📋 サポート・情報</p>
              {[
                { href: "/terms", label: "利用規約" },
                { href: "/terms#privacy", label: "プライバシーポリシー" },
                { href: "/terms#tokushoho", label: "特定商取引法表記" },
                { href: "/terms#disclaimer", label: "免責事項" },
                
                { href: "/owner/knowledge", label: "知識ハブ" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "0.5rem" }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* 運営の透明性メッセージ */}
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.875rem", padding: "0.875rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
            <span style={{ fontSize: "1.25rem" }}>💙</span>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              Smart Asset AIは、施工会社の皆様のご利用料金・広告収入によって運営されています。オーナー登録・利用は無料で全サービスをご利用いただけます。ご支援いただいている会員の皆様に感謝申し上げます。
            </p>
          </div>

          {/* Bottom */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
              © 2026 Smart Asset AI / 合同会社GOAT. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.75rem" }}>
              <Link href="/terms" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>利用規約</Link>
              <Link href="/terms#privacy" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>プライバシー</Link>
              
            </div>
          </div>
          <div style={{ paddingTop: "0.75rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
              運営：<a href="https://aiworkstage.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>合同会社GOAT</a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
