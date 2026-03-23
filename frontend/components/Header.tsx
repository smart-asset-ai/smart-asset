"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";
import {
  Menu, X, LogOut, User as UserIcon, Home, Wrench, Stethoscope,
  Building2, MapPin, FileText, BookOpen, ChevronDown, Shield,
  Brain, Plus, HardHat, Star, BarChart3, Settings, Newspaper, TrendingUp, Landmark, LineChart
} from "lucide-react";
import AIMascot from "@/components/AIMascot";

const OWNER_LINKS = [
  { href: "/owners", label: "オーナー向けトップ", icon: Home, desc: "サービス概要・料金", accent: "#16a34a" },
  { href: "/diagnosis", label: "AI建物診断（無料）", icon: Brain, desc: "写真1枚で劣化分析", accent: "#7c3aed" },
  { href: "/properties/new", label: "修繕案件を掲載", icon: Plus, desc: "スマホで2〜3タップ", accent: "#16a34a" },
  { href: "/owner/contractors", label: "業者マップ検索", icon: MapPin, desc: "地元業者を地図で検索", accent: "#2563eb" },
  { href: "/owner/knowledge", label: "知識ハブ", icon: BookOpen, desc: "修繕・法律・税金など", accent: "#d97706" },
];

const CONTRACTOR_LINKS = [
  { href: "/contractors", label: "業者向けトップ", icon: HardHat, desc: "プラン・登録案内", accent: "#2563eb" },
  { href: "/contractors/register", label: "無料で業者登録", icon: Plus, desc: "審査後すぐ掲載開始", accent: "#16a34a" },
  { href: "/owner/contractors", label: "業者一覧を確認", icon: MapPin, desc: "現在掲載中の業者", accent: "#7c3aed" },
];

const BLOG_LINKS = [
  { href: "/blog", label: "全記事一覧", icon: Newspaper, desc: "最新の不動産情報", accent: "#2563eb" },
  { href: "/blog/repair", label: "修繕・リフォーム", icon: Settings, desc: "費用節約・業者選び", accent: "#16a34a" },
  { href: "/blog/investment", label: "不動産投資", icon: TrendingUp, desc: "利回り・物件選び", accent: "#7c3aed" },
  { href: "/blog/management", label: "物件管理", icon: Building2, desc: "効率化・コスト削減", accent: "#d97706" },
  { href: "/blog/market", label: "市場動向", icon: LineChart, desc: "最新トレンド分析", accent: "#dc2626" },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mypageHref, setMypageHref] = useState("/mypage");
  const [userRole, setUserRole] = useState<"owner" | "contractor" | null>(null);
  const [dropdown, setDropdown] = useState<"owner" | "contractor" | "blog" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function resolveMypage(u: User) {
    const { data: op } = await supabase.from("owner_profiles").select("user_id").eq("user_id", u.id).maybeSingle();
    if (op) { setMypageHref("/owner/mypage"); setUserRole("owner"); return; }
    const { data: cs } = await supabase.from("contractors").select("id").eq("email", u.email ?? "").maybeSingle();
    if (cs) { setMypageHref("/contractor/mypage"); setUserRole("contractor"); return; }
    setMypageHref("/owner/mypage"); setUserRole(null);
  }

  useEffect(() => {
    const handleOpenAuth = () => setShowAuth(true);
    document.addEventListener("open-auth-modal", handleOpenAuth);
    return () => document.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) resolveMypage(u);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) resolveMypage(u);
      else { setMypageHref("/mypage"); setUserRole(null); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "3.5rem", gap: "1rem" }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 }}>
              <AIMascot size={34} animated={true} variant="light" style={{ borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0 }} />
              <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a", letterSpacing: "-0.01em" }}>
                Smart Asset <span style={{ color: "#2563eb" }}>AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav ref={dropdownRef} style={{ display: "flex", alignItems: "center", gap: "0.125rem", flex: 1, justifyContent: "center", position: "relative" }}
              className="desktop-nav">

              {/* AI診断 */}
              <Link href="/diagnosis" style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#7c3aed"; (e.currentTarget as HTMLAnchorElement).style.background = "#f5f3ff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#374151"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
                <Stethoscope style={{ width: "0.875rem", height: "0.875rem", color: "#7c3aed" }} />
                AI診断
              </Link>

              {/* オーナー dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdown(dropdown === "owner" ? null : "owner")}
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", background: dropdown === "owner" ? "#f0fdf4" : "transparent", border: "none", color: dropdown === "owner" ? "#16a34a" : "#374151", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                  <Home style={{ width: "0.875rem", height: "0.875rem", color: "#16a34a" }} />
                  オーナー
                  <ChevronDown style={{ width: "0.75rem", height: "0.75rem", transform: dropdown === "owner" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {dropdown === "owner" && (
                  <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #e5e7eb", padding: "0.5rem", minWidth: "260px", zIndex: 100 }}>
                    {OWNER_LINKS.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.625rem", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 業者 dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdown(dropdown === "contractor" ? null : "contractor")}
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", background: dropdown === "contractor" ? "#eff6ff" : "transparent", border: "none", color: dropdown === "contractor" ? "#2563eb" : "#374151", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                  <Wrench style={{ width: "0.875rem", height: "0.875rem", color: "#2563eb" }} />
                  施工会社
                  <ChevronDown style={{ width: "0.75rem", height: "0.75rem", transform: dropdown === "contractor" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {dropdown === "contractor" && (
                  <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #e5e7eb", padding: "0.5rem", minWidth: "240px", zIndex: 100 }}>
                    {CONTRACTOR_LINKS.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.625rem", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 知識ハブ */}
              <Link href="/owner/knowledge" style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#d97706"; (e.currentTarget as HTMLAnchorElement).style.background = "#fffbeb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#374151"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
                <BookOpen style={{ width: "0.875rem", height: "0.875rem", color: "#d97706" }} />
                知識ハブ
              </Link>

              {/* 記事・情報 dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdown(dropdown === "blog" ? null : "blog")}
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", background: dropdown === "blog" ? "#eff6ff" : "transparent", border: "none", color: dropdown === "blog" ? "#2563eb" : "#374151", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                  <Newspaper style={{ width: "0.875rem", height: "0.875rem", color: "#2563eb" }} />
                  記事・情報
                  <ChevronDown style={{ width: "0.75rem", height: "0.75rem", transform: dropdown === "blog" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {dropdown === "blog" && (
                  <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #e5e7eb", padding: "0.5rem", minWidth: "280px", zIndex: 100 }}>
                    {BLOG_LINKS.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.625rem", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
              {user ? (
                <>
                  <Link href={mypageHref}
                    style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4375rem 0.875rem", borderRadius: "0.625rem", background: userRole === "contractor" ? "#eff6ff" : "#f0fdf4", border: `1px solid ${userRole === "contractor" ? "#bfdbfe" : "#bbf7d0"}`, color: userRole === "contractor" ? "#1d4ed8" : "#15803d", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                    <UserIcon style={{ width: "0.875rem", height: "0.875rem" }} />
                    <span className="desktop-label">マイページ</span>
                  </Link>
                  <button onClick={handleSignOut}
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4375rem 0.625rem", borderRadius: "0.625rem", background: "#f9fafb", border: "1px solid #e5e7eb", color: "#9ca3af", fontSize: "0.8125rem", cursor: "pointer" }}>
                    <LogOut style={{ width: "0.875rem", height: "0.875rem" }} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuth(true)}
                    style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.625rem", background: "white", border: "1px solid #d1d5db", color: "#374151", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
                    className="desktop-label">
                    ログイン
                  </button>
                  <button onClick={() => setShowAuth(true)}
                    style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.625rem", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", color: "white", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                    無料登録
                  </button>
                </>
              )}

              {/* Hamburger */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: "none", alignItems: "center", background: menuOpen ? "#f1f5f9" : "transparent", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.375rem", color: "#374151", cursor: "pointer" }}
                className="mobile-menu-btn">
                {menuOpen ? <X style={{ width: "1.25rem", height: "1.25rem" }} /> : <Menu style={{ width: "1.25rem", height: "1.25rem" }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: "white", borderTop: "1px solid #f1f5f9", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0.75rem 1.25rem 1.5rem" }}>

              {/* オーナー section */}
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#16a34a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", padding: "0 0.5rem" }}>🏠 オーナー向け</p>
                {OWNER_LINKS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.5rem", borderRadius: "0.625rem", textDecoration: "none", marginBottom: "0.125rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 業者 section */}
              <div style={{ marginBottom: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", padding: "0 0.5rem" }}>🔨 施工会社向け</p>
                {CONTRACTOR_LINKS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.5rem", borderRadius: "0.625rem", textDecoration: "none", marginBottom: "0.125rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 記事・情報 section */}
              <div style={{ marginBottom: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", padding: "0 0.5rem" }}>📰 記事・情報</p>
                {BLOG_LINKS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.5rem", borderRadius: "0.625rem", textDecoration: "none", marginBottom: "0.125rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${item.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: "0.875rem", height: "0.875rem", color: item.accent }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{item.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Auth buttons */}
              <div style={{ paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {user ? (
                  <>
                    <Link href={mypageHref} onClick={() => setMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1rem", background: "#f0fdf4", borderRadius: "0.875rem", color: "#15803d", fontWeight: 700, textDecoration: "none", fontSize: "0.9375rem" }}>
                      <UserIcon style={{ width: "1rem", height: "1rem" }} /> マイページ
                    </Link>
                    <button onClick={handleSignOut}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "none", border: "1px solid #fecaca", borderRadius: "0.875rem", color: "#ef4444", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
                      <LogOut style={{ width: "0.875rem", height: "0.875rem" }} /> ログアウト
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                      style={{ flex: 1, padding: "0.875rem", borderRadius: "0.875rem", background: "white", border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9375rem" }}>
                      ログイン
                    </button>
                    <button onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                      style={{ flex: 1, padding: "0.875rem", borderRadius: "0.875rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9375rem" }}>
                      無料登録
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-label { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
