"use client";

export default function CostComparison() {
  const comparisonData = [
    { item: "印紙代", traditional: "2,000円〜50,000円", smartAsset: "0円", savings: "100%削減" },
    { item: "郵送料", traditional: "往復1,000円〜",     smartAsset: "0円", savings: "100%削減" },
    { item: "契約締結時間", traditional: "1〜2週間",   smartAsset: "即日完了", savings: "90%短縮" },
    { item: "月額管理費用（業者）", traditional: "他社平均 5,000円〜", smartAsset: "Aプラン ¥3,000/月", savings: "40%削減" },
    { item: "書類保管コスト", traditional: "場所・労力が必要", smartAsset: "クラウド自動保存", savings: "完全ゼロ" },
  ];

  return (
    <section style={{ padding: "5rem 0", background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            COST COMPARISON
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#0f172a", marginBottom: "1rem" }}>
            従来手法との<span style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>圧倒的な差</span>
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>デジタル化で、コストも手間も大幅カット</p>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", color: "#fff" }}>
                {["項目", "従来手法", "Smart Asset", "削減効果"].map((h) => (
                  <th key={h} style={{ padding: "1rem 1.5rem", textAlign: h === "項目" ? "left" : "center", fontWeight: 700, fontSize: "0.9375rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#1e293b", fontSize: "0.9375rem" }}>{row.item}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "#ef4444", fontSize: "0.9375rem" }}>{row.traditional}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "#16a34a", fontWeight: 800, fontSize: "0.9375rem" }}>{row.smartAsset}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "0.25rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {row.savings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ textAlign: "center", marginTop: "2.5rem", background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", borderRadius: "1.25rem", padding: "1.75rem 2rem", border: "1px solid #c7d2fe" }}>
          <p style={{ fontSize: "1.125rem", color: "#374151", fontWeight: 600 }}>
            年間&nbsp;<span style={{ fontSize: "2rem", fontWeight: 900, color: "#16a34a" }}>10万円以上</span>&nbsp;の削減効果！
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem", marginTop: "0.375rem" }}>印紙代・郵送費・書類保管コストがすべて不要に</p>
        </div>
      </div>
    </section>
  );
}
