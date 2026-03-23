"use client";

import { useState, useEffect } from "react";

// ── ベース寸法（変換前） ─────────────────────────────────────
const BASE_W = 216;
const BASE_H = 450;

// ── Phone Frame ─────────────────────────────────────────────
function PhoneFrame({ children, bg = "#f8fafc" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ width: `${BASE_W}px`, flexShrink: 0, background: "#111", borderRadius: "2.25rem", padding: "0.5rem", boxShadow: "0 24px 72px rgba(0,0,0,0.45)" }}>
      <div style={{ background: "#111", height: "1.625rem", display: "flex", justifyContent: "center", alignItems: "center", borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem" }}>
        <div style={{ width: "3.25rem", height: "0.375rem", background: "#2a2a2a", borderRadius: "9999px" }} />
      </div>
      <div style={{ background: bg, borderRadius: "1.625rem", overflow: "hidden", minHeight: "360px" }}>
        {children}
      </div>
      <div style={{ height: "1.375rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "2.25rem", height: "0.25rem", background: "#2a2a2a", borderRadius: "9999px" }} />
      </div>
    </div>
  );
}

// ── Chat Mock ────────────────────────────────────────────────
function ChatMock() {
  const msgs = [
    { me: false, text: "外壁塗装の見積もりをお願いします", time: "14:30" },
    { me: true,  text: "承知しました！面積を教えてください📐", time: "14:32" },
    { me: false, text: "250㎡ほどです", time: "14:33" },
    { me: true,  text: "📎 現地調査レポートを送りました", time: "15:10" },
    { me: true,  text: "¥580,000（税込）で承ります", time: "15:12" },
    { me: false, text: "ありがとうございます。電子契約で進めます ✅", time: "15:14" },
  ];
  return (
    <div style={{ padding: "0.625rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", borderRadius: "1rem 1rem 0 0", padding: "0.625rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: "-0.625rem -0.625rem 0" }}>
        <div style={{ width: "1.75rem", height: "1.75rem", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem" }}>🔨</div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "0.6875rem" }}>山田塗装</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.5625rem" }}>オンライン</div>
        </div>
      </div>
      <div style={{ paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.me ? "flex-end" : "flex-start" }}>
            <div style={{ background: m.me ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#e5e7eb", color: m.me ? "white" : "#111", borderRadius: m.me ? "0.75rem 0.125rem 0.75rem 0.75rem" : "0.125rem 0.75rem 0.75rem 0.75rem", padding: "0.375rem 0.625rem", fontSize: "0.5625rem", maxWidth: "80%", lineHeight: 1.4 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Map Mock ─────────────────────────────────────────────────
function MapMock() {
  const pins = [
    { x: 50, y: 40, rank: "S", color: "#7c3aed", size: 24 },
    { x: 30, y: 58, rank: "A", color: "#1d4ed8", size: 20 },
    { x: 70, y: 62, rank: "B", color: "#065f46", size: 20 },
    { x: 55, y: 73, rank: "A", color: "#1d4ed8", size: 20 },
    { x: 20, y: 38, rank: "C", color: "#92400e", size: 18 },
  ];
  return (
    <div style={{ position: "relative", height: "360px", background: "#e8f4e8", overflow: "hidden" }}>
      {[0,1,2,3,4,5,6].map(i => (
        <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i*16+8}%`, height: "1px", background: "rgba(0,0,0,0.06)" }} />
      ))}
      {[0,1,2,3,4,5].map(i => (
        <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i*20+10}%`, width: "1px", background: "rgba(0,0,0,0.06)" }} />
      ))}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.7)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "3px", background: "rgba(255,255,255,0.7)" }} />
      {pins.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, background: p.color, borderRadius: "50% 50% 50% 0", transform: "translate(-50%,-100%) rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
          <span style={{ transform: "rotate(45deg)", color: "white", fontWeight: 900, fontSize: `${p.size * 0.45}px` }}>{p.rank}</span>
        </div>
      ))}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "0.5rem 0.75rem" }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: "0.625rem" }}>📍 近くの優良業者を検索</div>
      </div>
      <div style={{ position: "absolute", bottom: "0.75rem", left: "0.5rem", right: "0.5rem", background: "white", borderRadius: "0.75rem", padding: "0.625rem 0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "1.75rem", height: "1.75rem", background: "#7c3aed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "0.625rem", flexShrink: 0 }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.625rem", color: "#111" }}>山田塗装工業</div>
            <div style={{ fontSize: "0.5rem", color: "#6b7280" }}>⭐4.9 · 実績127件 · 徒歩3分</div>
          </div>
          <div style={{ marginLeft: "auto", background: "#2563eb", color: "white", fontSize: "0.5625rem", padding: "0.25rem 0.5rem", borderRadius: "9999px", fontWeight: 700, whiteSpace: "nowrap" }}>連絡する</div>
        </div>
      </div>
    </div>
  );
}

// ── Contract Mock ─────────────────────────────────────────────
function ContractMock() {
  return (
    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", borderRadius: "0.75rem", padding: "0.625rem 0.75rem" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.5rem", marginBottom: "0.125rem" }}>電子工事請負契約書</div>
        <div style={{ color: "white", fontWeight: 800, fontSize: "0.625rem" }}>外壁塗装工事 / 田中アパート</div>
      </div>

      {/* Contract details */}
      {[
        { label: "工事金額", value: "¥580,000（税込）" },
        { label: "工　　期", value: "2026/04/01〜04/07" },
        { label: "保　　証", value: "10年保証" },
        { label: "印　紙　代", value: "¥0（電子契約）", green: true },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "0.5625rem", color: "#9ca3af" }}>{r.label}</span>
          <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: r.green ? "#16a34a" : "#111" }}>{r.value}</span>
        </div>
      ))}

      {/* Owner signature — signed */}
      <div style={{ background: "#f0fdf4", borderRadius: "0.5rem", padding: "0.45rem 0.625rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.4375rem", color: "#6b7280", marginBottom: "0.1rem" }}>オーナー署名</div>
          <div style={{ fontFamily: "cursive", fontSize: "0.75rem", color: "#1e3a8a", fontWeight: 700 }}>田中 誠一</div>
        </div>
        <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.4375rem", padding: "0.15rem 0.4rem", borderRadius: "9999px", fontWeight: 800, whiteSpace: "nowrap" }}>✓ 署名済</span>
      </div>

      {/* Contractor signature — signed */}
      <div style={{ background: "#f0fdf4", borderRadius: "0.5rem", padding: "0.45rem 0.625rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.4375rem", color: "#6b7280", marginBottom: "0.1rem" }}>施工会社署名</div>
          <div style={{ fontFamily: "cursive", fontSize: "0.75rem", color: "#1e3a8a", fontWeight: 700 }}>山田 太郎</div>
        </div>
        <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.4375rem", padding: "0.15rem 0.4rem", borderRadius: "9999px", fontWeight: 800, whiteSpace: "nowrap" }}>✓ 署名済</span>
      </div>

      {/* Completion badge */}
      <div style={{ background: "linear-gradient(135deg,#dcfce7,#ecfdf5)", border: "1px solid #86efac", borderRadius: "0.5rem", padding: "0.5rem 0.625rem", textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: "0.5625rem", color: "#15803d", marginBottom: "0.1rem" }}>🎉 契約締結完了</div>
        <div style={{ fontSize: "0.4375rem", color: "#6b7280" }}>PDF自動発行 · クラウド保管 · 電子認証済み</div>
      </div>
    </div>
  );
}

// ── AI Diagnosis Mock ─────────────────────────────────────────
function DiagnosisMock() {
  return (
    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <div style={{ textAlign: "center", padding: "0.625rem 0" }}>
        <div style={{ fontSize: "0.625rem", color: "#6b7280", marginBottom: "0.375rem" }}>🤖 AI診断スコア</div>
        <div style={{ position: "relative", width: "88px", height: "88px", margin: "0 auto" }}>
          <svg viewBox="0 0 80 80" style={{ width: "88px", height: "88px", transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#grad2)" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 32 * 0.87} ${2 * Math.PI * 32}`} strokeLinecap="round" />
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 900, fontSize: "1.375rem", color: "#111" }}>87</span>
            <span style={{ fontSize: "0.5rem", color: "#7c3aed", fontWeight: 700 }}>Sランク</span>
          </div>
        </div>
      </div>
      {[
        { label: "施工品質", val: 90, color: "#7c3aed" },
        { label: "顧客対応", val: 85, color: "#2563eb" },
        { label: "価格適正", val: 82, color: "#16a34a" },
      ].map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.125rem" }}>
            <span style={{ fontSize: "0.5rem", color: "#6b7280" }}>{item.label}</span>
            <span style={{ fontSize: "0.5rem", fontWeight: 700, color: item.color }}>{item.val}点</span>
          </div>
          <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: `${item.val}%`, height: "100%", background: item.color, borderRadius: "9999px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Repair Ledger Mock ────────────────────────────────────────
function LedgerMock() {
  const records = [
    { year: "2024", work: "外壁塗装", cost: "¥580,000", icon: "🎨" },
    { year: "2023", work: "屋根防水", cost: "¥320,000", icon: "🏠" },
    { year: "2022", work: "給排水修理", cost: "¥85,000", icon: "🔧" },
  ];
  return (
    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius: "0.75rem", padding: "0.625rem 0.75rem" }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.5rem" }}>田中アパート 203号室</div>
        <div style={{ color: "white", fontWeight: 800, fontSize: "0.625rem", marginTop: "0.125rem" }}>🗂️ 修繕台帳</div>
      </div>
      {records.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", borderRadius: "0.5rem", padding: "0.5rem 0.625rem", border: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: "0.875rem" }}>{r.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.5625rem", color: "#111" }}>{r.work}</div>
            <div style={{ fontSize: "0.5rem", color: "#9ca3af" }}>{r.year}年施工</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: "0.5625rem", color: "#2563eb" }}>{r.cost}</div>
        </div>
      ))}
      <div style={{ background: "#eff6ff", borderRadius: "0.5rem", padding: "0.5rem 0.625rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.5rem", color: "#1d4ed8", fontWeight: 700 }}>📊 売却・保険・確定申告に活用</div>
      </div>
    </div>
  );
}

// ── Services ─────────────────────────────────────────────────
const services = [
  {
    id: "chat",
    badge: "チャット",
    color: "#2563eb",
    bg: "#eff6ff",
    sectionBg: "rgba(37,99,235,0.07)",
    title: "LINEのようなチャットで\n見積もりから契約まで完結",
    desc: "メールや電話に戻る必要なし。工事写真・PDF・見積書をその場で送受信できます。既読確認・ファイル管理もすべてアプリ内で完了。",
    points: ["既読確認つきのリアルタイム通知", "写真・PDF・見積書をその場で送受信", "過去のやり取りがすべて記録・検索可能"],
    mock: <ChatMock />,
    phoneBg: "#f8fafc",
  },
  {
    id: "map",
    badge: "地図検索",
    color: "#16a34a",
    bg: "#f0fdf4",
    sectionBg: "rgba(22,163,74,0.07)",
    title: "AIスコア付き地図で\n近くの信頼業者をすぐに発見",
    desc: "スマホの地図上にランクバッジ付きのピンが表示されます。S〜Eのランクと口コミ評価で業者の実力が一目でわかります。",
    points: ["AIスコアS〜Eランクで信頼度を可視化", "所在地・対応工種・実績を確認", "プロフィールページへワンタップで遷移"],
    mock: <MapMock />,
    phoneBg: "#e8f4e8",
  },
  {
    id: "contract",
    badge: "電子契約",
    color: "#7c3aed",
    bg: "#f5f3ff",
    sectionBg: "rgba(124,58,237,0.07)",
    title: "電子署名でその日に契約締結\n印紙税は完全ゼロ",
    desc: "工事請負契約書をアプリ上で作成して署名するだけ。印紙代2万〜5万円が完全ゼロになります。PDF自動発行・クラウド保管。",
    points: ["印紙代2万〜5万円が完全ゼロ", "当日中に電子署名→契約締結", "PDF契約書を自動発行・クラウド保管"],
    mock: <ContractMock />,
    phoneBg: "#fff",
  },
  {
    id: "ai",
    badge: "AI診断",
    color: "#7c3aed",
    bg: "#f5f3ff",
    sectionBg: "rgba(124,58,237,0.04)",
    title: "建物を撮影するだけで\nAIが劣化状態と費用を分析",
    desc: "スマホで外壁・屋根を撮影してアップロードするだけ。AIが劣化部位・修繕優先度・概算費用をレポートにまとめます。",
    points: ["外壁・屋根・防水の劣化を自動判定", "修繕優先度を3段階で評価", "概算工事費用の目安を即提示"],
    mock: <DiagnosisMock />,
    phoneBg: "#f8fafc",
  },
  {
    id: "ledger",
    badge: "修繕台帳",
    color: "#0891b2",
    bg: "#ecfeff",
    sectionBg: "rgba(8,145,178,0.06)",
    title: "工事記録が自動蓄積される\n売却・保険・確定申告に活用",
    desc: "工事完了ごとに写真・契約書・費用が自動保存されます。修繕履歴は建物の価値証明になり、すべてクラウドで永続保管されます。",
    points: ["写真・契約書・費用を自動でクラウド保管", "売却時の建物価値証明に活用", "保険申請・確定申告の根拠資料として使用可能"],
    mock: <LedgerMock />,
    phoneBg: "#f8fafc",
  },
];

// ── Main Export ──────────────────────────────────────────────
export default function ServiceShowcase() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const phoneScale = isMobile ? 1.1 : 1.5;
  const outerPhoneW = Math.round(BASE_W * phoneScale);
  const outerPhoneH = Math.round(BASE_H * phoneScale);

  return (
    <section style={{ background: "#0f172a", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: isMobile ? "3.5rem 1.25rem 2rem" : "5rem 1.5rem 2.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.1em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          ALL IN ONE APP
        </p>
        <h2 style={{ fontWeight: 900, fontSize: isMobile ? "1.75rem" : "2.625rem", color: "#fff", marginBottom: "1rem", lineHeight: 1.25 }}>
          スマホ1台で全部完結
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: isMobile ? "0.9375rem" : "1.0625rem", maxWidth: "34rem", margin: "0 auto", lineHeight: 1.8 }}>
          チャット・地図・電子契約・AI診断・修繕台帳がひとつのアプリで完結します
        </p>
      </div>

      {/* Service rows */}
      {services.map((s, i) => {
        const isEven = i % 2 === 0;
        return (
          <div key={s.id} style={{
            background: s.sectionBg,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: isMobile ? "3rem 1.25rem" : "5rem 1.5rem",
          }}>
            <div style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
              gap: isMobile ? "2.5rem" : "5rem",
              alignItems: "center",
              direction: (!isMobile && !isEven) ? "rtl" : "ltr",
            }}>
              {/* Text */}
              <div style={{ direction: "ltr" }}>
                <span style={{ background: s.bg, color: s.color, padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700, display: "inline-block", marginBottom: "1.25rem" }}>
                  {s.badge}
                </span>
                <h3 style={{ fontWeight: 900, fontSize: isMobile ? "1.375rem" : "2rem", color: "#fff", lineHeight: 1.3, marginBottom: "1rem", whiteSpace: "pre-line" }}>
                  {s.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? "0.9375rem" : "1.0625rem", lineHeight: 1.85, maxWidth: "30rem", marginBottom: "1.5rem" }}>
                  {s.desc}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {s.points.map(p => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", color: "rgba(255,255,255,0.8)", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                      <span style={{ color: s.color, fontSize: "1rem", marginTop: "0.05rem", flexShrink: 0 }}>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone — scale transform */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", direction: "ltr", flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: "-20%", background: `radial-gradient(ellipse, ${s.color}44 0%, transparent 70%)`, filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
                  <div style={{ width: `${outerPhoneW}px`, height: `${outerPhoneH}px`, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${BASE_W}px`, transform: `scale(${phoneScale})`, transformOrigin: "top left" }}>
                      <PhoneFrame bg={s.phoneBg}>{s.mock}</PhoneFrame>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ height: isMobile ? "3rem" : "4rem" }} />
    </section>
  );
}
