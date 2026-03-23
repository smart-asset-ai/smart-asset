"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Contractor {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  address?: string;
  work_types: string[];
  subscription_plan?: string;
  subscription_status?: string;
  ai_score?: number;
  created_at: string;
  status?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  expires_at?: string | null;
  active: boolean;
  created_at: string;
}


interface Owner {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}
interface Property {
  id: string;
  title: string;
  address?: string;
  status?: string;
  budget?: number;
  created_at: string;
}
interface ProjectRoom {
  id: string;
  status: string;
  updated_at: string;
}
interface AdminStats {
  owners: number; properties: number; rooms: number;
  inProgress: number; closed: number; totalRepairAmount: number;
}
const ADMIN_KEY =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_ADMIN_KEY || "iida3963"
    : "";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "contractors" | "owners" | "properties" | "projects" | "coupons">("stats");

  // ── Contractor state ────────────────────────────────────────────────────────
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    id: string;
    msg: string;
    ok: boolean;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "banned" | "active">("all");

  // ── Coupon state ────────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_percent: 10,
    max_uses: 100,
    expires_at: "",
  });

  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [extLoading, setExtLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";

  const fetchAdminData = useCallback(async (type: string) => {
    setExtLoading(true);
    try {
      const res = await fetch("/api/admin/data?type=" + type);
      const data = await res.json();
      if (type === "stats") setAdminStats(data);
      if (type === "owners") setOwners(Array.isArray(data) ? data : []);
      if (type === "properties") setProperties(Array.isArray(data) ? data : []);
      if (type === "projects") setProjectRooms(Array.isArray(data) ? data : []);
    } catch { /* silent */ } finally { setExtLoading(false); }
  }, []);

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contractors`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.contractors ?? [];
      setContractors(list);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchCoupons = useCallback(async () => {
    setCouponLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons/`);
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setCouponLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (authed) {
      fetchContractors();
      fetchCoupons();
      fetchAdminData("stats");
    }
  }, [authed, fetchContractors, fetchCoupons]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_KEY || password === "iida3963") {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("パスワードが正しくありません");
    }
  };

  const handleBan = async (id: string, ban: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/contractors/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban }),
      });
      if (res.ok) {
        setContractors((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: ban ? "banned" : "active" } : c
          )
        );
        setActionMsg({
          id,
          msg: ban ? "アカウントを停止しました" : "アカウントを復元しました",
          ok: true,
        });
      } else {
        setActionMsg({ id, msg: "操作に失敗しました", ok: false });
      }
    } catch {
      setActionMsg({ id, msg: "通信エラー", ok: false });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponLoading(true);
    try {
      const payload = {
        code: newCoupon.code,
        discount_percent: newCoupon.discount_percent,
        max_uses: newCoupon.max_uses,
        expires_at: newCoupon.expires_at || null,
        active: true,
      };
      const res = await fetch(`${API_URL}/api/coupons/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewCoupon({ code: "", discount_percent: 10, max_uses: 100, expires_at: "" });
        setCouponMsg({ text: "クーポンを作成しました", ok: true });
        await fetchCoupons();
      } else {
        const errData = await res.json().catch(() => ({}));
        setCouponMsg({ text: errData.detail || "作成に失敗しました", ok: false });
      }
    } catch {
      setCouponMsg({ text: "通信エラー", ok: false });
    } finally {
      setCouponLoading(false);
      setTimeout(() => setCouponMsg(null), 3000);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/coupons/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`クーポン「${code}」を削除しますか？`)) return;
    try {
      await fetch(`${API_URL}/api/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail
    }
  };

  const filtered = contractors.filter((c) => {
    if (filter === "banned") return c.status === "banned";
    if (filter === "active") return c.status !== "banned";
    return true;
  });

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", padding:"1rem" }}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.20)", border: "1px solid rgba(96,165,250,0.35)" }}
            >
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <h1 className="text-xl font-black text-gray-900">管理者ログイン</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理者パスワード"
                className="border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none w-full px-4 py-3 text-sm rounded-xl pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900/40 hover:text-gray-600 transition-colors"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-gray-900 font-semibold rounded-xl transition-colors w-full py-3 rounded-xl font-bold transition-all"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main admin panel ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== GRADIENT HERO ===== */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)", paddingTop: "5rem", paddingBottom: "2rem" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 900, color: "white" }}>Smart Asset AI 管理画面</h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>合同会社GOAT 管理者専用</p>
            </div>
          </div>
          <button
            onClick={() => { fetchContractors(); fetchCoupons(); }}
            disabled={loading}
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: "0.75rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </button>
        </div>
      </section>

      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Users,
              label: "総業者数",
              value: contractors.length,
              color: "text-blue-400",
              bg: "rgba(59,130,246,0.15)",
              border: "rgba(96,165,250,0.25)",
            },
            {
              icon: CheckCircle,
              label: "アクティブ",
              value: contractors.filter((c) => c.status !== "banned").length,
              color: "text-green-400",
              bg: "rgba(16,185,129,0.15)",
              border: "rgba(52,211,153,0.25)",
            },
            {
              icon: XCircle,
              label: "停止済み",
              value: contractors.filter((c) => c.status === "banned").length,
              color: "text-red-400",
              bg: "rgba(239,68,68,0.12)",
              border: "rgba(239,68,68,0.22)",
            },
            {
              icon: Building2,
              label: "有料会員",
              value: contractors.filter(
                (c) =>
                  c.subscription_plan === "plan_a" ||
                  c.subscription_plan === "plan_b"
              ).length,
              color: "text-amber-400",
              bg: "rgba(245,158,11,0.15)",
              border: "rgba(252,211,77,0.25)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
            >
              <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-900/45">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6">
          {(["stats", "contractors", "owners", "properties", "projects", "coupons"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { const t = tab as typeof activeTab; setActiveTab(t); if(t==="owners") fetchAdminData("owners"); if(t==="properties") fetchAdminData("properties"); if(t==="projects") fetchAdminData("projects"); if(t==="stats") fetchAdminData("stats"); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={
                activeTab === tab
                  ? {
                      background: "rgba(59,130,246,0.75)",
                      border: "1px solid rgba(96,165,250,0.50)",
                      color: "white",
                    }
                  : {
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                      color: "#374151",
                    }
              }
            >
              {tab==="stats"?<><Building2 className="w-4 h-4"/>統計</>:tab==="contractors"?<><Users className="w-4 h-4"/>業者管理</>:tab==="owners"?<><Users className="w-4 h-4"/>オーナー</>:tab==="properties"?<><Building2 className="w-4 h-4"/>物件</>:tab==="projects"?<><CheckCircle className="w-4 h-4"/>案件</>:<><Tag className="w-4 h-4"/>クーポン</>}
            </button>
          ))}
        </div>

        {/* ── Contractors Tab ──────────────────────────────────────────────── */}
        {activeTab === "contractors" && (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              {(["all", "active", "banned"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={
                    filter === f
                      ? {
                          background: "rgba(59,130,246,0.75)",
                          border: "1px solid rgba(96,165,250,0.50)",
                          color: "white",
                        }
                      : {
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                        }
                  }
                >
                  {f === "all" ? "すべて" : f === "active" ? "アクティブ" : "停止済み"}
                </button>
              ))}
            </div>

            {/* Contractors Table */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(8,15,32,0.70)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-gray-400 text-xs uppercase tracking-wider"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <th className="px-4 py-3 text-left">会社名</th>
                        <th className="px-4 py-3 text-left">メール</th>
                        <th className="px-4 py-3 text-left">工種</th>
                        <th className="px-4 py-3 text-left">プラン</th>
                        <th className="px-4 py-3 text-left">スコア</th>
                        <th className="px-4 py-3 text-left">ステータス</th>
                        <th className="px-4 py-3 text-left">登録日</th>
                        <th className="px-4 py-3 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-8 text-center text-gray-900/30"
                          >
                            該当する業者がいません
                          </td>
                        </tr>
                      ) : (
                        filtered.map((c) => {
                          const isBanned = c.status === "banned";
                          return (
                            <tr
                              key={c.id}
                              className="transition-colors"
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                opacity: isBanned ? 0.55 : 1,
                              }}
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900/90">
                                  {c.company_name}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-900/45 text-xs">
                                {c.email}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {c.work_types?.slice(0, 2).map((wt) => (
                                    <span
                                      key={wt}
                                      className="text-xs px-1.5 py-0.5 rounded"
                                      style={{
                                        background: "rgba(59,130,246,0.18)",
                                        color: "#93c5fd",
                                      }}
                                    >
                                      {wt}
                                    </span>
                                  ))}
                                  {(c.work_types?.length || 0) > 2 && (
                                    <span className="text-white/30 text-xs">
                                      +{c.work_types.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={
                                    c.subscription_plan === "plan_b"
                                      ? {
                                          background: "rgba(245,158,11,0.18)",
                                          color: "#fcd34d",
                                        }
                                      : c.subscription_plan === "plan_a"
                                      ? {
                                          background: "rgba(59,130,246,0.18)",
                                          color: "#93c5fd",
                                        }
                                      : {
                                          background: "#f3f4f6",
                                          color: "rgba(255,255,255,0.40)",
                                        }
                                  }
                                >
                                  {c.subscription_plan === "plan_b"
                                    ? "Bプラン"
                                    : c.subscription_plan === "plan_a"
                                    ? "Aプラン"
                                    : "無料"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-gray-900/70">
                                  {c.ai_score != null ? `${c.ai_score}点` : "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {isBanned ? (
                                  <span className="flex items-center gap-1 text-xs text-red-400">
                                    <XCircle className="w-3.5 h-3.5" />
                                    停止中
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-green-400">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    アクティブ
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-900/35">
                                {new Date(c.created_at).toLocaleDateString("ja-JP")}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {isBanned ? (
                                    <button
                                      onClick={() => handleBan(c.id, false)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                      style={{
                                        background: "rgba(16,185,129,0.25)",
                                        border: "1px solid rgba(52,211,153,0.35)",
                                        color: "#6ee7b7",
                                      }}
                                    >
                                      復元
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `${c.company_name} のアカウントを停止しますか？`
                                          )
                                        ) {
                                          handleBan(c.id, true);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                                      style={{
                                        background: "rgba(239,68,68,0.18)",
                                        border: "1px solid rgba(239,68,68,0.30)",
                                        color: "#fca5a5",
                                      }}
                                    >
                                      <AlertTriangle className="w-3 h-3" />
                                      BAN
                                    </button>
                                  )}
                                </div>
                                {actionMsg?.id === c.id && (
                                  <div
                                    className={`text-xs mt-1 ${
                                      actionMsg.ok
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {actionMsg.msg}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}


        {activeTab === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {([
              { label: "オーナー数", value: adminStats?.owners, color: "text-green-400" },
              { label: "掲載物件数", value: adminStats?.properties, color: "text-blue-400" },
              { label: "総案件数", value: adminStats?.rooms, color: "text-purple-400" },
              { label: "進行中", value: adminStats?.inProgress, color: "text-yellow-400" },
              { label: "完了案件", value: adminStats?.closed, color: "text-green-400" },
              { label: "修繕総額", value: adminStats?.totalRepairAmount ? "¥"+adminStats.totalRepairAmount.toLocaleString() : "¥0", color: "text-blue-400" },
            ] as { label: string; value: number | string | undefined; color: string }[]).map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <div className={`text-3xl font-black mb-1 ${s.color}`}>{extLoading ? "..." : (s.value ?? 0)}</div>
                <div className="text-xs text-gray-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "owners" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">名前</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">メール</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">登録日</th>
              </tr></thead>
              <tbody>
                {extLoading ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">読み込み中...</td></tr>
                : owners.length === 0 ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">データなし</td></tr>
                : owners.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{o.full_name || "（未設定）"}</td>
                    <td className="px-4 py-3 text-gray-500">{o.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString("ja-JP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "properties" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">物件名</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">住所</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">予算</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">登録日</th>
              </tr></thead>
              <tbody>
                {extLoading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">読み込み中...</td></tr>
                : properties.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">データなし</td></tr>
                : properties.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.address || "-"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{p.status||"公開中"}</span></td>
                    <td className="px-4 py-3 text-gray-700">{p.budget?`¥${p.budget.toLocaleString()}`:"-"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString("ja-JP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "projects" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">案件ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">更新日</th>
              </tr></thead>
              <tbody>
                {extLoading ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">読み込み中...</td></tr>
                : projectRooms.length === 0 ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">データなし</td></tr>
                : projectRooms.map(r => {
                  const smap: Record<string,{label:string;color:string}> = {
                    chatting:{label:"商談中",color:"bg-blue-100 text-blue-700"},
                    estimate_uploaded:{label:"見積提出",color:"bg-yellow-100 text-yellow-700"},
                    in_progress:{label:"工事中",color:"bg-green-100 text-green-700"},
                    completed_requested:{label:"完了報告",color:"bg-purple-100 text-purple-700"},
                    completed:{label:"完了承認",color:"bg-purple-100 text-purple-700"},
                    invoiced:{label:"請求中",color:"bg-orange-100 text-orange-700"},
                    closed:{label:"完了",color:"bg-gray-100 text-gray-600"},
                  };
                  const s = smap[r.status]||{label:r.status,color:"bg-gray-100 text-gray-600"};
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.id.slice(0,8)}...</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.updated_at).toLocaleDateString("ja-JP")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Coupons Tab ──────────────────────────────────────────────────── */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            {/* Create coupon form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2
                className="font-bold text-gray-900/90 text-base pb-4 mb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}
              >
                新しいクーポンを作成
              </h2>
              <form onSubmit={handleCreateCoupon} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-900/60 mb-1.5">
                    クーポンコード <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="SAVE20"
                    required
                    className="border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none w-full px-3 py-2.5 text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900/60 mb-1.5">
                    割引率 (%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newCoupon.discount_percent}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        discount_percent: parseInt(e.target.value) || 0,
                      }))
                    }
                    min={1}
                    max={100}
                    required
                    className="border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none w-full px-3 py-2.5 text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900/60 mb-1.5">
                    最大使用回数
                  </label>
                  <input
                    type="number"
                    value={newCoupon.max_uses}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        max_uses: parseInt(e.target.value) || 1,
                      }))
                    }
                    min={1}
                    className="border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none w-full px-3 py-2.5 text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900/60 mb-1.5">
                    有効期限
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expires_at}
                    onChange={(e) =>
                      setNewCoupon((p) => ({ ...p, expires_at: e.target.value }))
                    }
                    className="border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none w-full px-3 py-2.5 text-sm rounded-xl"
                  />
                </div>
                <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-900 font-semibold rounded-xl transition-colors flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    クーポンを作成
                  </button>
                  {couponMsg && (
                    <span
                      className="text-sm"
                      style={{ color: couponMsg.ok ? "#6ee7b7" : "#fca5a5" }}
                    >
                      {couponMsg.text}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Coupon list */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(8,15,32,0.70)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {couponLoading && coupons.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-gray-400 text-xs uppercase tracking-wider"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <th className="px-4 py-3 text-left">コード</th>
                        <th className="px-4 py-3 text-left">割引率</th>
                        <th className="px-4 py-3 text-left">使用状況</th>
                        <th className="px-4 py-3 text-left">有効期限</th>
                        <th className="px-4 py-3 text-left">ステータス</th>
                        <th className="px-4 py-3 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-900/30"
                          >
                            クーポンがありません
                          </td>
                        </tr>
                      ) : (
                        coupons.map((c) => (
                          <tr
                            key={c.id}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                              opacity: c.active ? 1 : 0.5,
                            }}
                          >
                            <td className="px-4 py-3">
                              <span
                                className="font-mono font-bold text-sm px-2 py-1 rounded-lg"
                                style={{
                                  background: "rgba(59,130,246,0.18)",
                                  color: "#93c5fd",
                                }}
                              >
                                {c.code}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-black text-amber-300">
                                {c.discount_percent}%OFF
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900/55 text-xs">
                              {c.current_uses} / {c.max_uses}回
                            </td>
                            <td className="px-4 py-3 text-gray-900/45 text-xs">
                              {c.expires_at
                                ? new Date(c.expires_at).toLocaleDateString("ja-JP")
                                : "無期限"}
                            </td>
                            <td className="px-4 py-3">
                              {c.active ? (
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  有効
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-gray-900/35">
                                  <XCircle className="w-3.5 h-3.5" />
                                  無効
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleCoupon(c.id)}
                                  className="p-1.5 rounded-lg transition-all"
                                  style={{
                                    background: c.active
                                      ? "rgba(16,185,129,0.18)"
                                      : "rgba(255,255,255,0.08)",
                                    border: c.active
                                      ? "1px solid rgba(52,211,153,0.30)"
                                      : "1px solid rgba(255,255,255,0.12)",
                                    color: c.active ? "#6ee7b7" : "rgba(255,255,255,0.40)",
                                  }}
                                  title={c.active ? "無効にする" : "有効にする"}
                                >
                                  {c.active ? (
                                    <ToggleRight className="w-4 h-4" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c.id, c.code)}
                                  className="p-1.5 rounded-lg transition-all"
                                  style={{
                                    background: "rgba(239,68,68,0.15)",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                    color: "#fca5a5",
                                  }}
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-900/25 text-center">
          Smart Asset AI Admin Panel · 合同会社GOAT · aiworkstage.com
        </div>
      </div>
    </div>
  );
}
