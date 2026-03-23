"use client";
import PWAInstallButton from "@/components/PWAInstallButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin, Star, Shield, ArrowRight, HardHat,
  ChevronRight, CheckCircle, Building2, ChevronDown,
  Camera, FileText, Brain, TrendingUp, Award
} from "lucide-react";
import AIMascot from "@/components/AIMascot";

const MW = "1100px";

// ─── Property Map Mock ──────────────────────────────────
const PROPERTY_PINS = [
  { x: 55, y: 32, icon: "🏢", color: "#16a34a", name: "渋谷区 分譲マンション", work: "外壁補修・防水工事", urgency: "急", urgencyColor: "#dc2626", urgencyBg: "#fee2e2" },
  { x: 28, y: 52, icon: "🏠", color: "#0891b2", name: "新宿区 アパート", work: "屋根修繕・雨漏り対応", urgency: "近日", urgencyColor: "#d97706", urgencyBg: "#fef3c7" },
  { x: 70, y: 58, icon: "🏡", color: "#7c3aed", name: "目黒区 戸建", work: "外壁塗装・鉄部補修", urgency: "計画中", urgencyColor: "#4b5563", urgencyBg: "#f3f4f6" },
  { x: 44, y: 72, icon: "🏬", color: "#b45309", name: "品川区 賃貸マンション", work: "防水・外壁劣化補修", urgency: "急", urgencyColor: "#dc2626", urgencyBg: "#fee2e2" },
  { x: 18, y: 28, icon: "🏢", color: "#16a34a", name: "港区 分譲マンション", work: "共用部リノベーション", urgency: "近日", urgencyColor: "#d97706", urgencyBg: "#fef3c7" },
];

function MapMock() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", boxShadow: "0 12px 48px rgba(0,0,0,0.18)", overflow: "hidden", width: "100%" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1d4ed8)", padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <MapPin style={{ width: "1rem", height: "1rem", color: "white" }} />
        <span style={{ color: "white", fontWeight: 800, fontSize: "0.875rem" }}>修繕案件マップ（デモ）</span>
        <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.6875rem", padding: "0.15rem 0.625rem", borderRadius: "9999px", fontWeight: 600 }}>東京都内 5件</span>
      </div>
      <div style={{ background: "#e8f4f8", height: "180px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        {PROPERTY_PINS.map((pin, i) => (
          <button key={i} onClick={() => setActive(active === i ? null : i)}
            style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", background: active === i ? pin.color : "white", border: `2px solid ${pin.color}`, borderRadius: "0.5rem", padding: "2px 5px", fontSize: "0.875rem", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", transition: "all 0.15s", lineHeight: 1 }}>
            {pin.icon}
          </button>
        ))}
      </div>
      <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {PROPERTY_PINS.slice(0, 3).map((pin, i) => (
          <div key={i} onClick={() => setActive(active === i ? null : i)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: active === i ? "#eff6ff" : "#f8fafc", borderRadius: "0.5rem", cursor: "pointer", border: active === i ? "1px solid #bfdbfe" : "1px solid transparent", transition: "all 0.15s" }}>
            <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{pin.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#111827" }}>{pin.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{pin.work}</div>
            </div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", background: pin.urgencyBg, color: pin.urgencyColor, flexShrink: 0 }}>{pin.urgency}</span>
          </div>
        ))}
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", padding: "0.25rem 0" }}>他 2件 ···</div>
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
  { q: "本当に無料で始められますか？", a: "はい。FREEプランでは地図掲載・プロフィールページ作成・オーナーからの問い合わせ受信は無料です。Aプラン（¥3,000/月）に登録すると案件への応募が月10件まで可能になります。" },
  { q: "個人事業主・一人親方でも登録できますか？", a: "はい。法人・個人事業主・一人親方問わず誰でも登録できます。名前・メールアドレス・対応工種を入力するだけで3分で完了します。" },
  { q: "ランクはどうやって上がりますか？", a: "プロフィールの充実度（写真・資格・説明文）とオーナーからの口コミ評価・完了案件数でランクが上がります。AIスコアによる自動算出です。" },
  { q: "案件に応募したら確実に仕事になりますか？", a: "応募はオーナーへの意思表示です。オーナーが複数社の中から選ぶ形になります。ランクが高く口コミ評価が良い会社ほど選ばれやすくなります。" },
  { q: "支払い方法は何がありますか？", a: "クレジットカード払いのみ対応しています。Stripe経由で安全に処理されます。マイページからいつでもキャンセル可能です。" },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ background: "white", borderRadius: "0.875rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
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

const RANKS = [
  { rank: "S", label: "プロ", desc: "70点以上・実績豊富", color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe", icon: "🏆" },
  { rank: "A", label: "上級", desc: "60〜69点・経験豊富", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: "⭐" },
  { rank: "B", label: "中級", desc: "50〜59点・実績あり", color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0", icon: "✅" },
  { rank: "C", label: "初級", desc: "40〜49点・活動中", color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: "📋" },
  { rank: "D", label: "新規", desc: "30〜39点・登録済み", color: "#374151", bg: "#f9fafb", border: "#e5e7eb", icon: "🆕" },
];

export default function ContractorsPage() {
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
      <section style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)", paddingTop: "5.5rem", paddingBottom: isMobile ? "3rem" : "4.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: MW, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? "2.5rem" : "4rem", alignItems: "center" }}>

            {/* LEFT: text */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px", padding: "0.375rem 1.125rem", marginBottom: "1.5rem" }}>
                <HardHat style={{ width: "0.875rem", height: "0.875rem", color: "#93c5fd" }} />
                <span style={{ color: "#93c5fd", fontSize: "0.875rem", fontWeight: 700 }}>施工会社様向け・無料で地図掲載スタート</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <AIMascot size={52} animated bg1="#0f172a" bg2="#1d4ed8" style={{ flexShrink: 0 }} />
                <h1 style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)", fontWeight: 900, color: "white", lineHeight: 1.15 }}>
                  地元オーナーから<br />
                  <span style={{ color: "#93c5fd" }}>直接受注する時代へ。</span>
                </h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.0625rem", lineHeight: 1.8, marginBottom: "0.75rem", maxWidth: "34rem" }}>
                「あなたの技術は、正当に評価されるべきです。」<br />
                大手の下請けから卒業して、直接オーナーと仕事をしよう。
              </p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "32rem" }}>
                電子契約で印紙税ゼロ。AIスコアで実績が可視化されます。
              </p>
              <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.875rem" }}>
                <Link href="/contractors/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "white", color: "#1d4ed8", padding: "1rem 2rem", borderRadius: "1rem", fontWeight: 900, fontSize: "1.0625rem", textDecoration: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.2)" }}>
                  無料で会社登録 <ChevronRight style={{ width: "1.125rem", height: "1.125rem" }} />
                </Link>
                <a href="#plans" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
                  料金プランを確認 ↓
                </a>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>
                登録3分・クレジットカード不要・いつでも退会OK
              </p>
            </div>

            {/* RIGHT: mockup (PC only) */}
            {!isMobile && (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "300px", height: "300px", background: "rgba(147,197,253,0.08)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
                <MapMock />
                <div style={{ position: "absolute", top: "-0.75rem", right: "-0.75rem", background: "#1d4ed8", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "0.375rem 0.875rem", borderRadius: "9999px", boxShadow: "0 2px 8px rgba(29,78,216,0.4)" }}>
                  📍 実際の案件マップ例
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
              { value: "無料", label: "地図掲載スタート", sub: "クレカ不要", color: "#1d4ed8" },
              { value: "0円", label: "中間マージン", sub: "全額が自社収益", color: "#16a34a" },
              { value: "3分", label: "で登録完了", sub: "メアドだけOK", color: "#7c3aed" },
              { value: "直接", label: "オーナーと取引", sub: "中間業者なし", color: "#ea580c" },
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

      {/* ── MAP DEMO SECTION ──────────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "380px 1fr", gap: isMobile ? "2rem" : "4rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <MapMock />
          </div>
          <div>
            <p style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>STEP 1 · 地図掲載（無料）</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.625rem, 3.5vw, 2.25rem)", color: "#0f172a", lineHeight: 1.25, marginBottom: "1rem" }}>
              地図に載るだけで<br />オーナーに見つかる
            </h2>
            <p style={{ color: "#4b5563", lineHeight: 1.8, marginBottom: "1.25rem", fontSize: "0.9375rem" }}>
              登録した瞬間から地図上に表示されます。スマホで検索しているオーナーに、あなたのプロフィールが届きます。
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                "住所・対応工種を入力すると地図に自動掲載",
                "AIスコアが高いほど検索上位に表示",
                "プロフィールページが自動作成される",
                "オーナーからのメール問い合わせを受信",
              ].map(t => (
                <li key={t} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.9375rem", color: "#374151" }}>
                  <CheckCircle style={{ width: "1.125rem", height: "1.125rem", color: "#1d4ed8", flexShrink: 0 }} />{t}
                </li>
              ))}
            </ul>
            <Link href="/contractors/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", background: "linear-gradient(135deg, #1d4ed8, #1e40af)", color: "white", textDecoration: "none", padding: "0.9375rem 1.75rem", borderRadius: "0.875rem", fontWeight: 700, fontSize: "1rem", boxShadow: "0 4px 14px rgba(29,78,216,0.35)" }}>
              <MapPin style={{ width: "1rem", height: "1rem" }} /> 今すぐ地図に載る（無料）
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: 5 steps ────────────────────── */}
      <section style={{ background: "white", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: MW, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <p style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>HOW IT WORKS</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#0f172a" }}>5ステップで受注まで</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1.25rem" }}>
            {[
              { step: "01", icon: HardHat, title: "無料で会社登録（3分）", desc: "メールアドレスだけで登録開始。会社名・所在地・対応工種・説明文を入力するとプロフィールページが自動作成されます。法人・個人・一人親方問わず登録できます。", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { step: "02", icon: Camera, title: "写真・実績を追加してランクUP", desc: "施工前後の写真・実績・資格・説明文を追加するだけでランクが上がります。検索上位に表示されるようになり、オーナーから選ばれやすくなります。", color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
              { step: "03", icon: MapPin, title: "案件に応募する（有料プラン）", desc: "Aプランに登録すると、オーナーが掲載した修繕案件に月10件まで応募できます。Bプランでは月20件まで応募可能。通知が来たらすぐに確認しましょう。", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { step: "04", icon: FileText, title: "見積もり提出・電子契約締結", desc: "オーナーと直接連絡して見積もりを提出。電子サインで契約を締結してから着工します。印紙税ゼロ・書類の紛失なし・スマホで完結します。", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
              { step: "05", icon: Star, title: "評価を積み上げてランクを育てる", desc: "施工完了後にオーナーから口コミ評価をもらいます。高評価が積み重なるほどランクが上がり、より多くの案件に出会えます。", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", padding: "1.5rem 1.75rem", background: item.bg, borderRadius: "1.25rem", border: `1px solid ${item.border}` }}>
                <div style={{ flexShrink: 0, textAlign: "center", width: "3.5rem" }}>
                  <div style={{ fontSize: "2.25rem", fontWeight: 900, color: item.border, lineHeight: 1 }}>{item.step}</div>
                  <div style={{ width: "2.875rem", height: "2.875rem", background: "white", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0.375rem auto 0", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                    <item.icon style={{ width: "1.375rem", height: "1.375rem", color: item.color }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.375rem" }}>{item.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
            {/* 5th card: full-width on 2-col grid */}
          </div>
        </div>
      </section>

      {/* ── RANK SYSTEM ──────────────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>RANK SYSTEM</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#0f172a", marginBottom: "0.75rem" }}>
            ランク＆口コミで信頼を証明
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "36rem", margin: "0 auto", lineHeight: 1.75 }}>
            AIスコアはプロフィール充実度・口コミ評価・実績数で自動算出されます。
            ランクは信頼のシグナルです。
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: "1rem" }}>
          {RANKS.map(r => (
            <div key={r.rank} style={{ background: r.bg, borderRadius: "1.25rem", padding: "1.5rem 1.25rem", textAlign: "center", border: `1px solid ${r.border}` }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.625rem" }}>{r.icon}</div>
              <div style={{ width: "2.75rem", height: "2.75rem", background: r.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.625rem" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: "1.0625rem" }}>{r.rank}</span>
              </div>
              <div style={{ fontWeight: 800, color: r.color, fontSize: "1rem", marginBottom: "0.25rem" }}>{r.label}</div>
              <div style={{ color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
          <div style={{ background: "#eff6ff", borderRadius: "1rem", padding: "1.375rem 1.5rem", border: "1px solid #bfdbfe", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <TrendingUp style={{ width: "1.375rem", height: "1.375rem", color: "#1d4ed8", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <p style={{ color: "#1e40af", fontWeight: 800, fontSize: "0.9375rem", marginBottom: "0.375rem" }}>ランクUPの条件</p>
              <p style={{ color: "#3b82f6", fontSize: "0.875rem", lineHeight: 1.75 }}>
                プロフィール完成度（写真・資格・説明文）＋オーナー口コミ評価（★）＋プラットフォームでの完了案件数で自動算出されます。
              </p>
            </div>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: "1rem", padding: "1.375rem 1.5rem", border: "1px solid #bbf7d0", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <Award style={{ width: "1.375rem", height: "1.375rem", color: "#16a34a", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <p style={{ color: "#166534", fontWeight: 800, fontSize: "0.9375rem", marginBottom: "0.375rem" }}>スコア算出式</p>
              <p style={{ color: "#16a34a", fontSize: "0.875rem", lineHeight: 1.75 }}>
                （①プロフィール充実度 90点 ＋ ②オーナー満足度評価 90点）÷ 2 ＋ ③継続会員ポイント（最大10点）＝ 合計点
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AD ───────────────────────────────────────── */}
      <div style={{ maxWidth: MW, margin: "0 auto 1.5rem", padding: "0 1.5rem" }}>
        <AdSpace label="広告（Google AdSense）" />
      </div>

      {/* ── PLANS ────────────────────────────────────── */}
      <section id="plans" style={{ background: "white", borderTop: "1px solid #e5e7eb", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: MW, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <p style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>PRICING</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#0f172a" }}>料金プラン</h2>
            <p style={{ color: "#6b7280", marginTop: "0.625rem", fontSize: "1rem" }}>地図掲載・プロフィール作成は無料で始められます</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem", alignItems: "start" }}>

            {/* FREE */}
            <div style={{ background: "#f8fafc", borderRadius: "1.5rem", padding: "2rem", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, color: "#6b7280", fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>FREE</div>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>¥0<span style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280" }}>/月</span></div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.375rem", marginBottom: "1.75rem" }}>まずは地図に載るだけ</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {["地図に掲載・プロフィール作成", "オーナーからの問い合わせ受信", "施工実績 1枚掲載", "AIスコア表示"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <CheckCircle style={{ width: "1rem", height: "1rem", color: "#6b7280", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/contractors/register" style={{ display: "block", textAlign: "center", padding: "0.875rem", background: "white", border: "2px solid #e2e8f0", color: "#374151", borderRadius: "0.875rem", fontWeight: 700, textDecoration: "none", fontSize: "0.9375rem" }}>
                無料で始める
              </Link>
            </div>

            {/* A PLAN */}
            <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", border: "2px solid #3b82f6", boxShadow: "0 4px 24px rgba(59,130,246,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "0.8125rem", letterSpacing: "0.08em" }}>A プラン</span>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>人気</span>
              </div>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>¥3,000<span style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280" }}>/月</span></div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.375rem", marginBottom: "1.75rem" }}>積極的に案件を獲りに行く</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {[
                  "FREEの全機能",
                  "案件への応募 月10件まで",
                  "施工事例 3枚掲載",
                  "オーナーへのメッセージ送信",
                  "AIスコア詳細表示",
                ].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <CheckCircle style={{ width: "1rem", height: "1rem", color: "#1d4ed8", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/contractors/register" style={{ display: "block", textAlign: "center", padding: "0.9375rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", borderRadius: "0.875rem", fontWeight: 700, textDecoration: "none", fontSize: "1rem", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
                Aプランで始める →
              </Link>
            </div>

            {/* B PLAN */}
            <div style={{ background: "linear-gradient(160deg, #0f172a, #1e3a8a)", borderRadius: "1.5rem", padding: "2rem", border: "2px solid #6366f1", position: "relative" }}>
              <div style={{ position: "absolute", top: "-0.875rem", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", padding: "0.3rem 1.125rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                🏆 最高プラン
              </div>
              <div style={{ fontWeight: 800, color: "#a5b4fc", fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>B プラン</div>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "white", lineHeight: 1 }}>¥6,000<span style={{ fontSize: "1rem", fontWeight: 500, color: "#93c5fd" }}>/月</span></div>
              <div style={{ color: "#93c5fd", fontSize: "0.875rem", marginTop: "0.375rem", marginBottom: "1.75rem" }}>最大限に受注を増やす</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {[
                  "Aプランの全機能",
                  "案件への応募 月20件まで",
                  "優先表示（検索上位に固定）",
                  "施工写真 4枚＋会社写真 1枚",
                  "AIスコア分析レポート",
                  "専用バッジ表示",
                ].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ color: "#60a5fa", flexShrink: 0, fontSize: "1rem" }}>✓</span>
                    <span style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/contractors/register" style={{ display: "block", textAlign: "center", padding: "0.9375rem", background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "white", borderRadius: "0.875rem", fontWeight: 700, textDecoration: "none", fontSize: "1rem", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                Bプランで始める →
              </Link>
            </div>
          </div>

          <div style={{ background: "#eff6ff", borderRadius: "1rem", padding: "1.375rem 1.75rem", marginTop: "2rem", border: "1px solid #bfdbfe", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
            <Shield style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb", flexShrink: 0, marginTop: "0.125rem" }} />
            <p style={{ color: "#1e40af", fontSize: "0.875rem", lineHeight: 1.75 }}>
              <strong>いつでもキャンセル可能。</strong>
              有料プランはマイページからいつでも解約できます。解約後は翌月から課金が止まります。登録から地図掲載まですべて無料で始められます。
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ maxWidth: MW, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>FAQ</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.375rem)", color: "#0f172a" }}>よくある質問</h2>
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
      <section style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ width: "4.5rem", height: "4.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Building2 style={{ width: "2.25rem", height: "2.25rem", color: "white" }} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.625rem, 4vw, 2.375rem)", color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
            今すぐ地図に載ろう
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "1rem", lineHeight: 1.8 }}>
            登録後すぐに地図に掲載。オーナーからの問い合わせを無料で受信できます。<br />
            下請けを卒業して、直接取引を始めましょう。
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/contractors/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", background: "white", color: "#1d4ed8", textDecoration: "none", padding: "1.125rem 2.5rem", borderRadius: "1rem", fontWeight: 900, fontSize: "1.0625rem", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
              無料で会社登録する <ChevronRight style={{ width: "1.125rem", height: "1.125rem" }} />
            </Link>
            <a href="#plans" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white", textDecoration: "none", padding: "1.125rem 2rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem" }}>
              料金プランを確認 ↓
            </a>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", marginTop: "1rem" }}>
            登録1分・クレジットカード不要・いつでも退会OK
          </p>
          <PWAInstallButton />
        </div>
      </section>
    </div>
  );
}
