"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { heading: "サービス", items: [
      { label: "トップページ", href: "/" },
      { label: "オーナー向け", href: "/owners" },
      { label: "施工会社向け", href: "/contractors" },
      { label: "地図・業者検索", href: "/map-demo" },
    ]},
    { heading: "ご利用ガイド", items: [
      { label: "AI診断とは", href: "/diagnosis" },
      { label: "電子契約について", href: "/stripe-info" },
      { label: "料金・プラン", href: "/stripe-info" },
      { label: "よくある質問", href: "/" },
    ]},
    { heading: "法的情報", items: [
      { label: "利用規約", href: "/terms" },
      { label: "プライバシーポリシー", href: "/terms" },
      { label: "特定商取引法に基づく表記", href: "/terms" },
    ]},
  ];

  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "4rem 0 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
          {/* Brand */}
          <div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              🏗️ Smart Asset
            </h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#64748b", maxWidth: "16rem" }}>
              不動産業務を完全デジタル化。印紙代・送料ゼロで、見積もりから電子契約・修繕台帳まで一元管理。
            </p>
          </div>

          {/* Link columns */}
          {links.map((col) => (
            <div key={col.heading}>
              <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem", letterSpacing: "0.05em" }}>
                {col.heading}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} style={{ color: "#64748b", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "#93c5fd")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "#475569" }}>
            © {year} Smart Asset AI. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["利用規約", "プライバシー"].map((label) => (
              <a key={label} href="/terms" style={{ color: "#475569", fontSize: "0.8125rem", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
