"use client";
import { useState } from "react";

type Role = "contractor" | "owner";

const PLAN_OPTIONS = [
  { name: "Aプラン", monthly: 550, annual: 6600, label: "¥550/月" },
  { name: "Bプラン", monthly: 880, annual: 10560, label: "¥880/月" },
];

const JOB_OPTIONS = [1, 3, 6, 12, 24];
const AVG_JOB_VALUE = 500_000;
const COMMISSION_RATE = 0.20; // 従来仲介 20%
const STAMP_TAX = 20_000;
const AI_DIAGNOSIS_COST = 50_000; // 専門家診断代

export default function ROISection() {
  const [role, setRole] = useState<Role>("contractor");
  const [jobsPerYear, setJobsPerYear] = useState(6);
  const [planIdx, setPlanIdx] = useState(0);

  const plan = PLAN_OPTIONS[planIdx];

  /* Contractor ROI */
  const traditionalCost = AVG_JOB_VALUE * COMMISSION_RATE * jobsPerYear;
  const smartAssetCost  = plan.annual;
  const contractorSavings = traditionalCost - smartAssetCost;
  const contractorROI  = Math.round(contractorSavings / smartAssetCost * 100);
  const breakEvenJobs  = Math.ceil(smartAssetCost / (AVG_JOB_VALUE * COMMISSION_RATE));

  /* Owner ROI (always free) */
  const ownerStampSavings = STAMP_TAX * jobsPerYear;
  const ownerTotalSavings = ownerStampSavings + AI_DIAGNOSIS_COST;

  const pct = Math.min(100, Math.round(contractorSavings / (traditionalCost || 1) * 100));

  return (
    <section style={{ padding: "5rem 0", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            ROI CALCULATOR
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "0.75rem", lineHeight: 1.25 }}>
            お金をかけても<br />
            <span style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              必ず元が取れる理由
            </span>
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            数字で見れば、Smart Assetは「コスト」ではなく「投資」です
          </p>
        </div>

        {/* Role tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {(["contractor", "owner"] as Role[]).map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "0.625rem 1.75rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.9375rem",
              border: "2px solid",
              borderColor: role === r ? "#2563eb" : "#e5e7eb",
              background: role === r ? "#2563eb" : "#fff",
              color: role === r ? "#fff" : "#6b7280",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {r === "contractor" ? "🔨 施工会社向け" : "🏠 オーナー向け"}
            </button>
          ))}
        </div>

        {/* ── Contractor ROI ── */}
        {role === "contractor" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "2rem", alignItems: "start" }}>

            {/* Left: controls */}
            <div style={{ background: "#f8fafc", borderRadius: "1.5rem", padding: "2rem", border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0f172a", marginBottom: "1.5rem" }}>
                📊 あなたの節約額を計算
              </h3>

              {/* Plan selector */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", marginBottom: "0.625rem" }}>利用プラン</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {PLAN_OPTIONS.map((p, i) => (
                    <button key={i} onClick={() => setPlanIdx(i)} style={{
                      flex: 1, padding: "0.625rem", borderRadius: "0.75rem", border: "2px solid",
                      borderColor: planIdx === i ? "#2563eb" : "#e5e7eb",
                      background: planIdx === i ? "#eff6ff" : "#fff",
                      color: planIdx === i ? "#2563eb" : "#6b7280",
                      fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                    }}>
                      {p.name}<br />
                      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jobs per year */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", marginBottom: "0.625rem" }}>
                  年間受注件数（目標）
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {JOB_OPTIONS.map(n => (
                    <button key={n} onClick={() => setJobsPerYear(n)} style={{
                      padding: "0.5rem 1rem", borderRadius: "0.625rem", border: "2px solid",
                      borderColor: jobsPerYear === n ? "#2563eb" : "#e5e7eb",
                      background: jobsPerYear === n ? "#eff6ff" : "#fff",
                      color: jobsPerYear === n ? "#2563eb" : "#6b7280",
                      fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                    }}>
                      年{n}件
                    </button>
                  ))}
                </div>
              </div>

              {/* Premise */}
              <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "0.875rem 1rem", border: "1px solid #e5e7eb", fontSize: "0.75rem", color: "#9ca3af" }}>
                ※ 工事単価¥500,000、従来手数料20%で試算
              </div>
            </div>

            {/* Right: result */}
            <div>
              {/* Big number */}
              <div style={{
                background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
                borderRadius: "1.5rem", padding: "2rem",
                marginBottom: "1rem",
                boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
              }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginBottom: "0.5rem" }}>
                  年間節約額（vs 従来手数料）
                </p>
                <div style={{ fontSize: "clamp(2rem,7vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  ¥{contractorSavings.toLocaleString()}
                </div>
                <p style={{ color: "#4ade80", fontWeight: 700, marginTop: "0.625rem", fontSize: "0.9375rem" }}>
                  投資対効果 +{contractorROI}%
                </p>
                {/* Bar */}
                <div style={{ marginTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>節約率</span>
                    <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.75rem" }}>{pct}%</span>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: "linear-gradient(90deg,#4ade80,#22c55e)",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { label: "従来手数料（年間）", value: `¥${traditionalCost.toLocaleString()}`, color: "#ef4444", icon: "💸" },
                  { label: `Smart Asset ${plan.name}（年間）`, value: `¥${smartAssetCost.toLocaleString()}`, color: "#2563eb", icon: "✅" },
                  { label: "差額（純節約）", value: `¥${contractorSavings.toLocaleString()}`, color: "#16a34a", icon: "🎯", bold: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: item.bold ? "#f0fdf4" : "#f8fafc",
                    borderRadius: "0.875rem", padding: "0.875rem 1.25rem",
                    border: item.bold ? "2px solid #bbf7d0" : "1px solid #e5e7eb",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151", fontWeight: item.bold ? 800 : 600 }}>
                      <span>{item.icon}</span>{item.label}
                    </span>
                    <span style={{ fontWeight: 900, fontSize: item.bold ? "1.125rem" : "0.9375rem", color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Break even callout */}
              <div style={{
                marginTop: "1rem",
                background: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
                border: "1px solid #c7d2fe",
                borderRadius: "1rem", padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <span style={{ fontSize: "1.75rem" }}>⚡</span>
                <div>
                  <p style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "0.9375rem" }}>
                    工事<strong>{breakEvenJobs}件</strong>で年間プラン代を全額回収
                  </p>
                  <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "0.2rem" }}>
                    それ以降は丸ごと利益に直結します
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Owner ROI ── */}
        {role === "owner" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {[
              {
                icon: "🆓",
                title: "3ヶ月間は全機能が無料",
                value: "¥0",
                sub: "登録後3ヶ月はすべての機能を無料体験",
                detail: "物件登録・AI診断・業者検索・チャット・電子サイン・修繕台帳、すべて3ヶ月間は完全無料。3ヶ月後も無料のまま登録継続でき、AI診断・マップ検索などの基本機能は引き続き無料。",
                color: "#16a34a",
                bg: "#f0fdf4",
                border: "#bbf7d0",
              },
              {
                icon: "📄",
                title: "印紙代が毎回ゼロ",
                value: "¥20,000〜50,000/件",
                sub: "電子契約で印紙代が完全ゼロ",
                detail: "工事請負契約書に必要な収入印紙。建設工事は契約額によって¥20,000〜¥60,000。Smart Assetの電子契約なら1円も不要。",
                color: "#2563eb",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                icon: "🤖",
                title: "AI建物診断が無料",
                value: "¥30,000〜100,000相当",
                sub: "専門家診断費用がゼロ",
                detail: "建築士や専門家に依頼すると¥3万〜10万かかる建物診断。Smart AssetのAIなら写真を撮るだけで無料。劣化箇所・優先度・概算費用をレポート。",
                color: "#7c3aed",
                bg: "#f5f3ff",
                border: "#ddd6fe",
              },
              {
                icon: "⏱️",
                title: "業者探しの時間を90%削減",
                value: "2週間 → 2日",
                sub: "複数業者に一括依頼が可能",
                detail: "従来は電話やメールで1社ずつ問い合わせ。Smart Assetなら近隣の優良業者を地図で探して一括依頼。複数の見積もりを同時に比較できます。",
                color: "#0891b2",
                bg: "#ecfeff",
                border: "#a5f3fc",
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                borderRadius: "1.25rem", padding: "1.75rem",
                border: `2px solid ${item.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: "3rem", height: "3rem",
                  background: item.bg, borderRadius: "0.875rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", marginBottom: "1rem",
                }}>
                  {item.icon}
                </div>
                <p style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", marginBottom: "0.375rem" }}>{item.title}</p>
                <p style={{ fontWeight: 900, fontSize: "1.25rem", color: item.color, marginBottom: "0.375rem" }}>{item.value}</p>
                <p style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#374151", marginBottom: "0.75rem" }}>{item.sub}</p>
                <p style={{ color: "#6b7280", fontSize: "0.8125rem", lineHeight: 1.7 }}>{item.detail}</p>
              </div>
            ))}

            {/* Big summary */}
            <div style={{
              gridColumn: "1 / -1",
              background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
              borderRadius: "1.5rem", padding: "2rem",
              display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center",
              boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
            }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>年間節約額（工事3件の場合）</p>
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  ¥{(ownerTotalSavings + STAMP_TAX * 2).toLocaleString()}+
                </div>
                <p style={{ color: "#4ade80", fontWeight: 700, marginTop: "0.5rem" }}>3ヶ月間は完全無料・その後も月¥550〜で継続可能</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="/auth" style={{
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  color: "#fff", fontWeight: 700, padding: "0.875rem 2rem",
                  borderRadius: "0.875rem", textDecoration: "none", fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.5)",
                  display: "inline-block",
                }}>
                  今すぐ無料で始める →
                </a>
                <a href="/diagnosis" style={{
                  background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600,
                  padding: "0.875rem 1.5rem", borderRadius: "0.875rem",
                  textDecoration: "none", fontSize: "1rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "inline-block",
                }}>
                  🤖 AI診断を試す（無料）
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
