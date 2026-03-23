"use client";
import Link from "next/link";
import { ChevronRight, Brain, FileText, MapPin, Shield, Star, Clock, Zap } from "lucide-react";
import { MobileHeader, BottomNav, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MOwnersPage() {
  return (
    <MobilePage active="home">
      <MobileHeader title="オーナー様向け" sub="すべて無料（キャンペーン中）" />
      <div style={{ padding: "16px" }}>

        {/* Hero */}
        <Card style={{ background: "linear-gradient(135deg, #0d4f2e, #16a34a)", marginBottom: "16px" }}>
          <p style={{ color: "#86efac", fontSize: "11px", fontWeight: 700, marginBottom: "8px" }}>オーナー様向け ― 登録無料</p>
          <h1 style={{ color: "white", fontSize: "20px", fontWeight: 900, lineHeight: 1.35, marginBottom: "14px" }}>
            地元の職人に、直接。<br /><span style={{ color: "#86efac" }}>大手に頼まなくていい。</span>
          </h1>
          <TapButton href="/owner/register" color="white" textColor="#15803d" icon={undefined} fullWidth>
            無料でオーナー登録する →
          </TapButton>
        </Card>

        {/* 3ステップ */}
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "10px", paddingLeft: "4px" }}>HOW IT WORKS</p>
        {[
          { num: "01", icon: Brain,    title: "AI建物診断（無料）",    desc: "写真1枚で劣化状態・修繕費用を分析",  href: "/diagnosis",         color: "#7c3aed", bg: "#f5f3ff" },
          { num: "02", icon: FileText, title: "修繕案件を掲載（無料）", desc: "住所・修繕内容を入力するだけ",         href: "/properties/new",    color: "#16a34a", bg: "#f0fdf4" },
          { num: "03", icon: MapPin,   title: "業者を比較・選定（無料）",desc: "AIスコア順に地図で表示",             href: "/owner/contractors", color: "#2563eb", bg: "#eff6ff" },
        ].map(s => (
          <Link key={s.num} href={s.href} style={{ display: "flex", alignItems: "center", gap: "14px", background: "white", borderRadius: "16px", padding: "16px", marginBottom: "10px", textDecoration: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#d1d5db" }}>{s.num}</div>
              <div style={{ width: "38px", height: "38px", background: s.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 0" }}>
                <s.icon style={{ width: "18px", height: "18px", color: s.color }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827", marginBottom: "2px" }}>{s.title}</div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>{s.desc}</div>
            </div>
            <ChevronRight style={{ width: "16px", height: "16px", color: "#d1d5db", flexShrink: 0 }} />
          </Link>
        ))}

        {/* 安心ポイント */}
        <Card style={{ marginTop: "6px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "12px" }}>安心ポイント</p>
          {[
            { icon: Shield, text: "AIスコアで業者を可視化",   color: "#16a34a" },
            { icon: Shield, text: "個人情報は暗号化保護",      color: "#2563eb" },
            { icon: Star,   text: "口コミ評価で品質保証",      color: "#d97706" },
            { icon: Clock,  text: "いつでも取り下げ可能",      color: "#7c3aed" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <div style={{ width: "32px", height: "32px", background: `${item.color}15`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon style={{ width: "16px", height: "16px", color: item.color }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "#374151" }}>{item.text}</span>
            </div>
          ))}
        </Card>

      </div>
    </MobilePage>
  );
}
