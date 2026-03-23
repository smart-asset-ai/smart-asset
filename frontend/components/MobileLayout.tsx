"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { Home, Brain, FileText, MapPin, User } from "lucide-react";
import AIMascot from "@/components/AIMascot";

export const TABS = [
  { id: "home",      label: "ホーム",    icon: Home,     href: "/m" },
  { id: "diagnosis", label: "AI診断",    icon: Brain,    href: "/m/diagnosis" },
  { id: "cases",     label: "案件",      icon: FileText, href: "/m/cases" },
  { id: "map",       label: "マップ",    icon: MapPin,   href: "/m/map" },
  { id: "mypage",    label: "マイページ", icon: User,     href: "/m/mypage" },
];

export function MobileHeader({ title, sub }: { title?: string; sub?: string }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(242,242,247,0.97)", backdropFilter: "blur(12px)",
      padding: "12px 20px 8px",
      borderBottom: "0.5px solid rgba(0,0,0,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link href="/m" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", borderRadius: "8px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AIMascot size={26} animated bg1="#1e3a8a" bg2="#2563eb" />
          </div>
          {!title && <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a" }}>Smart Asset <span style={{ color: "#2563eb" }}>AI</span></span>}
        </Link>
        {title && (
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>{title}</div>
            {sub && <div style={{ fontSize: "11px", color: "#6b7280" }}>{sub}</div>}
          </div>
        )}
      </div>
    </header>
  );
}

export function BottomNav({ active }: { active: string }) {
  const [pressed, setPressed] = useState<string | null>(null);
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
      borderTop: "1px solid #e5e7eb",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: "56px", paddingBottom: "env(safe-area-inset-bottom, 0px)",
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
            <tab.icon style={{ width: "22px", height: "22px", color: isActive ? "#2563eb" : "#9ca3af", transition: "color 0.15s" }} />
            <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563eb" : "#9ca3af", transition: "color 0.15s" }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TapButton({
  children, onClick, href, color = "#2563eb", textColor = "white",
  outline = false, icon: Icon, fullWidth = false, small = false,
}: {
  children: React.ReactNode; onClick?: () => void; href?: string;
  color?: string; textColor?: string; outline?: boolean;
  icon?: React.ElementType; fullWidth?: boolean; small?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const baseStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    padding: small ? "10px 16px" : "14px 20px", borderRadius: small ? "10px" : "14px",
    fontWeight: 700, fontSize: small ? "0.875rem" : "1rem",
    border: outline ? `2px solid ${color}` : "none",
    background: outline ? "transparent" : color,
    color: outline ? color : textColor,
    textDecoration: "none", cursor: "pointer",
    width: fullWidth ? "100%" : "auto",
    transform: pressed ? "scale(0.95)" : "scale(1)",
    boxShadow: pressed ? "none" : outline ? "none" : `0 4px 16px ${color}55`,
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
  };
  const handlers = {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
  };
  if (href) return <Link href={href} style={baseStyle} {...handlers}>{Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}{children}</Link>;
  return <button style={baseStyle} onClick={onClick} {...handlers}>{Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}{children}</button>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

export function MobilePage({ children, active }: { children: React.ReactNode; active: string }) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const THRESHOLD = 72;

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) {
      setPulling(true);
      setPullY(Math.min(dy * 0.45, THRESHOLD));
    }
  };
  const onTouchEnd = () => {
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      setTimeout(() => window.location.reload(), 500);
    } else {
      setPulling(false);
      setPullY(0);
    }
    startY.current = 0;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ minHeight: "100vh", background: "#f2f2f7", paddingBottom: "72px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif", overscrollBehaviorY: "none" as any }}
    >
      {/* Pull indicator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: `${pullY}px`, overflow: "hidden",
        transition: pulling ? "none" : "height 0.3s ease",
        background: "#f2f2f7",
      }}>
        {pullY > 20 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              border: "2px solid #2563eb", borderTopColor: "transparent",
              animation: refreshing ? "spin 0.6s linear infinite" : "none",
              transform: refreshing ? "none" : `rotate(${(pullY / THRESHOLD) * 270}deg)`,
              transition: refreshing ? "none" : "transform 0.1s",
            }} />
            <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>
              {refreshing ? "更新中..." : pullY >= THRESHOLD ? "離して更新" : "引っ張って更新"}
            </span>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {children}
      <BottomNav active={active} />
    </div>
  );
}
