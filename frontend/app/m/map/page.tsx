"use client";
import { MapPin, ArrowRight } from "lucide-react";
import { MobileHeader, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MMapPage() {
  return (
    <MobilePage active="map">
      <MobileHeader title="業者マップ" sub="地元の施工会社を検索" />
      <div style={{ padding: "16px" }}>

        <Card style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", marginBottom: "16px", textAlign: "center" }}>
          <MapPin style={{ width: "36px", height: "36px", color: "white", margin: "0 auto 12px" }} />
          <h1 style={{ color: "white", fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}>地図で施工会社を検索</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
            現在地から近い順にAIスコア付きで表示。工種・ランクで絞り込めます。
          </p>
          <TapButton href="/owner/contractors" color="white" textColor="#1e3a8a" icon={MapPin} fullWidth>
            業者マップを開く
          </TapButton>
        </Card>

        <Card>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "12px" }}>絞り込み可能な条件</p>
          {["外壁塗装", "屋根修繕", "防水工事", "鉄部塗装", "内装リフォーム"].map(t => (
            <div key={t} style={{ display: "inline-block", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "9999px", margin: "4px 4px 0 0" }}>{t}</div>
          ))}
        </Card>
      </div>
    </MobilePage>
  );
}
