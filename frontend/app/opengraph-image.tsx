import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Smart Asset AI | 地元の職人と直接つながる修繕プラットフォーム";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f2e 0%, #0f2666 50%, #1e3a8a 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px", display: "flex" }} />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: "28px", fontWeight: 900 }}>AI</span>
          </div>
          <span style={{ color: "white", fontSize: "32px", fontWeight: 800 }}>Smart Asset AI</span>
        </div>

        {/* Main headline */}
        <h1 style={{ color: "white", fontSize: "64px", fontWeight: 900, lineHeight: 1.15, margin: "0 0 24px", maxWidth: "800px" }}>
          地元の職人と、<br />
          <span style={{ color: "#60a5fa" }}>直接つながる。</span>
        </h1>

        {/* Subtext */}
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "28px", margin: "0 0 48px", lineHeight: 1.5, maxWidth: "700px" }}>
          外壁塗装・屋根修繕・防水工事。1000万円以下の小規模修繕に特化。オーナー無料・AI診断付き。
        </p>

        {/* Badges */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "🏠 オーナー登録から利用は無料", bg: "#166534", border: "#16a34a" },
            { label: "🔨 地元職人と直接契約", bg: "#1e3a8a", border: "#2563eb" },
            { label: "🤖 99% AI運営", bg: "#4c1d95", border: "#7c3aed" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: "50px", padding: "12px 24px", color: "white", fontSize: "20px", fontWeight: 700, display: "flex" }}>
              {b.label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: "48px", right: "80px", color: "rgba(255,255,255,0.4)", fontSize: "20px", display: "flex" }}>
          smart-asset.ai
        </div>
      </div>
    ),
    { ...size }
  );
}
