"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Home, Brain, FileText, Plus, MapPin, Calendar, Loader2, LogIn,
  Building2, ArrowRight, Clock, CheckCircle, Search, Trash2,
  Shield, AlertTriangle, BookOpen, Wrench, ChevronDown, ChevronUp,
  Star, TrendingUp, HardHat, MessageSquare, Download, BarChart2,
  FolderOpen, History, Bell, FileCheck
} from "lucide-react";
import AIMascot from "@/components/AIMascot";

interface ProjectRoom {
  id: string;
  status: string;
  property_address: string;
  contractor_company_name: string;
  updated_at: string;
}

interface RepairHistory {
  id: string;
  room_id: string;
  work_type: string;
  contractor_name: string;
  property_address: string;
  amount: number | null;
  completed_at: string;
  next_inspection_years: number;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
}

const ROOM_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  chatting:           { label: "チャット中",    color: "#1d4ed8", bg: "#eff6ff" },
  estimate_uploaded:  { label: "見積書届いた",  color: "#d97706", bg: "#fffbeb" },
  estimate_approved:  { label: "見積承認済み",  color: "#059669", bg: "#ecfdf5" },
  contract_signed:    { label: "契約締結",      color: "#7c3aed", bg: "#f5f3ff" },
  in_progress:        { label: "工事中",        color: "#0891b2", bg: "#ecfeff" },
  completed_requested:{ label: "完了報告あり",  color: "#ea580c", bg: "#fff7ed" },
  completed:          { label: "完了確認済み",  color: "#16a34a", bg: "#f0fdf4" },
  invoiced:           { label: "請求書届いた",  color: "#db2777", bg: "#fdf2f8" },
  invoice_approved:   { label: "支払い完了",    color: "#16a34a", bg: "#f0fdf4" },
  closed:             { label: "クローズ",      color: "#6b7280", bg: "#f9fafb" },
};

interface Property {
  id: string;
  address: string;
  property_type: string;
  building_age?: number;
  last_repair_year?: number;
  current_issues?: string;
  created_at: string;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment_rent: "賃貸マンション🏬",
  apartment_own: "分譲マンション🏢",
  apartment: "アパート🏠",
  house: "戸建🏡",
  other: "その他🏗️",
};

function getUrgencyLabel(lastRepairYear?: number) {
  if (!lastRepairYear) return { label: "未確認", bg: "#f3f4f6", color: "#6b7280" };
  const years = new Date().getFullYear() - lastRepairYear;
  if (years >= 7) return { label: "要検討（7年以上）", bg: "#fee2e2", color: "#dc2626" };
  if (years >= 5) return { label: "注意（5〜7年）", bg: "#fef3c7", color: "#92400e" };
  if (years >= 3) return { label: "様子見（3〜5年）", bg: "#dcfce7", color: "#166534" };
  return { label: "良好（3年以内）", bg: "#f0fdf4", color: "#15803d" };
}

const REPAIR_PLAN = [
  { year: "1〜3年", items: "外壁・屋根の点検、シーリング補修", cost: "50〜100万円" },
  { year: "5〜7年", items: "外壁塗装、防水補修", cost: "100〜300万円" },
  { year: "10〜12年", items: "大規模修繕（外壁・共用部）", cost: "300〜800万円" },
  { year: "15〜20年", items: "設備更新、エレベーター点検", cost: "200〜500万円" },
];

const KNOWLEDGE_ITEMS = [
  { icon: Wrench, title: "外壁塗装の相場と業者選び", href: "/owner/knowledge#gaiheki", color: "#2563eb", bg: "#eff6ff" },
  { icon: Home, title: "屋根修繕 完全ガイド", href: "/owner/knowledge#yane", color: "#16a34a", bg: "#f0fdf4" },
  { icon: Shield, title: "悪質業者を見分ける方法", href: "/owner/knowledge#scam", color: "#dc2626", bg: "#fef2f2" },
  { icon: FileText, title: "工事契約書の正しい読み方", href: "/owner/knowledge#contract", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: TrendingUp, title: "修繕積立金の積み立て方", href: "/owner/knowledge#savings", color: "#d97706", bg: "#fffbeb" },
  { icon: BookOpen, title: "長期修繕計画の作り方", href: "/owner/knowledge#plan", color: "#0891b2", bg: "#ecfeff" },
];

// 工種別推奨点検年数
const INSPECTION_YEARS: Record<string, number> = {
  "外壁塗装": 8, "屋根": 12, "防水": 10, "給排水": 18, "外構": 12,
};

type MainTab = "projects" | "history" | "documents" | "report";

export default function OwnerMypagePage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("projects");
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUserEmail(u?.email ?? null);
      setUserId(u?.id ?? null);
      setLoading(false);
      if (u?.id) {
        fetchProperties(u.id);
        fetchProjectRooms(u.id);
        fetchRepairHistory(u.id);
      }
    });
  }, []);

  const fetchProjectRooms = async (ownerId: string) => {
    setRoomsLoading(true);
    try {
      const { data } = await supabase
        .from("project_rooms")
        .select("id, status, property_address, contractor_company_name, updated_at")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false });
      setProjectRooms(Array.isArray(data) ? data : []);
    } catch { /* table may not exist yet */ }
    finally { setRoomsLoading(false); }
  };

  const fetchProperties = async (ownerId: string) => {
    setPropertiesLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const res = await fetch(`${API_URL}/api/properties/owner/${ownerId}`);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : data.properties ?? []);
    } catch { /* silently fail */ }
    finally { setPropertiesLoading(false); }
  };

  const fetchRepairHistory = async (ownerId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/repair-history?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setRepairHistory(Array.isArray(data) ? data : []);
      }
    } catch { /* silently fail */ }
    finally { setHistoryLoading(false); }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("この物件をマップから削除しますか？")) return;
    setDeletingId(propertyId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const res = await fetch(`${API_URL}/api/properties/${propertyId}`, { method: "DELETE" });
      if (res.ok) setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch { alert("削除に失敗しました。もう一度お試しください。"); }
    finally { setDeletingId(null); }
  };

  // CSV ダウンロード
  const downloadCSV = () => {
    const header = "完了日,物件住所,工種,施工会社,金額(税込),メモ";
    const rows = repairHistory.map(h =>
      [
        h.completed_at,
        `"${h.property_address ?? ""}"`,
        `"${h.work_type ?? ""}"`,
        `"${h.contractor_name ?? ""}"`,
        h.amount != null ? h.amount : "",
        `"${h.notes ?? ""}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repair_report_${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // アラートバナー: 次回点検が近い修繕履歴
  const alertItems = repairHistory.filter(h => {
    if (!h.completed_at) return false;
    const completed = new Date(h.completed_at);
    const threshold = new Date(completed.getTime() + h.next_inspection_years * 0.75 * 365 * 24 * 3600 * 1000);
    return threshold < new Date();
  });

  // 年別修繕費グラフデータ
  const yearlyData = repairHistory.reduce<Record<string, number>>((acc, h) => {
    if (!h.completed_at || !h.amount) return acc;
    const year = h.completed_at.slice(0, 4);
    acc[year] = (acc[year] ?? 0) + h.amount;
    return acc;
  }, {});
  const years = Object.keys(yearlyData).sort();
  const maxAmt = Math.max(1, ...Object.values(yearlyData));

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#16a34a" }} />
    </div>
  );

  if (!userEmail || !userId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "2.5rem", maxWidth: "28rem", width: "100%", textAlign: "center" }}>
        <div style={{ width: "4rem", height: "4rem", borderRadius: "9999px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <LogIn style={{ width: "2rem", height: "2rem", color: "#16a34a" }} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>ログインが必要です</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>オーナー様マイページをご利用いただくにはログインが必要です。</p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#16a34a", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.75rem 1.5rem", textDecoration: "none" }}>
          トップページでログイン
        </Link>
      </div>
    </div>
  );

  const col2 = isMobile ? "1fr" : "1fr 1fr";
  const col4 = isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const col3 = isMobile ? "1fr" : "repeat(3, 1fr)";

  const TAB_ITEMS: { key: MainTab; icon: React.ElementType; label: string }[] = [
    { key: "projects",  icon: MessageSquare, label: "進行中" },
    { key: "history",   icon: History,       label: "修繕履歴" },
    { key: "documents", icon: FolderOpen,    label: "書類保管庫" },
    { key: "report",    icon: BarChart2,     label: "費用レポート" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0d4f2e 0%, #15803d 60%, #16a34a 100%)", paddingTop: "5rem", paddingBottom: "2.5rem" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <AIMascot size={52} animated bg1="#0d4f2e" bg2="#15803d" />
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.15)", borderRadius: "9999px", padding: "0.25rem 0.75rem", marginBottom: "0.375rem" }}>
                <CheckCircle style={{ width: "0.75rem", height: "0.75rem", color: "#86efac" }} />
                <span style={{ color: "#86efac", fontSize: "0.75rem", fontWeight: 700 }}>オーナー認証済み</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)", fontWeight: 900, color: "white", lineHeight: 1.2 }}>オーナーマイページ</h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{userEmail}</p>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: col4, gap: "0.75rem", marginTop: "1.75rem" }}>
            {[
              { value: String(properties.length), label: "登録物件", color: "#86efac" },
              { value: String(repairHistory.length), label: "修繕履歴", color: "#6ee7b7" },
              { value: "無料", label: "ご利用料金", color: "#a5f3fc" },
              { value: "電子", label: "サイン契約", color: "#fde68a" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.875rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)", marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 次回点検アラートバナー */}
      {alertItems.length > 0 && (
        <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a" }}>
          <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "0.875rem 1.5rem" }}>
            {alertItems.map(h => {
              const inspYears = INSPECTION_YEARS[h.work_type] ?? h.next_inspection_years;
              const elapsed = Math.floor((Date.now() - new Date(h.completed_at).getTime()) / (365 * 24 * 3600 * 1000));
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", marginBottom: "0.375rem" }}>
                  <Bell style={{ width: "1rem", height: "1rem", color: "#d97706", flexShrink: 0, marginTop: "0.125rem" }} />
                  <p style={{ fontSize: "0.8125rem", color: "#713f12", lineHeight: 1.6 }}>
                    <strong>{h.property_address || "物件"}</strong> の <strong>{h.work_type}</strong> から <strong>{elapsed}年</strong> が経過しました。
                    一般的に {inspYears}年 が再修繕の目安です。
                    {" "}<Link href="/diagnosis" style={{ color: "#d97706", fontWeight: 700 }}>AI診断を受ける →</Link>
                    {" "}<Link href="/owner/contractors" style={{ color: "#d97706", fontWeight: 700 }}>業者を探す →</Link>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div style={{ background: "#fffbeb", borderTop: alertItems.length > 0 ? "none" : "1px solid #fde68a", borderBottom: "1px solid #fde68a" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "0.875rem 1.5rem", display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
          <AlertTriangle style={{ width: "1rem", height: "1rem", color: "#d97706", flexShrink: 0, marginTop: "0.125rem" }} />
          <p style={{ fontSize: "0.8125rem", color: "#713f12", lineHeight: 1.7 }}>
            当サービスはオーナーと施工会社をつなぐ情報提供プラットフォームです。工事代金は必ず<strong>着工金30%→中間金→完成払い</strong>の分割払いを推奨します。
            全額前払いは絶対に避けてください。
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* クイックアクション */}
        <div style={{ display: "grid", gridTemplateColumns: col4, gap: "0.75rem", marginBottom: "2rem" }}>
          {[
            { href: "/diagnosis", icon: Brain, label: "AI診断", desc: "建物を診断", iconBg: "#f3e8ff", iconColor: "#7c3aed", border: "#e9d5ff" },
            { href: "/properties/new", icon: Plus, label: "案件投稿", desc: "修繕を掲載", iconBg: "#dcfce7", iconColor: "#16a34a", border: "#bbf7d0" },
            { href: "/owner/contractors", icon: HardHat, label: "業者を探す", desc: "マップで検索", iconBg: "#dbeafe", iconColor: "#2563eb", border: "#bfdbfe" },
            { href: "/properties", icon: FileText, label: "案件一覧", desc: "掲載中の案件", iconBg: "#ffedd5", iconColor: "#ea580c", border: "#fed7aa" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1rem 0.75rem", background: "white", borderRadius: "1rem", border: `1px solid ${item.border}`, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.icon style={{ width: "1.25rem", height: "1.25rem", color: item.iconColor }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>{item.label}</div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* メインタブ */}
        <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem", overflow: "hidden" }}>
          {/* タブヘッダー */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
            {TAB_ITEMS.map(t => (
              <button key={t.key} onClick={() => setMainTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.875rem 1.25rem", border: "none", background: "none",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontWeight: mainTab === t.key ? 700 : 500,
                  color: mainTab === t.key ? "#16a34a" : "#6b7280",
                  borderBottom: mainTab === t.key ? "2px solid #16a34a" : "2px solid transparent",
                  fontSize: "0.875rem",
                }}>
                <t.icon style={{ width: "1rem", height: "1rem" }} />
                {t.label}
              </button>
            ))}
          </div>

          {/* タブ: 進行中案件 */}
          {mainTab === "projects" && (
            <div style={{ padding: "1.5rem" }}>
              {roomsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
                  <Loader2 className="animate-spin" style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a" }} />
                </div>
              ) : projectRooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <MessageSquare style={{ width: "2.25rem", height: "2.25rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 }}>現在進行中の案件はありません。<br />業者を探して案件を開始しましょう。</p>
                  <Link href="/owner/contractors" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "0.875rem", background: "#16a34a", color: "white", padding: "0.5rem 1.125rem", borderRadius: "0.625rem", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
                    業者を探す <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {projectRooms.map(room => {
                    const si = ROOM_STATUS_LABELS[room.status] ?? ROOM_STATUS_LABELS.chatting;
                    return (
                      <Link key={room.id} href={`/owner/projects/${room.id}`} style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #f1f5f9", padding: "0.875rem 1rem", textDecoration: "none" }}>
                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <MessageSquare style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {room.contractor_company_name || "施工会社"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "0.125rem" }}>
                            {room.property_address || "物件情報"}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                          <span style={{ background: si.bg, color: si.color, borderRadius: "9999px", padding: "0.2rem 0.625rem", fontSize: "0.7rem", fontWeight: 700, border: `1px solid ${si.color}30` }}>
                            {si.label}
                          </span>
                          <ArrowRight style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* タブ: 修繕履歴 */}
          {mainTab === "history" && (
            <div style={{ padding: "1.5rem" }}>
              {historyLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
                  <Loader2 className="animate-spin" style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a" }} />
                </div>
              ) : repairHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <History style={{ width: "2.25rem", height: "2.25rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 }}>
                    まだ修繕履歴がありません。<br />工事が完了すると自動的にここに記録されます。
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {repairHistory.map(h => (
                    <div key={h.id} style={{ background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #e5e7eb", padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #bbf7d0" }}>
                              {h.work_type || "修繕工事"}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                              {h.completed_at ? new Date(h.completed_at).toLocaleDateString("ja-JP") : "—"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>
                            {h.contractor_name || "施工会社"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                            <MapPin style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.property_address || "—"}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {h.amount != null && (
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
                              ¥{h.amount.toLocaleString("ja-JP")}
                            </div>
                          )}
                          {h.room_id && (
                            <Link href={`/owner/projects/${h.room_id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#2563eb", textDecoration: "none", marginTop: "0.375rem" }}>
                              詳細 <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* タブ: 書類保管庫 */}
          {mainTab === "documents" && (
            <div style={{ padding: "1.5rem" }}>
              {repairHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <FolderOpen style={{ width: "2.25rem", height: "2.25rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>書類がまだありません。工事完了後に契約書・請求書が保存されます。</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {repairHistory.filter(h => h.pdf_url).map(h => (
                    <div key={h.id} style={{ background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #e5e7eb", padding: "1rem" }}>
                      <div style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                        {h.completed_at ? new Date(h.completed_at).toLocaleDateString("ja-JP") : "—"} ・ {h.property_address || "物件"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {h.pdf_url && (
                          <a href={h.pdf_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                            <FileCheck style={{ width: "0.875rem", height: "0.875rem" }} />
                            工事請負契約書（電子署名済み）
                            <Download style={{ width: "0.75rem", height: "0.75rem" }} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {repairHistory.filter(h => !h.pdf_url).length > 0 && (
                    <p style={{ fontSize: "0.8125rem", color: "#9ca3af", textAlign: "center" }}>
                      ※ 電子署名が完了した契約書のみ表示されます
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* タブ: 費用レポート */}
          {mainTab === "report" && (
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "#111827", fontSize: "1rem" }}>年別修繕費</h3>
                <button onClick={downloadCSV}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                  <Download style={{ width: "0.875rem", height: "0.875rem" }} />
                  CSVダウンロード
                </button>
              </div>

              {years.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <BarChart2 style={{ width: "2.25rem", height: "2.25rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>まだデータがありません。工事完了後に費用が集計されます。</p>
                </div>
              ) : (
                <>
                  {/* SVG 棒グラフ */}
                  <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.25rem", overflowX: "auto" }}>
                    <svg width={Math.max(years.length * 80, 300)} height={180} style={{ display: "block", minWidth: "100%" }}>
                      {years.map((yr, i) => {
                        const amt = yearlyData[yr];
                        const barH = Math.max(4, Math.round((amt / maxAmt) * 130));
                        const x = i * 80 + 20;
                        const y = 140 - barH;
                        return (
                          <g key={yr}>
                            <rect x={x} y={y} width={48} height={barH} rx={6} fill="#16a34a" opacity={0.85} />
                            <text x={x + 24} y={y - 6} textAnchor="middle" fontSize={10} fill="#374151">
                              {amt >= 10000 ? `¥${Math.round(amt / 10000)}万` : `¥${(amt / 1000).toFixed(0)}k`}
                            </text>
                            <text x={x + 24} y={158} textAnchor="middle" fontSize={11} fill="#6b7280">{yr}</text>
                          </g>
                        );
                      })}
                      <line x1={0} y1={142} x2={years.length * 80 + 20} y2={142} stroke="#e5e7eb" strokeWidth={1} />
                    </svg>
                  </div>

                  {/* 物件別内訳 */}
                  <h4 style={{ fontWeight: 700, color: "#374151", fontSize: "0.875rem", marginBottom: "0.75rem" }}>物件別内訳</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {repairHistory.map(h => (
                      <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", background: "#f8fafc", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid #e5e7eb" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {h.work_type || "修繕工事"} — {h.contractor_name || "施工会社"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            {h.completed_at ? new Date(h.completed_at).toLocaleDateString("ja-JP") : "—"} ・ {h.property_address}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>
                          {h.amount != null ? `¥${h.amount.toLocaleString("ja-JP")}` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 合計 */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", padding: "0.875rem 1rem", background: "#ecfdf5", borderRadius: "0.75rem", border: "1px solid #bbf7d0" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>修繕費合計</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#16a34a" }}>
                        ¥{repairHistory.reduce((s, h) => s + (h.amount ?? 0), 0).toLocaleString("ja-JP")}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 登録物件 */}
        <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
              <Clock style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a" }} />あなたの登録物件
            </h2>
            <Link href="/properties" style={{ fontSize: "0.875rem", color: "#16a34a", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              すべて見る <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </Link>
          </div>

          {propertiesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
              <Loader2 className="animate-spin" style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a" }} />
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <Building2 style={{ width: "2.5rem", height: "2.5rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1rem" }}>まだ案件が投稿されていません</p>
              <Link href="/properties/new" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#16a34a", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
                <Plus style={{ width: "1rem", height: "1rem" }} />最初の案件を投稿する
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {properties.map((p) => {
                const urgency = getUrgencyLabel(p.last_repair_year);
                const isOpen = expandedId === p.id;
                return (
                  <div key={p.id} style={{ background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                          <span style={{ background: "#e5e7eb", color: "#374151", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
                            {PROPERTY_TYPE_LABELS[p.property_type] || p.property_type}
                          </span>
                          <span style={{ background: urgency.bg, color: urgency.color, fontSize: "0.75rem", padding: "0.2rem 0.625rem", borderRadius: "9999px", fontWeight: 600 }}>
                            {urgency.label}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#374151", fontSize: "0.875rem" }}>
                          <MapPin style={{ width: "0.875rem", height: "0.875rem", color: "#9ca3af", flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.address}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                        <button onClick={() => setExpandedId(isOpen ? null : p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
                          {isOpen ? <ChevronUp style={{ width: "1.25rem", height: "1.25rem" }} /> : <ChevronDown style={{ width: "1.25rem", height: "1.25rem" }} />}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid #e5e7eb" }}>
                        <div style={{ display: "grid", gridTemplateColumns: col2, gap: "0.5rem", marginTop: "0.75rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                          <div><span style={{ fontWeight: 600, color: "#374151" }}>掲載日：</span>{new Date(p.created_at).toLocaleDateString("ja-JP")}</div>
                          {p.building_age && <div><span style={{ fontWeight: 600, color: "#374151" }}>築年数：</span>{p.building_age}年</div>}
                          {p.current_issues && <div style={{ gridColumn: "1 / -1" }}><span style={{ fontWeight: 600, color: "#374151" }}>状況：</span>{p.current_issues}</div>}
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                          <Link href="/owner/contractors" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#16a34a", color: "white", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                            <Search style={{ width: "0.875rem", height: "0.875rem" }} />業者を探す
                          </Link>
                          <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
                            {deletingId === p.id ? <Loader2 className="animate-spin" style={{ width: "0.875rem", height: "0.875rem" }} /> : <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />}
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 知識ハブ */}
        <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", marginBottom: "1.25rem" }}>
            <BookOpen style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a" }} />オーナー知識ハブ
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: col3, gap: "0.75rem" }}>
            {KNOWLEDGE_ITEMS.map((item) => (
              <Link key={item.title} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem", background: item.bg, borderRadius: "0.75rem", textDecoration: "none", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", background: "white", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <item.icon style={{ width: "1.125rem", height: "1.125rem", color: item.color }} />
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1f2937", lineHeight: 1.4 }}>{item.title}</span>
              </Link>
            ))}
          </div>
          <Link href="/owner/knowledge" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", marginTop: "1rem", color: "#16a34a", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
            すべての知識ハブ記事を見る <ArrowRight style={{ width: "1rem", height: "1rem" }} />
          </Link>
        </div>

        {/* 無料PRバナー */}
        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <CheckCircle style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#14532d", fontSize: "0.9375rem" }}>登録後3ヶ月間は全機能が無料</p>
            <p style={{ color: "#166534", fontSize: "0.8125rem", marginTop: "0.25rem", lineHeight: 1.6 }}>
              AI診断・業者検索はずっと無料。チャット・電子サイン・修繕履歴は3ヶ月間フル体験後、Aプラン¥550/月〜で継続利用できます。無料のまま登録は維持されます。
            </p>
          </div>
          <Link href="/diagnosis" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#16a34a", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
            AI診断を使う <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
