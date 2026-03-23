"use client";
import PWAInstallButton from "@/components/PWAInstallButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Brain, MapPin, FileText, ArrowRight, CheckCircle,
  ChevronRight, Shield, Clock, Star, AlertTriangle,
  Zap, Home, ChevronDown, BookOpen, TrendingDown
} from "lucide-react";
import AIMascot from "@/components/AIMascot";

const MW = "1100px";

function AIDiagnosisMock() {
  return (
    <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", boxShadow: "0 12px 48px rgba(0,0,0,0.18)", overflow: "hidden", width: "100%" }}>
      <div style={{ background: "linear-gradient(135deg, #0f2460, #2563eb)", padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <div style={{ width: "1.75rem", height: "1.75rem", background: "rgba(255,255,255,0.2)", borderRadius: "0.375rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brain style={{ width: "1rem", height: "1rem", color: "white" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontWeight: 800, fontSize: "0.875rem" }}>AI建物診断レポート</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>診断完了 · 2026年3月</div>
        </div>
        <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.15)", borderRadius: "0.375rem", padding: "0.2rem 0.625rem", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>PDF保存</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "4.5rem" }}>🏢</div>
        <div style={{ position: "absolute", top: "0.75rem", right: "0.875rem", background: "#1d4ed8", borderRadius: "0.875rem", padding: "0.625rem 1rem", textAlign: "center" }}>
          <div style={{ color: "white", fontSize: "1.75rem", fontWeight: 900, lineHeight: 1 }}>72</div>
          <div style={{ color: "#93c5fd", fontSize: "0.6875rem", fontWeight: 700 }}>AIスコア</div>
        </div>
        <div style={{ position: "absolute", top: "0.75rem", left: "0.875rem", background: "#fee2e2", borderRadius: "0.5rem", padding: "0.3rem 0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <AlertTriangle style={{ width: "0.75rem", height: "0.75rem", color: "#dc2626" }} />
          <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 700 }}>要対応 2件</span>
        </div>
      </div>
      <div style={{ padding: "1.125rem 1.25rem" }}>
        <div style={{ background: "#fef3c7", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1rem", border: "1px solid #fde68a" }}>
          <p style={{ fontSize: "0.8125rem", color: "#713f12", lineHeight: 1.6, fontWeight: 500 }}>
            外壁に複数のひび割れと塗膜の剥離を検出。築15年を超えているため早めの修繕を推奨します。
          </p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>部位別 AI診断結果</p>
          {[
            { part: "外壁", status: "要修繕", color: "#dc2626", bg: "#fee2e2", work: "外壁塗装", cost: "80〜150万円" },
            { part: "屋根", status: "注意", color: "#ea580c", bg: "#ffedd5", work: "屋根修繕", cost: "30〜80万円" },
            { part: "防水", status: "良好", color: "#16a34a", bg: "#dcfce7", work: "—", cost: "—" },
          ].map(item => (
            <div key={item.part} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", width: "2.5rem", flexShrink: 0 }}>{item.part}</span>
              <span style={{ background: item.bg, color: item.color, fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>{item.status}</span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", flex: 1 }}>{item.work}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827" }}>{item.cost}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: "0.75rem", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>近くの施工会社を探す</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem" }}>AIスコア上位 3社を表示</p>
          </div>
          <ArrowRight style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
        </div>
      </div>
    </div>
  );
}

function AdSpace({ label = "広告スペース" }: { label?: string }) {
  return (
    <div style={{ background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: "0.75rem", padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", minHeight: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {label}
    </div>
  );
}

const FAQS = [
  { q: "本当に無料で使えますか？", a: "登録後3ヶ月間は全機能を完全無料でご利用いただけます。3ヶ月後も無料のまま登録継続でき、AI診断・業者マップ検索・案件投稿などの基本機能は引き続き無料です。チャット・電子サイン・修繕履歴機能を継続利用される場合は有料プラン（Aプラン¥550/月〜）をご利用ください。" },
  { q: "どんな修繕工事に対応していますか？", a: "外壁塗装・屋根修繕・防水工事・鉄部塗装・内装リフォーム・設備工事など建物修繕全般に対応しています。1,000万円以下の小〜中規模修繕に特化しています。" },
  { q: "登録している業者は信頼できますか？", a: "AIスコアで各社の施工実績・口コミ評価を透明に可視化しています。スコアが高い業者は実績・評価ともに良好な会社です。また、低評価の業者は表示順位が下がる仕組みです。" },
  { q: "個人情報は安全ですか？", a: "住所・連絡先はSupabase（米国AWS）の暗号化データベースに保管されます。業者への直接開示は行いません。" },
  { q: "複数の業者から見積もりを取れますか？", a: "はい。案件を投稿すると複数の業者から応募があります。見積もりを比較してから決めることができます。" },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ background: "white", borderRadius: "0.875rem", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.125rem 1.375rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111827" }}>{faq.q}</span>
            <ChevronDown style={{ width: "1.125rem", height: "1.125rem", color: "#9ca3af", flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {open === i && (
            <div style={{ padding: "0 1.375rem 1.125rem" }}>
              <p style={{ color: "#4b5563", fontSize: "0.9375rem", lineHeight: 1.75 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OwnersPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg, #052e16 0%, #15803d 60%, #16a34a 100%)", paddingTop: "5.5rem", paddingBottom: isMobile ? "3rem" : "4.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: MW, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? "2.5rem" : "4rem", alignItems: "center" }}>

            {/* LEFT: text */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.375rem 1.125rem", marginBottom: "1.5rem" }}>
                <Shield style={{ width: "0.875rem", height: "0.875rem", color: "#86efac" }} />
                <span style={{ color: "#86efac", fontSize: "0.875rem", fontWeight: 700 }}>登録後3ヶ月間は全機能無料</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <AIMascot size={52} animated bg1="#0d4f2e" bg2="#16a34a" style={{ flexShrink: 0 }} />
                <h1 style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)", fontWeight: 900, color: "white", lineHeight: 1.15 }}>
                  地元の職人に直接。<br />
                  <span style={{ color: "#86efac" }}>大手に頼まなくていい。</span>
                </h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.0625rem", lineHeight: 1.8, marginBottom: "0.75rem", maxWidth: "34rem" }}>
                「あなたが払ったお金は、あなたの建物を直す職人に届くべきです。」
              </p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "32rem" }}>
                AI診断・電子契約・修繕台帳が3ヶ月間すべて無料。その後は月¥550〜で継続利用できます。
              </p>
              <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.875rem" }}>
                <Link href="/owner/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "white", color: "#15803d", padding: "1rem 2rem", borderRadius: "1rem", fontWeight: 900, fontSize: "1.0625rem", textDecoration: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.2)" }}>
                  無料でオーナー登録 <ChevronRight style={{ width: "1.125rem", height: "1.125rem" }} />
                </Link>
                <Link href="/diagnosis" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
                  <Brain style={{ width: "1rem", height: "1rem" }} /> 先にAI診断を試す
                </Link>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem" }}>
                クレジットカード不要・登録1分・掲載まで無料
              </p>
            </div>

            {/* RIGHT: mockup (PC only) */}
            {!isMobile && (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "300px", height: "300px", background: "rgba(134,239,172,0.1)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
                <AIDiagnosisMock />
                <div style={{ position: "absolute", top: "-0.75rem", right: "-0.75rem", background: "#16a34a", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "0.375rem 0.875rem", borderRadius: "9999px", boxShadow: "0 2px 8px rgba(22,163,74,0.4)" }}>
                  ✨ 実際の診断レポート例
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: MW, margin: "0 auto", padding: "1.75rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "1rem", textAlign: "center" }}>
            {[
              { value: "完全無料", label: "オーナー登録", sub: "キャンペーン中", color: "#16a34a" },
              { value: "AI自動", label: "業者マッチング", sub: "中間業者なし", color: "#2563eb" },
              { value: "3タップ", label: "で案件掲載", sub: "スマホで完結", color: "#7c3aed" },
              { value: "直接", label: "職人とつながる", sub: "マージンゼロ", color: "#ea580c" },
            ].map(s => (
              <div key={s.value} style={{ padding: "0.625rem" }}>
                <div style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.875rem)", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: "clamp(0.75rem, 2vw, 0.875rem)", marginTop: "0.375rem" }}>{s.label}</div>
                <div style={{ color: "#6b7280", fontSize: "clamp(0.6875rem, 1.8vw, 0.75rem)", marginTop: "0.125rem" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD ───────────────────────────────────────── */}
      <div style={{ maxWidth: MW, margin: "1.5rem auto", padding: "0 1.5rem" }}>
        <AdSpace label="広告（Google AdSense）" />
      </div>

      {/* ── FEATURES: 3-card grid ────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
          <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>FEATURES</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#052e16", marginBottom: "0.75rem" }}>
            オーナーが使える3つの主要機能
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "38rem", margin: "0 auto", lineHeight: 1.75 }}>
            AI診断から業者選定まで。すべての機能が無料で使えます。
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
          {[
            {
              icon: Brain, accent: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe",
              title: "AI建物診断", sub: "無料・写真1枚でOK",
              desc: "スマホで建物を撮影してアップロードするだけ。劣化状態・修繕の優先度・概算費用を数秒でAIが分析します。",
              points: ["外壁・屋根・防水を自動判定", "修繕の緊急度を3段階で表示", "概算修繕費用の目安を提示", "PDFでレポート保存・印刷可"],
              href: "/diagnosis", cta: "AI診断を試す",
            },
            {
              icon: FileText, accent: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
              title: "案件投稿・業者マッチング", sub: "無料・2〜3タップで完了",
              desc: "修繕内容と希望時期を入力するだけで、地元の施工会社に自動通知されます。複数社から見積もりを比較できます。",
              points: ["スマホで2〜3分で投稿完了", "地元業者に自動通知", "複数社の見積もりを比較", "成約まで費用ゼロ"],
              href: "/properties/new", cta: "案件を投稿する",
            },
            {
              icon: MapPin, accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
              title: "施工業者マップ検索", sub: "無料・地図で一目",
              desc: "近くの登録業者をAIスコア順に地図表示。会社の実績・評価・対応工種を確認してから直接依頼できます。",
              points: ["AIスコア順で優良業者を表示", "対応工種・エリアで絞り込み", "施工写真・評価を事前確認", "直接問い合わせが可能"],
              href: "/contractors", cta: "業者を探す",
            },
          ].map(item => (
            <div key={item.title} style={{ background: "white", borderRadius: "1.5rem", border: `1px solid ${item.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: item.bg, padding: "1.875rem 1.875rem 1.375rem" }}>
                <div style={{ width: "3.25rem", height: "3.25rem", background: "white", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.125rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <item.icon style={{ width: "1.625rem", height: "1.625rem", color: item.accent }} />
                </div>
                <h3 style={{ fontWeight: 900, fontSize: "1.125rem", color: "#111827", marginBottom: "0.375rem" }}>{item.title}</h3>
                <span style={{ background: "white", color: item.accent, fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${item.border}`, borderRadius: "9999px", padding: "0.2rem 0.75rem" }}>{item.sub}</span>
              </div>
              <div style={{ padding: "1.375rem 1.875rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ color: "#4b5563", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>{item.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1 }}>
                  {item.points.map(p => (
                    <li key={p} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", color: "#374151" }}>
                      <CheckCircle style={{ width: "1rem", height: "1rem", color: item.accent, flexShrink: 0 }} />{p}
                    </li>
                  ))}
                </ul>
                <Link href={item.href} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: item.accent, color: "white", textDecoration: "none", padding: "0.875rem 1.375rem", borderRadius: "0.875rem", fontWeight: 700, fontSize: "0.9375rem" }}>
                  {item.cta} <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY LOCAL ────────────────────────────────── */}
      <section style={{ background: "white", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: MW, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>WHY LOCAL?</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#052e16", marginBottom: "0.75rem" }}>
              なぜ地元の職人と直接取引なのか
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "38rem", margin: "0 auto", lineHeight: 1.75 }}>
              ゼネコンや大手に頼んでも、実際に工事するのは地元の職人です。
              Smart Asset AIは支払いが直接職人に届く仕組みで、適正価格と透明な取引を実現します。
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {/* BEFORE */}
            <div style={{ background: "#fef2f2", borderRadius: "1.5rem", padding: "2rem", border: "2px solid #fecaca" }}>
              <div style={{ fontWeight: 900, fontSize: "1.0625rem", color: "#991b1b", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>❌</span> 大手に頼む場合
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[
                  { label: "オーナー", sub: "大手会社に依頼", red: false },
                  { label: "中間マージン", sub: "営業費・管理コスト・利益", red: true },
                  { label: "さらに下請け", sub: "2次請け・3次請けも", red: true },
                  { label: "地元の職人", sub: "実際に工事する人", red: false },
                ].map((r, i) => (
                  <div key={i}>
                    {i > 0 && <div style={{ textAlign: "center", color: r.red ? "#ef4444" : "#94a3b8", fontSize: "0.8125rem", fontWeight: 700, margin: "0.2rem 0" }}>↓ {r.red ? "マージンが発生" : ""}</div>}
                    <div style={{ background: r.red ? "#fee2e2" : "white", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: r.red ? "1px solid #fecaca" : "1px solid #f1f5f9" }}>
                      <div style={{ fontWeight: 700, color: r.red ? "#dc2626" : "#374151", fontSize: "0.9375rem" }}>{r.label}</div>
                      <div style={{ color: r.red ? "#ef4444" : "#9ca3af", fontSize: "0.8125rem" }}>{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.25rem", background: "#dc2626", borderRadius: "0.875rem", padding: "0.875rem", textAlign: "center", color: "white", fontWeight: 800, fontSize: "0.9375rem" }}>
                支払いの 30〜50% が中間コスト
              </div>
            </div>
            {/* AFTER */}
            <div style={{ background: "#f0fdf4", borderRadius: "1.5rem", padding: "2rem", border: "2px solid #bbf7d0" }}>
              <div style={{ fontWeight: 900, fontSize: "1.0625rem", color: "#166534", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>✅</span> Smart Asset AIの場合
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ background: "white", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontWeight: 700, color: "#374151", fontSize: "0.9375rem" }}>オーナー</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.8125rem" }}>案件をスマホで投稿（無料）</div>
                </div>
                <div style={{ textAlign: "center", color: "#16a34a", fontSize: "0.9375rem", fontWeight: 800 }}>↓ AIがマッチング（中間業者なし）</div>
                <div style={{ background: "#dcfce7", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontWeight: 700, color: "#166534", fontSize: "0.9375rem" }}>地元の塗装・防水・足場業者</div>
                  <div style={{ color: "#16a34a", fontSize: "0.8125rem", fontWeight: 600 }}>直接見積もり・マージンゼロ</div>
                </div>
              </div>
              <div style={{ marginTop: "1.25rem", background: "#16a34a", borderRadius: "0.875rem", padding: "0.875rem", textAlign: "center", color: "white", fontWeight: 800, fontSize: "0.9375rem" }}>
                支払いが 100% 職人に届く
              </div>
              <div style={{ marginTop: "1rem", background: "#bbf7d0", borderRadius: "0.875rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <TrendingDown style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: "#166534", fontSize: "0.9375rem" }}>修繕費用が 20〜40% 削減</div>
                  <div style={{ color: "#16a34a", fontSize: "0.8125rem" }}>中間マージンがない分、価格が下がります</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#fffbeb", borderRadius: "1rem", padding: "1.375rem 1.5rem", border: "1px solid #fde68a", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
              <Zap style={{ width: "1.375rem", height: "1.375rem", color: "#d97706", flexShrink: 0, marginTop: "0.125rem" }} />
              <p style={{ color: "#713f12", fontSize: "0.9375rem", lineHeight: 1.75 }}>
                <strong>小規模修繕こそ、地元の職人が得意です。</strong>
                外壁塗装・屋根修繕・防水工事など1,000万円以下の修繕は、地元の会社ほど丁寧で費用の内訳も明確です。
              </p>
            </div>
            <div style={{ background: "#eff6ff", borderRadius: "1rem", padding: "1.375rem 1.5rem", border: "1px solid #bfdbfe", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
              <BookOpen style={{ width: "1.375rem", height: "1.375rem", color: "#2563eb", flexShrink: 0, marginTop: "0.125rem" }} />
              <div>
                <p style={{ color: "#1e40af", fontWeight: 800, fontSize: "0.9375rem", marginBottom: "0.375rem" }}>🗂 工事履歴が財産になる</p>
                <p style={{ color: "#3b82f6", fontSize: "0.875rem", lineHeight: 1.75 }}>
                  修繕履歴・写真・契約書が自動保存。売却時・保険申請時・確定申告時に活用できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
          <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>HOW IT WORKS</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#052e16" }}>たった3ステップで依頼完了</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
          {[
            { step: "01", icon: Brain, title: "AI診断（無料・5分）", desc: "スマホで建物を撮影するだけ。AIが劣化状態・修繕優先度・概算費用を瞬時に分析します。写真が詳しいほど精度が上がります。", href: "/diagnosis", accent: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe", tag: "写真1枚でOK" },
            { step: "02", icon: FileText, title: "案件を投稿（無料）", desc: "住所・修繕内容・希望時期を入力するだけで地元施工会社に自動通知されます。投稿は2〜3分で完了します。", href: "/properties/new", accent: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", tag: "2〜3タップで完了" },
            { step: "03", icon: MapPin, title: "業者を検索・比較（無料）", desc: "近くの登録会社をAIスコア順に地図表示。評価・実績・価格帯を確認してから直接依頼できます。", href: "/contractors", accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", tag: "地図で一目でわかる" },
          ].map(item => (
            <Link key={item.step} href={item.href} style={{ display: "block", background: "white", borderRadius: "1.5rem", border: `1px solid ${item.border}`, overflow: "hidden", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ background: item.bg, padding: "1.75rem 1.875rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: item.border, lineHeight: 1 }}>{item.step}</div>
                  <div style={{ width: "2.875rem", height: "2.875rem", background: "white", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                    <item.icon style={{ width: "1.375rem", height: "1.375rem", color: item.accent }} />
                  </div>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.375rem" }}>{item.title}</h3>
                <span style={{ background: "white", color: item.accent, fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: `1px solid ${item.border}` }}>{item.tag}</span>
              </div>
              <div style={{ padding: "1.25rem 1.875rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.5rem" }}>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.75, flex: 1 }}>{item.desc}</p>
                <ArrowRight style={{ width: "1.25rem", height: "1.25rem", color: "#d1d5db", flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AD ───────────────────────────────────────── */}
      <div style={{ maxWidth: MW, margin: "0 auto 1.5rem", padding: "0 1.5rem" }}>
        <AdSpace label="広告（Google AdSense）" />
      </div>

      {/* ── SECURITY ─────────────────────────────────── */}
      <section style={{ background: "white", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: MW, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>SECURITY & TRUST</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#052e16" }}>安心してご利用いただけます</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1.25rem" }}>
            {[
              { icon: Shield, title: "登録会社をAIスコアで可視化", desc: "AIスコアで各社の実績・信頼性を透明に可視化しています。登録後すぐに地図上に掲載されます。", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { icon: Shield, title: "個人情報は安全に管理", desc: "オーナー様の住所・連絡先は暗号化保護されています。業者への直接開示は行いません。", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { icon: Star, title: "口コミ評価で品質保証", desc: "業者の評価はオーナーの口コミで可視化されます。低評価の業者は表示順位が下がります。", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { icon: Clock, title: "いつでも掲載取り下げ可能", desc: "気が変わったらマイページからワンクリックで削除できます。成約まで費用はかかりません。", color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
            ].map(item => (
              <div key={item.title} style={{ background: item.bg, borderRadius: "1.25rem", padding: "1.625rem 1.875rem", border: `1px solid ${item.border}`, display: "flex", gap: "1.125rem", alignItems: "flex-start" }}>
                <div style={{ width: "2.875rem", height: "2.875rem", background: "white", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                  <item.icon style={{ width: "1.375rem", height: "1.375rem", color: item.color }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "0.375rem" }}>{item.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>FAQ</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#052e16" }}>よくある質問</h2>
        </div>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <FAQSection />
        </div>
      </section>

      {/* ── AD ───────────────────────────────────────── */}
      <div style={{ maxWidth: MW, margin: "0 auto 1.5rem", padding: "0 1.5rem" }}>
        <AdSpace label="広告（Google AdSense）" />
      </div>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #052e16, #15803d)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ width: "4.5rem", height: "4.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Home style={{ width: "2.25rem", height: "2.25rem", color: "white" }} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.625rem, 4vw, 2.375rem)", color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
            今すぐ無料で始めましょう
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "1rem", lineHeight: 1.8 }}>
            登録後すぐにAI診断・業者検索が無料で利用できます。<br />
            成約まで費用はかかりません（成約時のみ成約金額の1%）。
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/owner/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", background: "white", color: "#15803d", textDecoration: "none", padding: "1.125rem 2.5rem", borderRadius: "1rem", fontWeight: 900, fontSize: "1.0625rem", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
              無料でオーナー登録する <ChevronRight style={{ width: "1.125rem", height: "1.125rem" }} />
            </Link>
            <Link href="/diagnosis" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", textDecoration: "none", padding: "1.125rem 2rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem" }}>
              <Brain style={{ width: "1rem", height: "1rem" }} /> AI診断を試す
            </Link>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginTop: "1rem" }}>
            メールアドレスのみ・クレジットカード不要
          </p>
          <PWAInstallButton />
        </div>
      </section>
    </div>
  );
}
