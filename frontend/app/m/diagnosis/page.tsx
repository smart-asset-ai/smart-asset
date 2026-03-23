"use client";
import { Brain, Camera, ArrowRight } from "lucide-react";
import { MobileHeader, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MDiagnosisPage() {
  return (
    <MobilePage active="diagnosis">
      <MobileHeader title="AI建物診断" sub="写真1枚で客観的に算出" />
      <div style={{ padding: "16px" }}>

        <Card style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Brain style={{ width: "32px", height: "32px", color: "white" }} />
          </div>
          <h1 style={{ color: "white", fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>AI建物診断（登録不要）</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
            スマホで建物を撮影するだけ。AIが劣化状態・修繕優先度・概算費用を数秒で分析します。
          </p>
          <TapButton href="/diagnosis" color="white" textColor="#7c3aed" icon={Camera} fullWidth>
            今すぐ診断を開始する
          </TapButton>
        </Card>

        <Card style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "12px" }}>診断でわかること</p>
          {[
            "外壁・屋根・防水の劣化状態をAIが判定",
            "修繕の緊急度を「要対応/注意/良好」で表示",
            "概算修繕費用の目安",
            "PDFレポートで保存・印刷",
          ].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <div style={{ width: "8px", height: "8px", background: "#7c3aed", borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#374151" }}>{t}</span>
            </div>
          ))}
        </Card>

        <TapButton href="/diagnosis" color="#7c3aed" icon={ArrowRight} fullWidth>
          診断ページへ（無料）
        </TapButton>
      </div>
    </MobilePage>
  );
}
