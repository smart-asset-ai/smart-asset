"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Wrench, Building2, Star, TrendingUp, ArrowRight, Loader2, LogIn,
  CheckCircle, FileText, Award, Zap, MapPin, RefreshCw, CreditCard,
  ChevronRight, Shield, Phone, Mail, Globe, Hash, Clock, Users,
  BarChart3, AlertCircle, Edit3, Eye, ThumbsUp, Target, MessageSquare
} from "lucide-react";

interface ProjectRoom {
  id: string;
  status: string;
  property_address: string;
  owner_id: string;
  updated_at: string;
}

const ROOM_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  chatting:           { label: "チャット中",    color: "#1d4ed8", bg: "#eff6ff" },
  estimate_uploaded:  { label: "見積書送付済み", color: "#d97706", bg: "#fffbeb" },
  estimate_approved:  { label: "見積承認済み",  color: "#059669", bg: "#ecfdf5" },
  contract_signed:    { label: "契約締結",      color: "#7c3aed", bg: "#f5f3ff" },
  in_progress:        { label: "工事中",        color: "#0891b2", bg: "#ecfeff" },
  completed_requested:{ label: "完了報告済み",  color: "#ea580c", bg: "#fff7ed" },
  completed:          { label: "完了確認済み",  color: "#16a34a", bg: "#f0fdf4" },
  invoiced:           { label: "請求書送付済み", color: "#db2777", bg: "#fdf2f8" },
  invoice_approved:   { label: "支払い完了",    color: "#16a34a", bg: "#f0fdf4" },
  closed:             { label: "クローズ",      color: "#6b7280", bg: "#f9fafb" },
};

interface ContractorProfile {
  id: string;
  company_name: string;
  email: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  corporate_number?: string;
  construction_license?: string;
  work_types: string[];
  description?: string;
  subscription_plan?: string;
  ai_score?: number;
  status?: string;
  photo_urls?: string[];
  created_at: string;
}

function getRankInfo(score?: number) {
  if (score === undefined || score === null) return { rank: "—", bg: "#f3f4f6", text: "#6b7280", range: "未計算", bar: 0 };
  if (score >= 70) return { rank: "S", bg: "#f5f3ff", text: "#7c3aed", range: "プロ", bar: score };
  if (score >= 60) return { rank: "A", bg: "#eff6ff", text: "#1d4ed8", range: "上級", bar: score };
  if (score >= 50) return { rank: "B", bg: "#f0fdf4", text: "#065f46", range: "中級", bar: score };
  if (score >= 40) return { rank: "C", bg: "#fffbeb", text: "#92400e", range: "初級", bar: score };
  return { rank: "D", bg: "#f9fafb", text: "#374151", range: "新規", bar: score };
}

const PLAN_CONFIG = {
  plan_b: {
    label: "Bプラン（全機能）", shortLabel: "Bプラン",
    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
    price: "¥880/月（税込）",
    features: ["全機能解放", "電子サイン", "チャット", "修繕履歴", "優先表示", "AIレポート"],
  },
  plan_a: {
    label: "Aプラン", shortLabel: "Aプラン",
    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
    price: "¥550/月（税込）",
    features: ["チャット", "修繕履歴", "応募無制限", "写真掲載"],
  },
  plan_standard: {
    label: "Aプラン", shortLabel: "Aプラン",
    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
    price: "¥550/月（税込）",
    features: ["チャット", "修繕履歴", "応募無制限", "写真掲載"],
  },
  free: {
    label: "無料（3ヶ月試用 or 継続）", shortLabel: "FREE",
    color: "#374151", bg: "#f9fafb", border: "#e5e7eb",
    price: "¥0",
    features: ["マップ表示", "AI診断", "案件閲覧", "問い合わせ受信"],
  },
};

const card: React.CSSProperties = {
  background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "1.5rem", marginBottom: "1.5rem",
};

export default function ContractorMypagePage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [contractorLoading, setContractorLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const fetchContractor = useCallback(async (email: string) => {
    setContractorLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const res = await fetch(`${API_URL}/api/contractors/?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.contractors ?? [];
      setContractor(list.find((c: ContractorProfile) => c.email === email) || null);
    } catch { /* silent */ }
    finally { setContractorLoading(false); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? null;
      const uid = data.session?.user?.id ?? null;
      setUserEmail(email); setLoading(false);
      if (email) fetchContractor(email);
      if (uid) fetchProjectRooms(uid);
    });
    if (typeof window !== "undefined" && window.location.search.includes("payment=success")) setPaymentSuccess(true);
  }, [fetchContractor]);

  const fetchProjectRooms = async (userId: string) => {
    setRoomsLoading(true);
    try {
      const { data } = await supabase
        .from("project_rooms")
        .select("id, status, property_address, owner_id, updated_at")
        .eq("contractor_id", userId)
        .order("updated_at", { ascending: false });
      setProjectRooms(Array.isArray(data) ? data : []);
    } catch { /* table may not exist yet */ }
    finally { setRoomsLoading(false); }
  };

  const handleStripeUpgrade = async (plan: "A" | "B") => {
    if (!contractor) return;
    setStripeLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const res = await fetch(`${API_URL}/api/stripe/checkout-session`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, contractor_id: contractor.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert("決済ページへの移動に失敗しました。"); }
    finally { setStripeLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", paddingTop: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
    </div>
  );

  if (!userEmail) return (
    <div style={{ minHeight: "100vh", paddingTop: "3rem", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem", maxWidth: "26rem", width: "100%", textAlign: "center" }}>
        <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <LogIn style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>ログインが必要です</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>施工会社マイページをご利用いただくにはログインが必要です。</p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#2563eb", color: "white", fontWeight: 700, borderRadius: "0.875rem", padding: "0.875rem 1.75rem", textDecoration: "none" }}>
          トップページへ <ArrowRight style={{ width: "1rem", height: "1rem" }} />
        </Link>
      </div>
    </div>
  );

  if (!contractorLoading && !contractor) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3rem" }}>
      <div style={{ maxWidth: "44rem", margin: "0 auto", padding: "4rem 1.25rem", textAlign: "center" }}>
        <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "#eff6ff", border: "2px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <Wrench style={{ width: "2.25rem", height: "2.25rem", color: "#2563eb" }} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111827", marginBottom: "0.75rem" }}>施工会社登録が必要です</h2>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>{userEmail}</p>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", maxWidth: "28rem", margin: "0 auto 2rem", lineHeight: 1.7 }}>このメールアドレスでの施工会社登録が見つかりません。まず無料で施工会社登録を行ってください。</p>
        <Link href="/contractors/register"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 800, borderRadius: "1rem", padding: "1.125rem 2.25rem", textDecoration: "none", fontSize: "1.0625rem", boxShadow: "0 6px 20px rgba(37,99,235,0.4)" }}>
          <Wrench style={{ width: "1.25rem", height: "1.25rem" }} /> 無料で施工会社登録 <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
        </Link>
      </div>
    </div>
  );

  const rankInfo = getRankInfo(contractor?.ai_score);
  const currentPlan = contractor?.subscription_plan || "free";
  const planInfo = PLAN_CONFIG[currentPlan as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.free;
  const isBanned = contractor?.status === "banned";
  const isPending = contractor?.status === "pending";
  const isApproved = contractor?.status === "approved";

  const scorePercent = contractor?.ai_score ? Math.min(100, contractor.ai_score) : 0;
  const nextPlan = currentPlan === "free" ? "A" : currentPlan === "plan_standard" ? "B" : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 100%)", paddingTop: "5rem", paddingBottom: "2.5rem" }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "3.75rem", height: "3.75rem", borderRadius: "1rem", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wrench style={{ width: "1.875rem", height: "1.875rem", color: "white" }} />
              </div>
              <div>
                <p style={{ color: "#93c5fd", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>CONTRACTOR PORTAL</p>
                <h1 style={{ fontSize: "1.625rem", fontWeight: 900, color: "white", lineHeight: 1.2 }}>
                  {contractor?.company_name ?? "施工会社マイページ"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{userEmail}</p>
              </div>
            </div>
            {contractorLoading && <RefreshCw className="animate-spin" style={{ width: "1.25rem", height: "1.25rem", color: "rgba(255,255,255,0.5)" }} />}
          </div>

          {paymentSuccess && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "1rem 1.125rem", borderRadius: "0.875rem", marginTop: "1.25rem", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(52,211,153,0.35)" }}>
              <CheckCircle style={{ width: "1.25rem", height: "1.25rem", color: "#34d399", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, color: "#6ee7b7", fontSize: "0.875rem" }}>お支払いが完了しました！</p>
                <p style={{ color: "rgba(110,231,183,0.75)", fontSize: "0.75rem", marginTop: "0.125rem" }}>プランのアップグレードが反映されるまで少々お待ちください。</p>
              </div>
            </div>
          )}

          {/* Hero stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginTop: "1.75rem" }}>
            {[
              {
                label: "AIスコア", value: contractor?.ai_score !== undefined ? contractor.ai_score : "—",
                sub: "/ 100点", color: "#93c5fd",
              },
              {
                label: "ランク", value: rankInfo.rank,
                sub: rankInfo.range, color: "#c4b5fd",
              },
              {
                label: "現在のプラン", value: planInfo.shortLabel,
                sub: planInfo.price, color: "#fde68a",
              },
              {
                label: "ステータス", value: isBanned ? "停止" : isPending ? "審査中" : "✓ 承認済",
                sub: isBanned ? "要確認" : isPending ? "お待ちください" : "Active",
                color: isBanned ? "#fca5a5" : isPending ? "#fde68a" : "#86efac",
              },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.875rem", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: "0.375rem" }}>{s.label}</div>
                <div style={{ fontSize: "1.375rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* 警告バナー */}
        {isBanned && (
          <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "0.875rem" }}>
            <AlertCircle style={{ width: "1.5rem", height: "1.5rem", color: "#dc2626", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <p style={{ fontWeight: 800, color: "#991b1b", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>⚠️ アカウントが停止されています</p>
              <p style={{ color: "#dc2626", fontSize: "0.8125rem", lineHeight: 1.6 }}>不服申立または詳細確認はこちら: <a href="mailto:info@aiworkstage.com" style={{ color: "#2563eb" }}>info@aiworkstage.com</a></p>
            </div>
          </div>
        )}
        {isPending && (
          <div style={{ background: "#fefce8", border: "2px solid #fde68a", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "0.875rem" }}>
            <Clock style={{ width: "1.5rem", height: "1.5rem", color: "#ca8a04", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <p style={{ fontWeight: 800, color: "#713f12", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>審査中です</p>
              <p style={{ color: "#92400e", fontSize: "0.8125rem", lineHeight: 1.6 }}>登録内容を確認中です。通常1〜3営業日で審査完了します。承認後、案件への応募・地図表示が開始されます。</p>
            </div>
          </div>
        )}

        {/* 進行中の案件 */}
        <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 800, color: "#111827", fontSize: "1.0625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} />現場管理
            </h2>
          </div>
          {roomsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
              <Loader2 className="animate-spin" style={{ width: "1.5rem", height: "1.5rem", color: "#2563eb" }} />
            </div>
          ) : projectRooms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <MessageSquare style={{ width: "2.25rem", height: "2.25rem", color: "#d1d5db", margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 }}>現在進行中の案件はありません。<br />案件に応募して受注を増やしましょう。</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {projectRooms.map(room => {
                const si = ROOM_STATUS_LABELS[room.status] ?? ROOM_STATUS_LABELS.chatting;
                return (
                  <Link key={room.id} href={`/contractor/projects/${room.id}`} style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #f1f5f9", padding: "0.875rem 1rem", textDecoration: "none" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MessageSquare style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {room.property_address || "物件案件"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
                        {new Date(room.updated_at).toLocaleDateString("ja-JP")} 更新
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <span style={{ background: si.bg, color: si.color, borderRadius: "9999px", padding: "0.2rem 0.625rem", fontSize: "0.7rem", fontWeight: 700, border: `1px solid ${si.color}30` }}>
                        {si.label}
                      </span>
                      <ChevronRight style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {contractor && (
          <>
            {/* AIスコアカード */}
            <div style={card}>
              <h2 style={{ fontWeight: 800, color: "#111827", fontSize: "1.0625rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BarChart3 style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} />
                AIスコア詳細
              </h2>

              {/* Score bar */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "50%", background: rankInfo.bg, border: `2px solid ${rankInfo.text}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", fontWeight: 900, color: rankInfo.text }}>
                      {rankInfo.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#111827", lineHeight: 1 }}>{contractor.ai_score ?? "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>/ 100点 · {rankInfo.range}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>次のランクまで</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#374151" }}>
                      {contractor.ai_score !== undefined
                        ? contractor.ai_score >= 70 ? "最高ランク達成！🏆"
                          : contractor.ai_score >= 60 ? `あと ${70 - contractor.ai_score}点でSランク`
                            : contractor.ai_score >= 50 ? `あと ${60 - contractor.ai_score}点でAランク`
                              : `あと ${50 - contractor.ai_score}点でBランク`
                        : "スコア未計算"}
                    </div>
                  </div>
                </div>
                <div style={{ height: "0.625rem", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scorePercent}%`, background: "linear-gradient(90deg, #2563eb, #7c3aed)", borderRadius: "9999px", transition: "width 1s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", fontSize: "0.6875rem", color: "#9ca3af" }}>
                  <span>0</span><span>E</span><span>D</span><span>C</span><span>B</span><span>A</span><span>S(70)</span><span>100</span>
                </div>
              </div>

              {/* Score breakdown */}
              <div style={{ background: "#f8fafc", borderRadius: "0.875rem", padding: "1.125rem" }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", marginBottom: "1rem" }}>スコアの計算式</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { icon: Building2, label: "① 会社情報の充実度", desc: "社歴・資格・資本金・法人番号など", score: "最大90点", color: "#2563eb", bg: "#eff6ff" },
                    { icon: Star, label: "② オーナー評価の平均", desc: "施工完了後のオーナー様評価", score: "最大90点", color: "#d97706", bg: "#fffbeb" },
                    { icon: Zap, label: "③ 継続会員ポイント", desc: "1年継続ごとに+2点（自動）", score: "最大10点", color: "#7c3aed", bg: "#f5f3ff" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon style={{ width: "1.125rem", height: "1.125rem", color: item.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>{item.label}</div>
                        <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{item.desc}</div>
                      </div>
                      <span style={{ background: item.bg, color: item.color, fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>{item.score}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "0.875rem", padding: "0.75rem", background: "white", borderRadius: "0.625rem", border: "1px solid #e5e7eb", fontSize: "0.8125rem", color: "#374151", textAlign: "center" }}>
                  <strong>最終スコア = (①＋②) ÷ 2 ＋ ③</strong>
                </div>
              </div>
            </div>

            {/* 会社プロフィール */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontWeight: 800, color: "#111827", fontSize: "1.0625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Building2 style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} />
                  会社プロフィール
                </h2>
                <span style={{ background: planInfo.bg, color: planInfo.color, border: `1px solid ${planInfo.border}`, fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px" }}>
                  {planInfo.label}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1.25rem" }}>
                {[
                  { icon: MapPin, label: "所在地", value: [contractor.prefecture, contractor.city, contractor.address].filter(Boolean).join(" ") || "未登録" },
                  { icon: Phone, label: "電話番号", value: contractor.phone || "未登録" },
                  { icon: Mail, label: "メールアドレス", value: contractor.email },
                  { icon: Globe, label: "ウェブサイト", value: contractor.website || "未登録", isLink: true },
                  { icon: Hash, label: "建設業許可番号", value: contractor.construction_license || "未登録" },
                  { icon: Hash, label: "法人番号", value: contractor.corporate_number || "未登録" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#f8fafc", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.375rem" }}>
                      <item.icon style={{ width: "0.875rem", height: "0.875rem", color: "#9ca3af" }} />
                      <span style={{ fontSize: "0.6875rem", color: "#9ca3af", fontWeight: 700 }}>{item.label}</span>
                    </div>
                    {item.isLink && item.value !== "未登録" ? (
                      <a href={item.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", fontWeight: 600, wordBreak: "break-all", textDecoration: "none" }}>{item.value}</a>
                    ) : (
                      <span style={{ fontSize: "0.8125rem", color: item.value === "未登録" ? "#d1d5db" : "#374151", fontWeight: 600, wordBreak: "break-all" }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
              {contractor.work_types?.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 700, marginBottom: "0.5rem" }}>対応工事種別</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {contractor.work_types.map(wt => (
                      <span key={wt} style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.8125rem", padding: "0.3rem 0.75rem", borderRadius: "9999px", border: "1px solid #bfdbfe", fontWeight: 500 }}>{wt}</span>
                    ))}
                  </div>
                </div>
              )}
              {contractor.description && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 700, marginBottom: "0.5rem" }}>会社紹介文</p>
                  <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.7, background: "#f8fafc", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9" }}>{contractor.description}</p>
                </div>
              )}
            </div>

            {/* 案件一覧リンク */}
            <div style={{ background: "linear-gradient(135deg, #eff6ff, #f0f9ff)", borderRadius: "1rem", border: "2px solid #bfdbfe", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ width: "3rem", height: "3rem", background: "#2563eb", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "1.0625rem" }}>修繕案件を確認する</h2>
                  <p style={{ color: "#2563eb", fontSize: "0.8125rem", marginTop: "0.125rem" }}>
                    {isApproved ? "AIスコア上位業者として優先的に案件を閲覧・応募できます" : "承認後に案件への応募が可能になります"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/properties"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#2563eb", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.75rem 1.25rem", textDecoration: "none", fontSize: "0.9375rem", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                  <FileText style={{ width: "1rem", height: "1rem" }} /> 案件一覧を見る <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                </Link>
                <Link href="/contractors"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "white", color: "#2563eb", fontWeight: 700, borderRadius: "0.75rem", padding: "0.75rem 1.25rem", textDecoration: "none", fontSize: "0.9375rem", border: "1px solid #bfdbfe" }}>
                  <Eye style={{ width: "1rem", height: "1rem" }} /> 自社ページを確認
                </Link>
              </div>
            </div>

            {/* プランアップグレード */}
            {nextPlan && (
              <div style={card}>
                <h2 style={{ fontWeight: 800, color: "#111827", fontSize: "1.0625rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />
                  プランアップグレード
                </h2>

                {/* Plan comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem", marginBottom: "1.5rem" }}>
                  {[
                    {
                      key: "free", title: "FREE", price: "¥0", features: ["マップ表示", "AI診断", "案件閲覧", "問い合わせ受信"],
                      current: currentPlan === "free",
                      color: "#374151", border: "#e5e7eb", bg: "#f9fafb",
                    },
                    {
                      key: "plan_a", title: "Aプラン", price: "¥550/月（税込）", features: ["チャット・見積もり", "修繕履歴の蓄積", "応募無制限", "写真掲載"],
                      current: currentPlan === "plan_a" || currentPlan === "plan_standard",
                      color: "#1d4ed8", border: "#bfdbfe", bg: "#eff6ff",
                    },
                    {
                      key: "plan_b", title: "Bプラン", price: "¥880/月（税込）", features: ["Aプランの全機能", "電子サイン契約", "優先表示", "AIスコアレポート", "専用バッジ"],
                      current: currentPlan === "plan_b",
                      color: "#7c3aed", border: "#ddd6fe", bg: "#f5f3ff",
                    },
                  ].map(plan => (
                    <div key={plan.key} style={{ padding: "1rem", borderRadius: "0.875rem", border: `2px solid ${plan.current ? plan.color : plan.border}`, background: plan.current ? plan.bg : "white", position: "relative" }}>
                      {plan.current && (
                        <div style={{ position: "absolute", top: "-0.75rem", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", whiteSpace: "nowrap" }}>
                          現在のプラン
                        </div>
                      )}
                      <div style={{ fontWeight: 900, fontSize: "0.9375rem", color: plan.color, marginBottom: "0.375rem" }}>{plan.title}</div>
                      <div style={{ fontSize: "1.125rem", fontWeight: 900, color: "#111827", marginBottom: "0.75rem" }}>{plan.price}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        {plan.features.map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#374151" }}>
                            <CheckCircle style={{ width: "0.75rem", height: "0.75rem", color: plan.color, flexShrink: 0 }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleStripeUpgrade(nextPlan as "A" | "B")} disabled={stripeLoading}
                  style={{
                    width: "100%", padding: "1rem", borderRadius: "0.875rem", border: "none",
                    fontWeight: 800, fontSize: "1.0625rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem",
                    background: stripeLoading ? "#e5e7eb" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: stripeLoading ? "#9ca3af" : "white",
                    boxShadow: stripeLoading ? "none" : "0 6px 20px rgba(37,99,235,0.35)",
                    cursor: stripeLoading ? "not-allowed" : "pointer",
                  }}>
                  {stripeLoading
                    ? <><Loader2 className="animate-spin" style={{ width: "1rem", height: "1rem" }} />決済ページへ移動中...</>
                    : <><CreditCard style={{ width: "1.125rem", height: "1.125rem" }} />{nextPlan === "A" ? "有料プランに" : "有料プランに"}アップグレード（Stripe）</>}
                </button>
                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                  Stripe社の安全な決済システム｜月額・クレジットカード
                </p>
              </div>
            )}

            {currentPlan === "plan_standard" && (
              <div style={{ background: "#fffbeb", border: "2px solid #fde68a", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <Award style={{ width: "1.5rem", height: "1.5rem", color: "#f59e0b", flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 800, color: "#713f12", fontSize: "0.9375rem" }}>🏆 最上位プラン（有料プラン）をご利用中</p>
                  <p style={{ color: "#92400e", fontSize: "0.8125rem", marginTop: "0.25rem" }}>すべての機能をフルに活用できます。引き続きご利用ありがとうございます。</p>
                </div>
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af" }}>
              登録日: {new Date(contractor.created_at).toLocaleDateString("ja-JP")} ｜
              お問い合わせ: <a href="mailto:info@aiworkstage.com" style={{ color: "#60a5fa", textDecoration: "none" }}>info@aiworkstage.com</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
