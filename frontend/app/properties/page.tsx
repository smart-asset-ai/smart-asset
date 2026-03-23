"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Lock,
  MapPin,
  Calendar,
  Building2,
  Plus,
  Loader2,
  FileText,
  CheckCircle,
} from "lucide-react";

interface Property {
  id: string;
  address: string;
  prefecture?: string;
  city?: string;
  property_type: string;
  building_age?: number;
  last_repair_year?: number;
  current_issues?: string;
  created_at: string;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "アパート",
  mansion: "マンション",
  house: "戸建て",
};

function getUrgencyLabel(lastRepairYear?: number) {
  if (!lastRepairYear) return { label: "未確認", color: "bg-gray-100 text-gray-500" };
  const years = new Date().getFullYear() - lastRepairYear;
  if (years >= 7) return { label: "要検討（7年以上）", color: "bg-blue-100 text-blue-700" };
  if (years >= 5) return { label: "注意（5〜7年）", color: "bg-green-100 text-green-700" };
  if (years >= 3) return { label: "様子見（3〜5年）", color: "bg-yellow-100 text-yellow-700" };
  return { label: "良好（3年以内）", color: "bg-green-50 text-green-600" };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null | undefined>(undefined);
  const [contractorPlan, setContractorPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const isAdmin = user?.email === 'aiworkstage@gmail.com';
  const isPaidContractor = isAdmin || contractorPlan === 'approved';

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u && u.email !== 'aiworkstage@gmail.com') {
        // Check if user is an approved contractor by email
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: ctData } = await sb
            .from('contractors')
            .select('id, status')
            .eq('email', u.email || '')
            .maybeSingle();
          setContractorPlan(ctData?.status === 'approved' ? 'approved' : 'none');
        } catch { setContractorPlan('none'); }
      } else {
        setContractorPlan(u?.email === 'aiworkstage@gmail.com' ? 'admin' : null);
      }
      setPlanLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("posted") === "1") {
        setJustPosted(true);
      }
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
    fetch(`${API_URL}/api/properties/`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.properties ?? [];
        setProperties(list);
      })
      .catch(() => setError("案件データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  // Auth gate
  if (user === undefined || planLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin" style={{ width: "2rem", height: "2rem", border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "9999px" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <Lock style={{ width: "1.75rem", height: "1.75rem", color: "#d97706" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            物件情報の閲覧には業者会員登録が必要です
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            有料プラン（PlanA / PlanB）に登録することで、<br />オーナー様の物件情報・修繕依頼を閲覧できます。
          </p>
          <Link href="/contractors/register" style={{ display: "block", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none", marginBottom: "0.75rem", fontSize: "1rem", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
            業者会員登録へ進む（有料プラン）
          </Link>
          <Link href="/auth" style={{ display: "block", color: "#2563eb", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
            すでに登録済みの方はログイン
          </Link>
        </div>
      </div>
    );
  }

  if (!isPaidContractor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <Lock style={{ width: "1.75rem", height: "1.75rem", color: "#d97706" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            有料プランへのアップグレードが必要です
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            施工会社として登録・承認されると物件情報を閲覧できます。<br />業者登録がまだの方は下記より登録してください。
          </p>
          <Link href="/contractors/register" style={{ display: "block", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none", marginBottom: "0.75rem", fontSize: "1rem", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
            業者登録へ進む
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "3rem" }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              修繕案件一覧
            </h1>
            <p className="text-gray-500 text-sm">
              オーナー様が投稿した修繕案件です。AIスコア上位業者が閲覧・応募できます。
            </p>
          </div>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            案件を投稿
          </Link>
        </div>

        {/* Success banner */}
        {justPosted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-green-800">案件を投稿しました！</div>
              <p className="text-sm text-green-700">
                AIスコア上位業者に通知されます。業者からの問い合わせをお待ちください。
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-500">
            <p>{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">現在、掲載中の案件はありません</p>
            <p className="text-gray-400 text-sm mb-6">
              オーナー様はこちらから修繕案件を投稿できます
            </p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              案件を投稿する（無料）
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {properties.map((p) => {
              const urgency = getUrgencyLabel(p.last_repair_year);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {PROPERTY_TYPE_LABELS[p.property_type] || p.property_type}
                        </span>
                        {p.building_age && (
                          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                            築{p.building_age}年
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-sm">{p.address}</span>
                      </div>
                      {p.current_issues && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {p.current_issues}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(p.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
