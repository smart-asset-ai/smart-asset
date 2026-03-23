"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  Lock,
  Star,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { getContractorRank, type Contractor } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ランクの色テーブル
const RANK_GRADIENT: Record<string, string> = {
  S: "from-violet-600 to-purple-700",
  A: "from-blue-600 to-blue-700",
  B: "from-emerald-600 to-green-700",
  C: "from-yellow-500 to-amber-600",
  D: "from-gray-400 to-gray-500",
  E: "from-rose-400 to-red-500",
};

function MaskedField({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-400 italic">会員ページからご確認ください</span>
        </div>
      </div>
    </div>
  );
}

export default function ContractorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 簡易ログイン判定: LocalStorageにトークンがあれば会員扱い
  // (Phase2でSupabase Authに置き換え)
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // LocalStorageからセッション確認
    const token = typeof window !== "undefined"
      ? localStorage.getItem("smart-asset-token") || sessionStorage.getItem("supabase.auth.token")
      : null;
    setIsMember(!!token);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_URL}/api/contractors/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("業者が見つかりません");
        return r.json();
      })
      .then((data) => {
        setContractor(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">{error || "業者が見つかりません"}</div>
        <Link href="/owner/contractors" className="text-blue-600 text-sm hover:underline">
          ← 業者一覧に戻る
        </Link>
      </div>
    );
  }

  const { rank, color, bg } = getContractorRank(contractor.ai_score);
  const gradientClass = RANK_GRADIENT[rank] || "from-gray-400 to-gray-500";
  const isAutoData = contractor.description?.includes("自動入力");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className={`bg-gradient-to-r ${gradientClass} text-white`}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            業者一覧に戻る
          </button>

          <div className="flex items-start gap-4">
            {/* ランクバッジ */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-black text-white">{rank}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {isAutoData && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    自動入力データ
                  </span>
                )}
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  AIスコア {contractor.ai_score ?? "--"}点
                </span>
              </div>
              <h1 className="text-xl font-bold text-white leading-tight">
                {contractor.company_name}
              </h1>
              <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{contractor.prefecture}{contractor.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* 非会員バナー */}
        {!isMember && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-800 text-sm mb-1">
                🔒 会員登録で詳細情報を確認できます
              </div>
              <div className="text-xs text-blue-600 mb-3">
                電話番号・メール・許可番号などの詳細は会員限定です。無料で登録できます。
              </div>
              <div className="flex gap-2">
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  無料会員登録
                </Link>
                <Link
                  href="/login"
                  className="text-blue-600 text-xs px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  ログイン
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 基本情報カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              基本情報
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {/* 住所 - 全員見える */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400 mb-0.5">所在地</div>
                <div className="text-sm text-gray-700">{contractor.address || `${contractor.prefecture}${contractor.city}`}</div>
              </div>
            </div>

            {/* 電話番号 */}
            {isMember ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">電話番号</div>
                  <a href={`tel:${contractor.phone}`} className="text-sm text-blue-600 hover:underline">
                    {contractor.phone}
                  </a>
                </div>
              </div>
            ) : (
              <MaskedField label="電話番号" icon={<Phone className="w-4 h-4" />} />
            )}

            {/* メール */}
            {isMember ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">メールアドレス</div>
                  <a href={`mailto:${contractor.email}`} className="text-sm text-blue-600 hover:underline">
                    {contractor.email}
                  </a>
                </div>
              </div>
            ) : (
              <MaskedField label="メールアドレス" icon={<Mail className="w-4 h-4" />} />
            )}

            {/* 建設業許可番号 */}
            {isMember ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">建設業許可番号</div>
                  <div className="text-sm text-gray-700">{contractor.construction_license}</div>
                </div>
              </div>
            ) : (
              <MaskedField label="建設業許可番号" icon={<Shield className="w-4 h-4" />} />
            )}

            {/* 法人番号 */}
            {contractor.corporate_number && (
              isMember ? (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">法人番号</div>
                    <div className="text-sm text-gray-700">{contractor.corporate_number}</div>
                  </div>
                </div>
              ) : (
                <MaskedField label="法人番号" icon={<FileText className="w-4 h-4" />} />
              )
            )}
          </div>
        </div>

        {/* 工種 */}
        {contractor.work_types?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-400" />
                対応工種
              </h2>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {contractor.work_types.map((wt: string) => (
                <span
                  key={wt}
                  className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-100"
                >
                  {wt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 会社説明 */}
        {contractor.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-400" />
                会社紹介
              </h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 leading-relaxed">{contractor.description}</p>
            </div>
          </div>
        )}

        {/* 会員向けCTA（非会員のみ） */}
        {!isMember && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-white/80" />
            <div className="font-bold mb-1">会員登録で全情報を開示</div>
            <div className="text-sm text-blue-100 mb-4">
              電話番号・メール・許可番号・法人番号が確認できます
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 bg-white text-blue-700 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              無料会員登録はこちら
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 一覧に戻る */}
        <div className="pb-8">
          <Link
            href="/owner/contractors"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            業者一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
