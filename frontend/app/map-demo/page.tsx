"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import type { Contractor } from "@/lib/api";
import { getContractorRank } from "@/lib/api";
import { MapPin, Building2, ChevronRight, Award } from "lucide-react";

// Dynamic import to avoid SSR issues with Mapbox
const ContractorMap = dynamic(() => import("@/components/ContractorMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center rounded-xl"
      style={{ background: "rgba(15,23,42,0.60)" }}
    >
      <div className="text-white/40 text-sm">地図を読み込み中...</div>
    </div>
  ),
});

// Demo contractors covering all ranks S/A/B/C/D/E
const DEMO_CONTRACTORS: Contractor[] = [
  {
    id: "demo-s",
    company_name: "東京建設マスター",
    address: "東京都新宿区",
    prefecture: "東京都",
    city: "新宿区",
    phone: "03-0000-0001",
    email: "demo-s@example.com",
    construction_license: "東京都知事許可（般-99）第99001号",
    work_types: ["防水工事", "外壁塗装", "屋根工事"],
    latitude: 35.6938,
    longitude: 139.7034,
    created_at: "2024-01-01",
    ai_score: 78,
  },
  {
    id: "demo-a",
    company_name: "スマートリフォーム",
    address: "東京都渋谷区",
    prefecture: "東京都",
    city: "渋谷区",
    phone: "03-0000-0002",
    email: "demo-a@example.com",
    construction_license: "東京都知事許可（般-99）第99002号",
    work_types: ["リフォーム全般", "内装工事", "設備工事"],
    latitude: 35.6617,
    longitude: 139.7041,
    created_at: "2024-01-01",
    ai_score: 63,
  },
  {
    id: "demo-b",
    company_name: "関東防水工業",
    address: "神奈川県横浜市",
    prefecture: "神奈川県",
    city: "横浜市",
    phone: "045-000-0003",
    email: "demo-b@example.com",
    construction_license: "神奈川県知事許可（般-99）第99003号",
    work_types: ["防水工事", "シーリング工事"],
    latitude: 35.4437,
    longitude: 139.638,
    created_at: "2024-01-01",
    ai_score: 52,
  },
  {
    id: "demo-c",
    company_name: "埼玉修繕センター",
    address: "埼玉県さいたま市",
    prefecture: "埼玉県",
    city: "さいたま市",
    phone: "048-000-0004",
    email: "demo-c@example.com",
    construction_license: "埼玉県知事許可（般-99）第99004号",
    work_types: ["大規模修繕", "塗装工事"],
    latitude: 35.8617,
    longitude: 139.6455,
    created_at: "2024-01-01",
    ai_score: 43,
  },
  {
    id: "demo-d",
    company_name: "千葉リペアサービス",
    address: "千葉県千葉市",
    prefecture: "千葉県",
    city: "千葉市",
    phone: "043-000-0005",
    email: "demo-d@example.com",
    construction_license: "千葉県知事許可（般-99）第99005号",
    work_types: ["外壁工事", "屋根工事"],
    latitude: 35.6073,
    longitude: 140.1063,
    created_at: "2024-01-01",
    ai_score: 32,
  },
  {
    id: "demo-e",
    company_name: "横須賀工業",
    address: "神奈川県横須賀市",
    prefecture: "神奈川県",
    city: "横須賀市",
    phone: "046-000-0006",
    email: "demo-e@example.com",
    construction_license: "神奈川県知事許可（般-99）第99006号",
    work_types: ["一般工事"],
    latitude: 35.2812,
    longitude: 139.6722,
    created_at: "2024-01-01",
    ai_score: 15,
  },
];

const RANK_LEGEND = [
  { rank: "S", range: "70点以上", color: "#a78bfa", bgStyle: "rgba(124,58,237,0.20)", borderStyle: "rgba(167,139,250,0.40)", emoji: "🏆" },
  { rank: "A", range: "60〜69点", color: "#93c5fd", bgStyle: "rgba(29,78,216,0.20)", borderStyle: "rgba(96,165,250,0.35)", emoji: "🥈" },
  { rank: "B", range: "50〜59点", color: "#6ee7b7", bgStyle: "rgba(6,95,70,0.20)", borderStyle: "rgba(52,211,153,0.35)", emoji: "🥉" },
  { rank: "C", range: "40〜49点", color: "#fcd34d", bgStyle: "rgba(146,64,14,0.20)", borderStyle: "rgba(252,211,77,0.30)", emoji: "📋" },
  { rank: "D", range: "30〜39点", color: "#6b7280", bgStyle: "rgba(107,114,128,0.18)", borderStyle: "rgba(107,114,128,0.28)", emoji: "📄" },
  { rank: "E", range: "29点以下", color: "#94a3b8", bgStyle: "rgba(156,163,175,0.10)", borderStyle: "rgba(209,213,219,0.20)", emoji: "🔩" },
];

export default function MapDemoPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const selectedContractor = DEMO_CONTRACTORS.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "3rem" }}>
      {/* Header banner */}
      <div
        className="flex-shrink-0"
        style={{
          padding: "1rem",
          background: "rgba(15,23,42,0.88)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(96,165,250,0.40)" }}
            >
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">施工業社マップ（デモ）</h1>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.18)",
                    border: "1px solid rgba(252,211,77,0.30)",
                    color: "#fcd34d",
                  }}
                >
                  デモ表示
                </span>
              </div>
              <p className="text-xs text-white/45">AIスコアによるランク（S〜E）が地図上に表示されます</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/contractors"
              className="bg-white text-gray-700 font-semibold rounded-xl px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors text-sm px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              業者一覧を見る
            </Link>
            <Link
              href="/contractors/register"
              className="bg-blue-600 text-white font-semibold rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              無料登録する
            </Link>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4 min-h-0">
        {/* Left panel — hidden on mobile */}
        <div className="hidden md:flex w-72 flex-shrink-0 flex-col gap-3 overflow-y-auto glass-scroll max-h-[calc(100vh-160px)]">
          {/* Rank legend */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              AIスコア ランク凡例
            </h2>
            <div className="space-y-2">
              {RANK_LEGEND.map((item) => (
                <div key={item.rank} className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      color: item.color,
                      background: item.bgStyle,
                      border: `1px solid ${item.borderStyle}`,
                    }}
                  >
                    {item.rank}
                  </span>
                  <span className="text-xs text-white/55">{item.range}</span>
                  <span className="ml-auto text-sm">{item.emoji}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contractor cards */}
          <div className="space-y-2">
            {DEMO_CONTRACTORS.map((c) => {
              const rankInfo = getContractorRank(c.ai_score);
              const isSelected = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(isSelected ? undefined : c.id)}
                  className="w-full text-left rounded-xl p-3 transition-all"
                  style={{
                    background: isSelected ? "#eff6ff" : "#f9fafb",
                    border: isSelected
                      ? "1px solid rgba(96,165,250,0.45)"
                      : "1px solid #e5e7eb",
                    boxShadow: isSelected ? "0 0 0 1px rgba(96,165,250,0.25)" : "none",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{
                        color: rankInfo.color,
                        background: rankInfo.bg,
                      }}
                    >
                      {rankInfo.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-sm truncate">{c.company_name}</div>
                      <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {c.address}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.work_types.slice(0, 2).map((wt) => (
                          <span
                            key={wt}
                            className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{
                              background: "#f3f4f6",
                              color: "#6b7280",
                            }}
                          >
                            {wt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-white/35">スコア</div>
                      <div className="font-black text-gray-700 text-sm">{c.ai_score}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected detail */}
          {selectedContractor && (
            <div
              className="rounded-xl p-3"
              style={{
                background: "#eff6ff",
                border: "1px solid rgba(96,165,250,0.30)",
              }}
            >
              <p className="text-xs font-bold text-blue-600 mb-1">選択中</p>
              <p className="text-sm font-bold text-gray-800">{selectedContractor.company_name}</p>
              <p className="text-xs text-white/45 mt-0.5">
                AIスコア: {selectedContractor.ai_score}点
              </p>
            </div>
          )}
        </div>

        {/* Map panel */}
        <div
          className="flex-1 rounded-2xl overflow-hidden min-h-[400px]"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <ContractorMap
            contractors={DEMO_CONTRACTORS}
            onSelect={(c) => setSelectedId(c.id)}
            selectedId={selectedId}
          />
        </div>
      </div>

      {/* Mobile horizontal scroll cards */}
      <div className="md:hidden px-4 pb-4 overflow-x-auto glass-scroll">
        <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
          {DEMO_CONTRACTORS.map((c) => {
            const rankInfo = getContractorRank(c.ai_score);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="flex-shrink-0 w-44 rounded-xl p-3 text-left transition-all"
                style={{
                  background:
                    selectedId === c.id
                      ? "#eff6ff"
                      : "#f9fafb",
                  border:
                    selectedId === c.id
                      ? "1px solid rgba(96,165,250,0.40)"
                      : "1px solid #e5e7eb",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ color: rankInfo.color, background: rankInfo.bg }}
                  >
                    {rankInfo.rank}
                  </span>
                  <span className="font-bold text-xs text-white/85 truncate">{c.company_name}</span>
                </div>
                <div className="text-xs text-white/40 truncate">{c.address}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA footer */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{
          background: "rgba(15,23,42,0.88)",
          borderTop: "1px solid #e5e7eb",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-white/55">
            <span className="font-bold text-gray-700">S〜Eランク</span>の全業者がマップ上に表示されます。
            実際の業者一覧は
            <Link href="/contractors" className="text-blue-600 hover:text-blue-600 transition-colors mx-1">
              こちら
            </Link>
            から。
          </p>
          <div className="flex gap-3">
            <Link
              href="/contractors"
              className="bg-white text-gray-700 font-semibold rounded-xl px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-medium"
            >
              業者一覧を見る
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contractors/register"
              className="bg-blue-600 text-white font-semibold rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-bold"
            >
              施工業社として無料登録
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
