"use client";

import { useState, useEffect } from "react";
import CostComparison from "./components/CostComparison";
import ChatShowcase from "./components/ChatShowcase";
import ProcessFlow from "./components/ProcessFlow";
import Testimonials from "./components/Testimonials";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import ServiceShowcase from "./components/ServiceShowcase";
import ROISection from "./components/ROISection";
import InteractiveSteps from "./components/InteractiveSteps";

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────
function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const appealPoints = [
    { icon: "📱", text: "リアルタイムチャット" },
    { icon: "📄", text: "電子契約で大幅コスト削減" },
    { icon: "🏠", text: "3ヶ月間は全機能無料" },
    { icon: "⚡", text: "即座のマッチング" },
  ];

  return (
    <section style={{
      background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: isMobile ? "5rem 1.25rem 3rem" : "6rem 1.5rem 4rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* bg decoration */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "40rem", height: "40rem", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-8rem", left: "-8rem", width: "32rem", height: "32rem", background: "radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.25)", border: "1px solid rgba(147,197,253,0.3)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.75rem" }}>
          <span style={{ width: "0.5rem", height: "0.5rem", background: "#4ade80", borderRadius: "50%" }} />
          <span style={{ color: "#93c5fd", fontSize: "0.8125rem", fontWeight: 600 }}>不動産修繕のデジタル化を今日から</span>
        </div>

        {/* Main copy */}
        <h1 style={{ fontWeight: 900, fontSize: isMobile ? "2rem" : "3.25rem", color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
          AIで不動産修繕業務を<br />
          <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            完全デジタル化
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? "1rem" : "1.1875rem", lineHeight: 1.75, maxWidth: "36rem", marginBottom: "2rem" }}>
          登録後3ヶ月間は全機能を無料体験。電子サインで契約の手間ゼロ。3ヶ月後も月¥550〜で継続利用できます。
        </p>

        {/* Appeal points */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {appealPoints.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px", padding: "0.375rem 0.875rem" }}>
              <span style={{ fontSize: "0.9375rem" }}>{p.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8125rem", fontWeight: 600 }}>{p.text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <a href="/auth"
            style={{
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: "#fff", fontWeight: 700, fontSize: "1.0625rem",
              padding: "0.9375rem 2rem", borderRadius: "0.875rem",
              textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
              display: "inline-block", letterSpacing: "-0.01em",
            }}>
            今すぐ無料で始める →
          </a>
          <a href="/map-demo"
            style={{
              background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "1rem",
              padding: "0.9375rem 1.75rem", borderRadius: "0.875rem",
              textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)",
              display: "inline-block",
            }}>
            🗺️ 地図で業者を探す
          </a>
        </div>
        {/* Demo shortcuts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "2.5rem" }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem", alignSelf: "center" }}>機能を今すぐ体験：</span>
          <a href="/demo/chat" style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.85)", borderRadius: "9999px",
            padding: "0.375rem 1rem", fontSize: "0.8125rem", fontWeight: 600,
            textDecoration: "none",
          }}>
            💬 チャットデモ
          </a>
          <a href="/demo/sign" style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.85)", borderRadius: "9999px",
            padding: "0.375rem 1rem", fontSize: "0.8125rem", fontWeight: 600,
            textDecoration: "none",
          }}>
            ✍️ 電子署名デモ
          </a>
          <a href="/diagnosis" style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.85)", borderRadius: "9999px",
            padding: "0.375rem 1rem", fontSize: "0.8125rem", fontWeight: 600,
            textDecoration: "none",
          }}>
            🤖 AI診断（無料）
          </a>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", maxWidth: "36rem" }}>
          {[
            { val: "0円",  label: "AI診断・登録料" },
            { val: "即日", label: "電子契約締結" },
            { val: "¥550〜", label: "有料プラン（月額税込）" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.875rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.5rem" }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Why Smart Asset
// ─────────────────────────────────────────────
function WhySection() {
  const points = [
    { icon: "🏦", color: "#7c3aed", bg: "#f5f3ff", title: "業者選びを間違えない",   desc: "AIスコアが業者の実績・評価を数値化。S〜Eランクで一目でわかる信頼度。" },
    { icon: "📝", color: "#2563eb", bg: "#eff6ff", title: "印紙税ゼロで電子契約",   desc: "法的に有効な電子署名。印紙代2万円〜5万円が完全にゼロになります。" },
    { icon: "🗂️", color: "#0891b2", bg: "#ecfeff", title: "工事履歴が資産になる",  desc: "修繕記録が自動蓄積。売却・保険申請・確定申告で活用できる台帳が完成。" },
    { icon: "💬", color: "#16a34a", bg: "#f0fdf4", title: "見積もりは比較してから", desc: "複数の業者から同条件で見積もりを受取。チャットで詳細確認・価格交渉も簡単。" },
  ];

  return (
    <section style={{ padding: "5rem 0", background: "#fff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>WHY SMART ASSET</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a" }}>
            選ばれる4つの理由
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem" }}>
          {points.map((p, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ width: "3.25rem", height: "3.25rem", background: p.bg, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>
                {p.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.5rem" }}>{p.title}</h3>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", textAlign: "center" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", marginBottom: "1rem" }}>
          今日から始める、<br />不動産業務のデジタル化
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.75 }}>
          登録後3ヶ月間は全機能を無料体験。3ヶ月後も無料で登録継続できます。<br />
          本格利用はAプラン¥550/月〜。まずは気軽に始めてみてください。
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          <a href="/auth" style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff",
            fontWeight: 700, fontSize: "1.0625rem", padding: "1rem 2.5rem",
            borderRadius: "0.875rem", textDecoration: "none",
            boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
          }}>
            無料でアカウント作成 →
          </a>
          <a href="/diagnosis" style={{
            background: "rgba(255,255,255,0.1)", color: "#fff",
            fontWeight: 600, fontSize: "1rem", padding: "1rem 2rem",
            borderRadius: "0.875rem", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            🤖 AI診断を試す（無料）
          </a>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <CostComparison />
      <ROISection />
      <ChatShowcase />
      <ServiceShowcase />
      <WhySection />
      <Features />
      <InteractiveSteps />
      <Pricing />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
