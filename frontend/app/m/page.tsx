"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Home, Brain, FileText, MapPin, User,
  ChevronRight, Shield, Zap, Star, FileCheck
} from "lucide-react";
import AIMascot from "@/components/AIMascot";

// ── タブバー ────────────────────────────────────────────
const TABS = [
  { id: "home",     label: "ホーム",   icon: Home,     href: "/m" },
  { id: "diagnosis",label: "AI診断",   icon: Brain,    href: "/m/diagnosis" },
  { id: "cases",    label: "案件",     icon: FileText, href: "/m/cases" },
  { id: "map",      label: "マップ",   icon: MapPin,   href: "/m/map" },
  { id: "mypage",   label: "マイページ",icon: User,     href: "/m/mypage" },
];

function BottomNav({ active }: { active: string }) {
  const [pressed, setPressed] = useState<string | null>(null);
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #e5e7eb",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: "56px",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        const isPressed = pressed === tab.id;
        return (
          <Link key={tab.id} href={tab.href}
            onPointerDown={() => setPressed(tab.id)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              padding: "6px 12px", borderRadius: "12px", textDecoration: "none",
              transform: isPressed ? "scale(0.88)" : "scale(1)",
              transition: "transform 0.1s ease",
              background: isPressed ? "#f0f0f0" : "transparent",
              minWidth: "52px",
            }}>
            <tab.icon style={{
              width: "22px", height: "22px",
              color: isActive ? "#2563eb" : "#9ca3af",
              transition: "color 0.15s",
            }} />
            <span style={{
              fontSize: "10px", fontWeight: isActive ? 700 : 500,
              color: isActive ? "#2563eb" : "#9ca3af",
              transition: "color 0.15s",
            }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── タップボタン（押した感あり）────────────────────────
function TapButton({
  children, onClick, href, color = "#2563eb", textColor = "white",
  outline = false, icon: Icon, fullWidth = false,
}: {
  children: React.ReactNode; onClick?: () => void; href?: string;
  color?: string; textColor?: string; outline?: boolean;
  icon?: React.ElementType; fullWidth?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const baseStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "0.5rem",
    padding: "14px 20px", borderRadius: "14px",
    fontWeight: 700, fontSize: "1rem",
    border: outline ? `2px solid ${color}` : "none",
    background: outline ? "transparent" : color,
    color: outline ? color : textColor,
    textDecoration: "none", cursor: "pointer",
    width: fullWidth ? "100%" : "auto",
    transform: pressed ? "scale(0.95)" : "scale(1)",
    boxShadow: pressed
      ? "none"
      : outline ? "none" : `0 4px 16px ${color}55`,
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
  };
  const handlers = {
    onPointerDown: () => setPressed(true),
    onPointerUp:   () => setPressed(false),
    onPointerLeave:() => setPressed(false),
  };
  if (href) return (
    <Link href={href} style={baseStyle} {...handlers}>
      {Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}
      {children}
    </Link>
  );
  return (
    <button style={baseStyle} onClick={onClick} {...handlers}>
      {Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}
      {children}
    </button>
  );
}

// ── カード ──────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "white", borderRadius: "18px",
      padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      border: "1px solid rgba(0,0,0,0.04)", ...style,
    }}>
      {children}
    </div>
  );
}

// ── メインページ ────────────────────────────────────────
export default function MobilePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", paddingBottom: "72px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif" }}>

      {/* ヘッダー */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(242,242,247,0.95)", backdropFilter: "blur(12px)",
        padding: "12px 20px 8px",
        borderBottom: "0.5px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AIMascot size={34} animated bg1="#1e3a8a" bg2="#2563eb" variant="light" style={{ borderRadius: "8px" }} />
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
            Smart Asset <span style={{ color: "#2563eb" }}>AI</span>
          </span>
          <div style={{ marginLeft: "auto", background: "#dcfce7", borderRadius: "9999px", padding: "3px 10px" }}>
            <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>登録無料</span>
          </div>
        </div>
      </header>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ヒーロー */}
        <Card style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", marginBottom: "16px" }}>
          <p style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.05em" }}>
            ⚡ 中間マージンゼロの修繕マッチング
          </p>
          <h1 style={{ color: "white", fontSize: "22px", fontWeight: 900, lineHeight: 1.3, marginBottom: "16px" }}>
            大規模修繕を改革。<br />
            <span style={{ color: "#93c5fd" }}>地元の職人と直接やりとり。</span>
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <TapButton href="/m/owners" color="white" textColor="#1e3a8a" icon={Home} fullWidth>
              オーナー様向け（無料）
            </TapButton>
            <TapButton href="/m/contractors" color="rgba(255,255,255,0.12)" textColor="white" outline={false} icon={undefined} fullWidth>
              🛠️ 施工会社様向け（無料）
            </TapButton>
          </div>
        </Card>

        {/* クイックアクション */}
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "10px", paddingLeft: "4px" }}>
          QUICK ACTIONS
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          {[
            { icon: Brain,      label: "AI診断",       sub: "写真1枚で分析",   color: "#7c3aed", bg: "#f5f3ff", href: "/diagnosis" },
            { icon: MapPin,     label: "業者を探す",   sub: "地図で検索",      color: "#2563eb", bg: "#eff6ff", href: "/owner/contractors" },
            { icon: FileText,   label: "案件を掲載",   sub: "2〜3タップで完了", color: "#16a34a", bg: "#f0fdf4", href: "/properties/new" },
            { icon: FileCheck,  label: "電子契約",     sub: "印紙税ゼロ",      color: "#7c3aed", bg: "#f5f3ff", href: "/stripe-info" },
            { icon: Star,       label: "知識ハブ",     sub: "修繕・法律・税金", color: "#d97706", bg: "#fffbeb", href: "/owner/knowledge" },
          ].map(item => {
            const [pressed, setPressed] = useState(false);
            return (
              <Link key={item.label} href={item.href}
                onPointerDown={() => setPressed(true)}
                onPointerUp={() => setPressed(false)}
                onPointerLeave={() => setPressed(false)}
                style={{
                  display: "flex", flexDirection: "column", gap: "8px",
                  background: "white", borderRadius: "16px",
                  padding: "16px", textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  transform: pressed ? "scale(0.94)" : "scale(1)",
                  transition: "transform 0.1s ease",
                  WebkitTapHighlightColor: "transparent",
                }}>
                <div style={{ width: "40px", height: "40px", background: item.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <item.icon style={{ width: "20px", height: "20px", color: item.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{item.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 安心ポイント */}
        <Card style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "12px" }}>WHY SMART ASSET AI?</p>
          {[
            { icon: Shield,     text: "オーナー登録・利用は無料", sub: "すべて無料（キャンペーン中）", color: "#16a34a" },
            { icon: Zap,        text: "中間マージンゼロ",         sub: "地元職人と直接つながる",       color: "#2563eb" },
            { icon: FileCheck,  text: "電子サイン契約",           sub: "印紙税ゼロ・法的有効",         color: "#7c3aed" },
            { icon: Star,       text: "AIスコアで業者を可視化",   sub: "信頼性を数値で確認",           color: "#d97706" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <div style={{ width: "36px", height: "36px", background: `${item.color}15`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon style={{ width: "18px", height: "18px", color: item.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#111827" }}>{item.text}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{item.sub}</div>
              </div>
              <ChevronRight style={{ width: "16px", height: "16px", color: "#d1d5db" }} />
            </div>
          ))}
        </Card>

      </div>

      <BottomNav active="home" />
    </div>
  );
}
