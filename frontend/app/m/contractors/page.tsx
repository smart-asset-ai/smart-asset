"use client";
import Link from "next/link";
import { ChevronRight, HardHat, BarChart3, MapPin, Star } from "lucide-react";
import { MobileHeader, BottomNav, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MContractorsPage() {
  return (
    <MobilePage active="home">
      <MobileHeader title="施工会社様向け" sub="無料登録で地図に掲載" />
      <div style={{ padding: "16px" }}>

        <Card style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", marginBottom: "16px" }}>
          <p style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 700, marginBottom: "8px" }}>施工会社様向け</p>
          <h1 style={{ color: "white", fontSize: "20px", fontWeight: 900, lineHeight: 1.35, marginBottom: "14px" }}>
            AIスコアで信頼を証明。<br /><span style={{ color: "#93c5fd" }}>新規案件を継続獲得。</span>
          </h1>
          <TapButton href="/contractors/register" color="white" textColor="#1e3a8a" icon={HardHat} fullWidth>
            無料で会社登録する →
          </TapButton>
        </Card>

        <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "10px", paddingLeft: "4px" }}>HOW IT WORKS</p>
        {[
          { num: "01", icon: HardHat,   title: "無料で会社登録",       desc: "メールアドレスだけで登録開始",      href: "/contractors/register", color: "#2563eb", bg: "#eff6ff" },
          { num: "02", icon: BarChart3, title: "AIスコアでランクUP",   desc: "写真・実績を追加するほど上位表示",  href: "/contractors",          color: "#7c3aed", bg: "#f5f3ff" },
          { num: "03", icon: MapPin,    title: "案件に応募",            desc: "有料プランで応募数制限なし",        href: "/contractors",          color: "#16a34a", bg: "#f0fdf4" },
          { num: "04", icon: Star,      title: "評価を積み上げる",      desc: "高評価でランクが上がる",            href: "/contractors",          color: "#d97706", bg: "#fffbeb" },
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

        <Card style={{ marginTop: "6px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>プラン比較</p>
          {[
            { plan: "無料プラン", price: "¥0", desc: "地図掲載・プロフィール公開", color: "#6b7280" },
            { plan: "有料プラン",     price: "無料", desc: "案件応募・優先表示",    color: "#2563eb" },
            { plan: "",     price: "無料",   desc: "最上位表示・写真5枚",  color: "#7c3aed" },
          ].map(p => (
            <div key={p.plan} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "13px", color: p.color }}>{p.plan}</span>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{p.desc}</div>
              </div>
              <span style={{ fontWeight: 800, fontSize: "14px", color: "#111827" }}>{p.price}</span>
            </div>
          ))}
        </Card>

      </div>
    </MobilePage>
  );
}
