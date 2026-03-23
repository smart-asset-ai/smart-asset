"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  MapPin, Building2, Calendar, FileText, Camera, ArrowRight, Loader2,
  CheckCircle, AlertCircle, Lock, ChevronLeft, ChevronRight,
  Clock, Zap, Users, Mail, X, Home, Layers, Ruler, Hash,
  AlertTriangle, Wrench, BadgeCheck, Info, Star, Shield, Phone
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PROPERTY_TYPES = [
  { value: "mansion_owned", label: "分譲マンション", icon: "🏢", desc: "RC・SRC造・区分所有" },
  { value: "mansion_rental", label: "賃貸マンション", icon: "🏬", desc: "RC・SRC造・賃貸経営" },
  { value: "apartment", label: "アパート", icon: "🏠", desc: "木造・軽量鉄骨系" },
  { value: "house", label: "戸建", icon: "🏡", desc: "一戸建て住宅" },
  { value: "other", label: "その他", icon: "🏗️", desc: "倉庫・工場・事務所など" },
];

const BUILDING_AGE_OPTIONS = [
  "1〜3年", "3〜5年", "5〜10年", "10〜15年", "15〜20年",
  "20〜25年", "25〜30年", "30〜40年", "40〜50年", "50年以上",
];

const ISSUES_LIST = [
  "外壁のひび割れ・欠損",
  "外壁塗装の剥がれ・変色・汚れ",
  "屋根の劣化・雨漏り・棟板金の浮き",
  "屋上・バルコニーの防水層劣化",
  "給排水管の老朽化・詰まり・錆び",
  "電気設備の老朽化・容量不足",
  "共用廊下・階段の劣化・床の浮き",
  "エントランス・外構・駐車場の損傷",
  "サッシ・窓・ドアの劣化・歪み",
  "断熱不足・結露・カビの発生",
  "耐震補強が必要（旧耐震基準）",
  "エレベーターの老朽化・故障",
  "給湯器・設備機器の交換",
  "その他",
];

const WORK_TYPES = [
  "外壁塗装", "屋根修繕・葺き替え", "防水工事",
  "給排水工事", "電気設備工事", "内装リフォーム",
  "共用部改修", "エレベーター修繕", "耐震補強工事",
  "解体・造成", "外構・エクステリア", "その他",
];

const URGENCY_OPTIONS = [
  { value: "urgent", label: "緊急（今すぐ）", desc: "漏水・落下等の危険な状態", color: "#ef4444", bg: "#fee2e2", border: "#fecaca" },
  { value: "high", label: "高（1〜3ヶ月）", desc: "早めの対応が必要", color: "#f97316", bg: "#ffedd5", border: "#fed7aa" },
  { value: "medium", label: "中（3〜6ヶ月）", desc: "計画的に進めたい", color: "#eab308", bg: "#fefce8", border: "#fde68a" },
  { value: "low", label: "低（時期は未定）", desc: "まず見積もりだけ取りたい", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
];

const TIME_SLOTS = [
  "午前（9:00〜12:00）",
  "午後（13:00〜17:00）",
  "夕方（17:00〜19:00）",
  "土曜日",
  "日曜日・祝日",
];

const BUDGET_OPTIONS = [
  { value: "", label: "未定・相談したい" },
  { value: "50", label: "〜50万円" },
  { value: "100", label: "50〜100万円" },
  { value: "300", label: "100〜300万円" },
  { value: "500", label: "300〜500万円" },
  { value: "1000", label: "500万〜1000万円" },
  { value: "over", label: "1000万円以上" },
];

// ─────────────────────────────────────────────
// CALENDAR COMPONENT
// ─────────────────────────────────────────────
interface CalendarProps {
  selectedFrom: string | null;
  selectedTo: string | null;
  onSelect: (from: string | null, to: string | null) => void;
}

function DateRangePicker({ selectedFrom, selectedTo, onSelect }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hovered, setHovered] = useState<string | null>(null);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const getDayStr = (day: number) => fmt(new Date(viewYear, viewMonth, day));
  const todayStr = fmt(today);

  const isPast = (day: number) => getDayStr(day) < todayStr;
  const isStart = (day: number) => getDayStr(day) === selectedFrom;
  const isEnd = (day: number) => getDayStr(day) === selectedTo;
  const isInRange = (day: number) => {
    const d = getDayStr(day);
    if (selectedFrom && selectedTo) return d > selectedFrom && d < selectedTo;
    if (selectedFrom && hovered && hovered > selectedFrom) return d > selectedFrom && d < hovered;
    return false;
  };
  const isHovered = (day: number) => getDayStr(day) === hovered;

  const handleDayClick = (day: number) => {
    if (isPast(day)) return;
    const d = getDayStr(day);
    if (!selectedFrom || (selectedFrom && selectedTo)) {
      onSelect(d, null);
    } else {
      if (d < selectedFrom) { onSelect(d, selectedFrom); }
      else if (d === selectedFrom) { onSelect(null, null); }
      else { onSelect(selectedFrom, d); }
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dayNames = ["日","月","火","水","木","金","土"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", padding: "1.25rem", maxWidth: "340px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button type="button" onClick={prevMonth} style={{ background: "#f3f4f6", border: "none", borderRadius: "0.5rem", padding: "0.375rem 0.625rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
        </button>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>{viewYear}年 {monthNames[viewMonth]}</span>
        <button type="button" onClick={nextMonth} style={{ background: "#f3f4f6", border: "none", borderRadius: "0.5rem", padding: "0.375rem 0.625rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ChevronRight style={{ width: "1rem", height: "1rem" }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {dayNames.map((d, i) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#9ca3af", padding: "0.25rem 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const past = isPast(day);
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          const isToday = getDayStr(day) === todayStr;
          const hover = isHovered(day) && !selectedTo && selectedFrom;
          return (
            <button key={day} type="button"
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => !past && setHovered(getDayStr(day))}
              onMouseLeave={() => setHovered(null)}
              disabled={past}
              style={{
                padding: "0.375rem 0", border: "none",
                borderRadius: (start || end) ? "0.5rem" : "0.25rem",
                cursor: past ? "not-allowed" : "pointer",
                fontWeight: (start || end || isToday) ? 700 : 400,
                fontSize: "0.8125rem",
                color: past ? "#e5e7eb" : (start || end) ? "white" : inRange || hover ? "#1d4ed8" : isToday ? "#2563eb" : "#374151",
                background: (start || end) ? "#2563eb" : inRange || hover ? "#dbeafe" : "transparent",
                outline: isToday && !start ? "2px solid #93c5fd" : "none",
                outlineOffset: "-2px",
              }}>
              {day}
            </button>
          );
        })}
      </div>

      {(selectedFrom || selectedTo) && (
        <div style={{ marginTop: "0.875rem", padding: "0.625rem 0.875rem", background: "#eff6ff", borderRadius: "0.625rem", fontSize: "0.8125rem", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>
            {selectedFrom?.replace(/-/g, '/') ?? '開始日'} 〜 {selectedTo?.replace(/-/g, '/') ?? '終了日を選択'}
          </span>
          <button type="button" onClick={() => onSelect(null, null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
            <X style={{ width: "0.875rem", height: "0.875rem" }} />
          </button>
        </div>
      )}
      {!selectedFrom && (
        <p style={{ marginTop: "0.625rem", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
          開始日をクリック → 終了日をクリック
        </p>
      )}
      {selectedFrom && !selectedTo && (
        <p style={{ marginTop: "0.625rem", fontSize: "0.75rem", color: "#2563eb", textAlign: "center" }}>
          次に終了日をクリックしてください
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "white", borderRadius: "1rem",
  border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: "1.75rem", marginBottom: "1.5rem",
};
const labelBase: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 700,
  color: "#374151", marginBottom: "0.625rem",
};
const inputBase: React.CSSProperties = {
  border: "1px solid #d1d5db", borderRadius: "0.625rem",
  color: "#111827", background: "white",
  padding: "0.75rem 1rem", fontSize: "0.875rem",
  outline: "none", width: "100%", boxSizing: "border-box" as const,
};
const badge = (color: string, bg: string): React.CSSProperties => ({
  display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
  padding: "0.125rem 0.5rem", borderRadius: "9999px",
  color, background: bg, marginLeft: "0.375rem",
});
const Required = () => <span style={badge("#dc2626", "#fee2e2")}>必須</span>;
const Optional = () => <span style={badge("#16a34a", "#dcfce7")}>任意</span>;

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function NewPropertyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // STEP 1: Basic info
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [propertyType, setPropertyType] = useState("apartment");
  const [buildingAge, setBuildingAge] = useState("");
  const [lastRepairYear, setLastRepairYear] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [floorCount, setFloorCount] = useState("");
  const [unitCount, setUnitCount] = useState("");

  // STEP 2: Issues & work
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<string>("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  // STEP 3: Calendar / schedule
  const [inspectionFrom, setInspectionFrom] = useState<string | null>(null);
  const [inspectionTo, setInspectionTo] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [maxContractors, setMaxContractors] = useState(3);
  const [contactPref, setContactPref] = useState("email");
  const [visitNote, setVisitNote] = useState("");

  // STEP 4: Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoadingUser(false);
    });
  }, []);

  // SessionStorage restore
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("prop-new-v2");
      if (!s) return;
      const d = JSON.parse(s);
      if (d.address) setAddress(d.address);
      if (d.propertyType) setPropertyType(d.propertyType);
      if (d.buildingAge) setBuildingAge(d.buildingAge);
      if (d.lastRepairYear) setLastRepairYear(d.lastRepairYear);
      if (d.floorArea) setFloorArea(d.floorArea);
      if (d.floorCount) setFloorCount(d.floorCount);
      if (d.unitCount) setUnitCount(d.unitCount);
      if (d.selectedIssues) setSelectedIssues(d.selectedIssues);
      if (d.selectedWorkTypes) setSelectedWorkTypes(d.selectedWorkTypes);
      if (d.urgency) setUrgency(d.urgency);
      if (d.budget) setBudget(d.budget);
      if (d.description) setDescription(d.description);
      if (d.inspectionFrom) setInspectionFrom(d.inspectionFrom);
      if (d.inspectionTo) setInspectionTo(d.inspectionTo);
      if (d.timeSlots) setTimeSlots(d.timeSlots);
      if (d.maxContractors) setMaxContractors(d.maxContractors);
      if (d.contactPref) setContactPref(d.contactPref);
      if (d.visitNote) setVisitNote(d.visitNote);
      if (d.lat) setLat(d.lat);
      if (d.lng) setLng(d.lng);
    } catch {}
  }, []);

  // SessionStorage save
  useEffect(() => {
    try {
      sessionStorage.setItem("prop-new-v2", JSON.stringify({
        address, propertyType, buildingAge, lastRepairYear, floorArea, floorCount, unitCount,
        selectedIssues, selectedWorkTypes, urgency, budget, description,
        inspectionFrom, inspectionTo, timeSlots, maxContractors, contactPref, visitNote, lat, lng
      }));
    } catch {}
  }, [address, propertyType, buildingAge, lastRepairYear, floorArea, floorCount, unitCount,
    selectedIssues, selectedWorkTypes, urgency, budget, description,
    inspectionFrom, inspectionTo, timeSlots, maxContractors, contactPref, visitNote, lat, lng]);

  // Geocode — 国土地理院API（日本住所専用・高精度）
  const handleGeocode = useCallback(async () => {
    if (!address.trim()) return;
    setGeocoding(true); setGeocodeResult(null); setLat(null); setLng(null);
    try {
      // 国土地理院 住所検索API（完全無料・日本語住所特化）
      const res = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const best = data[0];
        const [lng, lat] = best.geometry.coordinates;
        setLat(lat); setLng(lng);
        const title = best.properties?.title || address;
        setGeocodeResult({ ok: true, text: `📍 ${title}` });
      } else {
        // Fallback: Mapbox geocoding
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const r2 = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=JP&language=ja&types=address&proximity=135.5,34.5&access_token=${token}`);
        const d2 = await r2.json();
        const feat = d2.features?.[0];
        if (feat) {
          setLat(feat.center[1]); setLng(feat.center[0]);
          setGeocodeResult({ ok: true, text: `📍 ${feat.place_name}` });
        } else {
          setGeocodeResult({ ok: false, text: "住所が見つかりませんでした。都道府県から番地まで入力してください。" });
        }
      }
    } catch { setGeocodeResult({ ok: false, text: "位置情報の取得に失敗しました。" }); }
    finally { setGeocoding(false); }
  }, [address]);

  const toggleIssue = (v: string) => setSelectedIssues(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const toggleWorkType = (v: string) => setSelectedWorkTypes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const toggleTimeSlot = (v: string) => setTimeSlots(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const canStep1 = address.trim() && lat && lng && buildingAge;
  const canStep2 = selectedIssues.length > 0 && selectedWorkTypes.length > 0 && urgency;
  const canSubmit = agreedToTerms && !submitting;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(p => [...p, ...files].slice(0, 5));
    if (photoRef.current) photoRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!user || !lat || !lng) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const budgetMap: Record<string, { min: number; max: number }> = {
        "50": { min: 0, max: 500000 },
        "100": { min: 500000, max: 1000000 },
        "300": { min: 1000000, max: 3000000 },
        "500": { min: 3000000, max: 5000000 },
        "1000": { min: 5000000, max: 10000000 },
        "over": { min: 10000000, max: 99999999 },
      };
      const budgetRange = budget && budget !== "over" ? budgetMap[budget] : budget === "over" ? budgetMap["over"] : null;

      const metadata = JSON.stringify({
        issues: selectedIssues,
        work_types: selectedWorkTypes,
        urgency,
        budget_label: budget,
        inspection_from: inspectionFrom,
        inspection_to: inspectionTo,
        time_slots: timeSlots,
        max_contractors: maxContractors,
        contact_preference: contactPref,
        visit_note: visitNote,
        floor_count: floorCount ? parseInt(floorCount) : null,
        unit_count: unitCount ? parseInt(unitCount) : null,
        description,
      });

      const res = await fetch(`${API_URL}/api/properties/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: user.id,
          address,
          latitude: lat,
          longitude: lng,
          property_type: propertyType,
          building_age: buildingAge ? parseInt(buildingAge) : 0,
          last_repair_year: lastRepairYear ? parseInt(lastRepairYear) : null,
          floor_area: floorArea ? parseFloat(floorArea) : null,
          current_issues: metadata,
          budget_min: budgetRange?.min ?? null,
          budget_max: budgetRange?.max ?? null,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || e.message || "投稿に失敗しました");
      }
      sessionStorage.removeItem("prop-new-v2");
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "投稿に失敗しました");
    } finally { setSubmitting(false); }
  };

  // ─── LOADING / AUTH GATE ───
  if (loadingUser) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: "2.5rem", textAlign: "center" }}>
        <div style={{ width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <Lock style={{ width: "1.75rem", height: "1.75rem", color: "#d97706" }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.75rem" }}>ログインが必要です</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>物件を掲載するにはオーナー登録が必要です。</p>
        <Link href="/owner/register" style={{ display: "block", background: "#2563eb", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1rem" }}>
          無料オーナー登録へ
        </Link>
      </div>
    </div>
  );

  // ─── SUCCESS ───
  if (submitted) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "500px", width: "100%", background: "white", borderRadius: "1.5rem", boxShadow: "0 8px 32px rgba(22,163,74,0.15)", border: "2px solid #bbf7d0", padding: "3rem 2.5rem", textAlign: "center" }}>
        <div style={{ width: "5rem", height: "5rem", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <CheckCircle style={{ width: "2.5rem", height: "2.5rem", color: "#16a34a" }} />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: "1.5rem", color: "#052e16", marginBottom: "0.75rem" }}>物件を掲載しました！</h2>
        <p style={{ color: "#16a34a", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          AIスコア上位の施工会社に自動通知されます。<br />
          {inspectionFrom && inspectionTo ? `見積もり受付期間（${inspectionFrom.replace(/-/g, '/')} 〜 ${inspectionTo.replace(/-/g, '/')}）中に業者からご連絡が届きます。` : "業者からのご連絡をお待ちください。"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/owner/mypage" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#16a34a", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none" }}>
            マイページで確認する <ArrowRight style={{ width: "1rem", height: "1rem" }} />
          </Link>
          <Link href="/owner/contractors" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#2563eb", fontWeight: 600, padding: "0.75rem", textDecoration: "none", fontSize: "0.875rem" }}>
            施工会社を検索する →
          </Link>
        </div>
      </div>
    </div>
  );

  // ─── STEP PROGRESS BAR ───
  const steps = ["基本情報", "修繕内容", "スケジュール", "確認・投稿"];

  // ─── MAIN RENDER ───
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3rem" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
            🏢 修繕案件を掲載する
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
            AIスコア上位の施工会社に自動通知。複数社から見積もりを取得できます。
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          {steps.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s} style={{ display: "flex", flex: 1, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                  <div style={{
                    width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.875rem",
                    background: done ? "#16a34a" : active ? "#2563eb" : "#e5e7eb",
                    color: done || active ? "white" : "#9ca3af",
                    transition: "all 0.3s",
                  }}>
                    {done ? <CheckCircle style={{ width: "1rem", height: "1rem" }} /> : n}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: active ? "#2563eb" : done ? "#16a34a" : "#9ca3af", fontWeight: active ? 700 : 400, marginTop: "0.25rem", whiteSpace: "nowrap" }}>
                    {s}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: "2px", background: done ? "#16a34a" : "#e5e7eb", margin: "0 0.25rem", marginBottom: "1.25rem", transition: "all 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════
            STEP 1: 物件基本情報
        ═══════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} /> 物件の住所
              </h2>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelBase}>住所（番地まで入力してください） <Required /></label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text" value={address}
                    onChange={e => { setAddress(e.target.value); setGeocodeResult(null); setLat(null); setLng(null); }}
                    placeholder="例: 東京都渋谷区神南1-2-3 ○○マンション"
                    style={{ ...inputBase, flex: 1 }}
                    onKeyDown={e => e.key === "Enter" && handleGeocode()}
                  />
                  <button type="button" onClick={handleGeocode} disabled={geocoding || !address.trim()}
                    style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "0.625rem", padding: "0.75rem 1rem", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", opacity: (!address.trim() || geocoding) ? 0.6 : 1, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    {geocoding ? <Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> : <MapPin style={{ width: "1rem", height: "1rem" }} />}
                    位置確認
                  </button>
                </div>
                {geocodeResult && (
                  <div style={{ marginTop: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", background: geocodeResult.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${geocodeResult.ok ? "#bbf7d0" : "#fecaca"}`, fontSize: "0.8125rem", color: geocodeResult.ok ? "#166534" : "#dc2626" }}>
                    {geocodeResult.text}
                  </div>
                )}
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.375rem" }}>
                  ※ 地図上のピン位置を確認するために住所の検証が必要です
                </p>
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building2 style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} /> 物件種別
                <Required />
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.5rem" }}>
                {PROPERTY_TYPES.map(pt => (
                  <button key={pt.value} type="button" onClick={() => setPropertyType(pt.value)}
                    style={{
                      padding: "1rem 0.75rem", borderRadius: "0.875rem", border: `2px solid ${propertyType === pt.value ? "#2563eb" : "#e5e7eb"}`,
                      background: propertyType === pt.value ? "#eff6ff" : "white", cursor: "pointer",
                      textAlign: "center", transition: "all 0.15s",
                    }}>
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>{pt.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: propertyType === pt.value ? "#1d4ed8" : "#374151" }}>{pt.label}</div>
                    <div style={{ fontSize: "0.6875rem", color: "#9ca3af", marginTop: "0.125rem" }}>{pt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} /> 建物の詳細
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelBase}>築年数 <Required /></label>
                  <select value={buildingAge} onChange={e => setBuildingAge(e.target.value)}
                    style={{ ...inputBase, cursor: "pointer" }}>
                    <option value="">選択してください</option>
                    {BUILDING_AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelBase}>最終修繕年（西暦）<Optional /></label>
                  <input type="number" value={lastRepairYear} onChange={e => setLastRepairYear(e.target.value)}
                    placeholder="例: 2018" min="1970" max={new Date().getFullYear()}
                    style={inputBase} />
                </div>
                <div>
                  <label style={labelBase}>延床面積 <Optional /></label>
                  <div style={{ position: "relative" }}>
                    <input type="number" value={floorArea} onChange={e => setFloorArea(e.target.value)}
                      placeholder="例: 250" style={{ ...inputBase, paddingRight: "2.5rem" }} />
                    <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.875rem" }}>㎡</span>
                  </div>
                </div>
                <div>
                  <label style={labelBase}>階数 <Optional /></label>
                  <div style={{ position: "relative" }}>
                    <input type="number" value={floorCount} onChange={e => setFloorCount(e.target.value)}
                      placeholder="例: 5" min="1" style={{ ...inputBase, paddingRight: "2.5rem" }} />
                    <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.875rem" }}>階</span>
                  </div>
                </div>
                {(propertyType === "apartment" || propertyType === "mansion") && (
                  <div>
                    <label style={labelBase}>総戸数 <Optional /></label>
                    <div style={{ position: "relative" }}>
                      <input type="number" value={unitCount} onChange={e => setUnitCount(e.target.value)}
                        placeholder="例: 20" min="1" style={{ ...inputBase, paddingRight: "2.5rem" }} />
                      <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.875rem" }}>戸</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)}
              disabled={!canStep1}
              style={{
                width: "100%", padding: "1rem", borderRadius: "0.875rem", border: "none",
                fontWeight: 800, fontSize: "1.0625rem", cursor: canStep1 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                background: canStep1 ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e5e7eb",
                color: canStep1 ? "white" : "#9ca3af",
                boxShadow: canStep1 ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
                transition: "all 0.2s",
              }}>
              次へ：修繕内容の入力 <ArrowRight style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
          </>
        )}

        {/* ═══════════════════════════════════════
            STEP 2: 問題・修繕内容
        ═══════════════════════════════════════ */}
        {step === 2 && (
          <>
            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle style={{ width: "1.25rem", height: "1.25rem", color: "#f97316" }} /> 現在の問題・気になる箇所
                <Required />
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>複数選択できます（1つ以上選択してください）</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {ISSUES_LIST.map(issue => {
                  const checked = selectedIssues.includes(issue);
                  return (
                    <button key={issue} type="button" onClick={() => toggleIssue(issue)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem 0.875rem",
                        borderRadius: "0.75rem", border: `2px solid ${checked ? "#2563eb" : "#e5e7eb"}`,
                        background: checked ? "#eff6ff" : "white", cursor: "pointer", textAlign: "left",
                      }}>
                      <div style={{ width: "1.125rem", height: "1.125rem", borderRadius: "0.25rem", border: `2px solid ${checked ? "#2563eb" : "#d1d5db"}`, background: checked ? "#2563eb" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {checked && <CheckCircle style={{ width: "0.75rem", height: "0.75rem", color: "white" }} />}
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: checked ? "#1d4ed8" : "#374151", fontWeight: checked ? 600 : 400, lineHeight: 1.4 }}>{issue}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Wrench style={{ width: "1.25rem", height: "1.25rem", color: "#7c3aed" }} /> 希望する工種
                <Required />
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>見積もりを依頼したい工事の種類を選んでください</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {WORK_TYPES.map(wt => {
                  const checked = selectedWorkTypes.includes(wt);
                  return (
                    <button key={wt} type="button" onClick={() => toggleWorkType(wt)}
                      style={{
                        padding: "0.5rem 1rem", borderRadius: "9999px",
                        border: `2px solid ${checked ? "#7c3aed" : "#e5e7eb"}`,
                        background: checked ? "#f5f3ff" : "white",
                        color: checked ? "#6d28d9" : "#374151",
                        fontWeight: checked ? 700 : 400, fontSize: "0.875rem",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      {wt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Zap style={{ width: "1.25rem", height: "1.25rem", color: "#ef4444" }} /> 緊急度 <Required />
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {URGENCY_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setUrgency(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.125rem",
                      borderRadius: "0.875rem", border: `2px solid ${urgency === opt.value ? opt.color : "#e5e7eb"}`,
                      background: urgency === opt.value ? opt.bg : "white", cursor: "pointer", textAlign: "left",
                    }}>
                    <div style={{ width: "0.875rem", height: "0.875rem", borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: urgency === opt.value ? opt.color : "#374151" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} /> 予算感・詳細
              </h2>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelBase}>おおよその予算感 <Optional /></label>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "0.5rem" }}>
                  {BUDGET_OPTIONS.map(b => (
                    <button key={b.value} type="button" onClick={() => setBudget(b.value)}
                      style={{
                        padding: "0.625rem 0.25rem", borderRadius: "0.625rem", textAlign: "center",
                        border: `2px solid ${budget === b.value ? "#2563eb" : "#e5e7eb"}`,
                        background: budget === b.value ? "#eff6ff" : "white",
                        color: budget === b.value ? "#1d4ed8" : "#374151",
                        fontWeight: budget === b.value ? 700 : 400, fontSize: "0.75rem", cursor: "pointer",
                      }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelBase}>詳細説明・特記事項 <Optional /></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="修繕箇所の詳細、気になる点、希望する工法など自由にご記入ください&#10;&#10;例: 3階北側の外壁に複数のひび割れがあります。雨の後に若干の染みが確認できます。できるだけ早めに対応したいと考えています。"
                  rows={5}
                  style={{ ...inputBase, resize: "vertical" as const, minHeight: "120px" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.375rem" }}>詳しく書くほど、業者からの提案の質が上がります</p>
              </div>

              <div>
                <label style={labelBase}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Camera style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
                    写真の添付 <Optional />
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 400 }}>（最大5枚）</span>
                  </span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-start" }}>
                  {photos.map((f, i) => (
                    <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }} />
                      <button type="button" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                        style={{ position: "absolute", top: "-6px", right: "-6px", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#ef4444", border: "2px solid white", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                        <X style={{ width: "0.625rem", height: "0.625rem" }} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <button type="button" onClick={() => photoRef.current?.click()}
                      style={{ width: "80px", height: "80px", borderRadius: "0.5rem", border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem", color: "#9ca3af" }}>
                      <Camera style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span style={{ fontSize: "0.6875rem" }}>追加</span>
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoAdd} />
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.5rem" }}>劣化箇所・外観・施工したい場所の写真をアップロードすると見積もりの精度が上がります</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ flex: "0 0 auto", padding: "1rem 1.25rem", borderRadius: "0.875rem", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <ChevronLeft style={{ width: "1rem", height: "1rem" }} /> 戻る
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!canStep2}
                style={{
                  flex: 1, padding: "1rem", borderRadius: "0.875rem", border: "none",
                  fontWeight: 800, fontSize: "1.0625rem", cursor: canStep2 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  background: canStep2 ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e5e7eb",
                  color: canStep2 ? "white" : "#9ca3af",
                  boxShadow: canStep2 ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
                }}>
                次へ：見積もりスケジュール <ArrowRight style={{ width: "1.125rem", height: "1.125rem" }} />
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════
            STEP 3: カレンダー・スケジュール
        ═══════════════════════════════════════ */}
        {step === 3 && (
          <>
            {/* 説明 */}
            <div style={{ background: "linear-gradient(135deg, #eff6ff, #f0f9ff)", borderRadius: "1rem", border: "2px solid #bfdbfe", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", background: "#2563eb", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "1rem", marginBottom: "0.5rem" }}>
                    📅 現地調査・見積もりの日程設定（強く推奨）
                  </h3>
                  <p style={{ color: "#1d4ed8", fontSize: "0.8125rem", lineHeight: 1.7 }}>
                    業者が<strong>直接訪問して見積もりを取る期間</strong>を設定すると、<strong>より正確で詳細な見積もり</strong>が届きます。
                    オーナー様は<strong>現場に立ち会わなくてもOK</strong>（立会い希望の場合はその旨をメモ欄に記載）。
                    複数の業者が同じ期間に訪問し、それぞれから見積書が届きます。
                  </p>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                    {["立会い不要で複数社の見積もりが取れる", "業者との直接交渉が不要", "最大3社まで設定可能"].map(t => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#1d4ed8", fontWeight: 600 }}>
                        <CheckCircle style={{ width: "0.875rem", height: "0.875rem", color: "#16a34a", flexShrink: 0 }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} /> 見積もり受付期間
                <Optional />
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>
                この期間中に業者が現地調査に訪問できます。日付をクリックして開始日と終了日を選んでください。
              </p>
              <DateRangePicker
                selectedFrom={inspectionFrom}
                selectedTo={inspectionTo}
                onSelect={(f, t) => { setInspectionFrom(f); setInspectionTo(t); }}
              />
              {inspectionFrom && inspectionTo && (
                <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", background: "#f0fdf4", borderRadius: "0.75rem", border: "1px solid #bbf7d0" }}>
                  <p style={{ color: "#15803d", fontSize: "0.8125rem", fontWeight: 600 }}>
                    ✅ 受付期間設定済み: {inspectionFrom.replace(/-/g, '/')} 〜 {inspectionTo.replace(/-/g, '/')}
                  </p>
                  <p style={{ color: "#16a34a", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    この期間に最大{maxContractors}社の施工会社が訪問し、見積もりを提出します
                  </p>
                </div>
              )}
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock style={{ width: "1.25rem", height: "1.25rem", color: "#7c3aed" }} /> 訪問可能な時間帯
                <Optional />
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>業者が訪問できる時間帯を選んでください（複数選択可）</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {TIME_SLOTS.map(ts => {
                  const checked = timeSlots.includes(ts);
                  return (
                    <button key={ts} type="button" onClick={() => toggleTimeSlot(ts)}
                      style={{
                        padding: "0.5rem 1rem", borderRadius: "9999px",
                        border: `2px solid ${checked ? "#7c3aed" : "#e5e7eb"}`,
                        background: checked ? "#f5f3ff" : "white",
                        color: checked ? "#6d28d9" : "#374151",
                        fontWeight: checked ? 700 : 400, fontSize: "0.875rem", cursor: "pointer",
                      }}>
                      {ts}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a" }} /> 見積もりを受ける施工会社数
                <Optional />
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <button type="button" onClick={() => setMaxContractors(m => Math.max(1, m - 1))}
                  style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", border: "2px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.25rem", color: "#374151" }}>
                  −
                </button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#111827" }}>{maxContractors}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>社</div>
                </div>
                <button type="button" onClick={() => setMaxContractors(m => Math.min(5, m + 1))}
                  style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", border: "2px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.25rem", color: "#374151" }}>
                  +
                </button>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "0.8125rem", marginTop: "0.75rem" }}>
                複数社から見積もりを取ることで、適正価格の判断がしやすくなります（推奨: 3社）
              </p>
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail style={{ width: "1.25rem", height: "1.25rem", color: "#f97316" }} /> 連絡先の希望 <Optional />
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem" }}>
                {[
                  { value: "email", label: "メールのみ希望", desc: "見積書をメールで受け取ります（プライバシーを重視）", icon: Mail },
                  { value: "phone", label: "電話・メール両方OK", desc: "業者から直接電話での連絡も受け付けます", icon: Phone },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setContactPref(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 1rem",
                      borderRadius: "0.875rem", border: `2px solid ${contactPref === opt.value ? "#f97316" : "#e5e7eb"}`,
                      background: contactPref === opt.value ? "#fff7ed" : "white", cursor: "pointer", textAlign: "left",
                    }}>
                    <opt.icon style={{ width: "1.25rem", height: "1.25rem", color: contactPref === opt.value ? "#ea580c" : "#9ca3af", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: contactPref === opt.value ? "#c2410c" : "#374151" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label style={labelBase}>業者への特記事項・メモ <Optional /></label>
                <textarea value={visitNote} onChange={e => setVisitNote(e.target.value)}
                  placeholder="例: 管理人への声かけが必要です / 立会い希望のため事前にメールで日程調整をお願いします / 駐車場は建物前に1台分空きがあります"
                  rows={3}
                  style={{ ...inputBase, resize: "vertical" as const }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(2)}
                style={{ flex: "0 0 auto", padding: "1rem 1.25rem", borderRadius: "0.875rem", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <ChevronLeft style={{ width: "1rem", height: "1rem" }} /> 戻る
              </button>
              <button type="button" onClick={() => setStep(4)}
                style={{
                  flex: 1, padding: "1rem", borderRadius: "0.875rem", border: "none",
                  fontWeight: 800, fontSize: "1.0625rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                }}>
                次へ：内容確認 <ArrowRight style={{ width: "1.125rem", height: "1.125rem" }} />
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════
            STEP 4: 確認・投稿
        ═══════════════════════════════════════ */}
        {step === 4 && (
          <>
            <div style={card}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.5rem" }}>📋 入力内容の確認</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "住所", value: address },
                  { label: "物件種別", value: PROPERTY_TYPES.find(p => p.value === propertyType)?.label },
                  { label: "築年数", value: buildingAge ? `${buildingAge}年` : "未入力" },
                  { label: "延床面積", value: floorArea ? `${floorArea}㎡` : "未入力" },
                  { label: "階数", value: floorCount ? `${floorCount}階` : "未入力" },
                  { label: "問題箇所", value: selectedIssues.join("、") || "未選択" },
                  { label: "希望工種", value: selectedWorkTypes.join("、") || "未選択" },
                  { label: "緊急度", value: URGENCY_OPTIONS.find(u => u.value === urgency)?.label || "未選択" },
                  { label: "予算感", value: BUDGET_OPTIONS.find(b => b.value === budget)?.label || "未設定" },
                  { label: "見積もり受付期間", value: (inspectionFrom && inspectionTo) ? `${inspectionFrom.replace(/-/g, '/')} 〜 ${inspectionTo.replace(/-/g, '/')}` : "設定なし" },
                  { label: "希望時間帯", value: timeSlots.length > 0 ? timeSlots.join("、") : "指定なし" },
                  { label: "施工会社数", value: `最大 ${maxContractors}社` },
                  { label: "連絡先希望", value: contactPref === "email" ? "メールのみ" : "電話・メール両方OK" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ width: "120px", flexShrink: 0, fontSize: "0.8125rem", color: "#9ca3af", fontWeight: 600 }}>{row.label}</div>
                    <div style={{ flex: 1, fontSize: "0.875rem", color: "#111827", wordBreak: "break-all" }}>{row.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}>
                  修正する →
                </button>
              </div>
            </div>

            {/* 利用規約 */}
            <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "#052e16", fontSize: "0.9375rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield style={{ width: "1rem", height: "1rem", color: "#16a34a" }} /> 掲載に関する同意事項
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  "掲載情報（住所・修繕内容）は有料プランに登録済みの有料プランの施工会社が閲覧できます",
                  "開示されるオーナー様の個人情報はメールアドレスのみです",
                  "見積もりを受け取る義務はなく、断ることも自由です",
                  "掲載した物件はマイページからいつでも削除できます",
                  "AI診断結果はあくまで参考情報であり、正確な費用は現場調査後の見積書にてご確認ください",
                ].map((t, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "#374151", lineHeight: 1.6 }}>
                    <CheckCircle style={{ width: "0.875rem", height: "0.875rem", color: "#16a34a", flexShrink: 0, marginTop: "0.2rem" }} />
                    {t}
                  </li>
                ))}
              </ul>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                  style={{ width: "1.125rem", height: "1.125rem", marginTop: "0.125rem", accentColor: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#052e16", lineHeight: 1.5 }}>
                  上記の同意事項を確認し、案件を掲載することに同意します
                </span>
              </label>
            </div>

            {submitError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#dc2626", fontSize: "0.875rem" }}>
                <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(3)}
                style={{ flex: "0 0 auto", padding: "1rem 1.25rem", borderRadius: "0.875rem", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <ChevronLeft style={{ width: "1rem", height: "1rem" }} /> 戻る
              </button>
              <button type="button" onClick={handleSubmit} disabled={!canSubmit}
                style={{
                  flex: 1, padding: "1rem", borderRadius: "0.875rem", border: "none",
                  fontWeight: 800, fontSize: "1.0625rem", cursor: canSubmit ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  background: canSubmit ? "linear-gradient(135deg, #16a34a, #15803d)" : "#e5e7eb",
                  color: canSubmit ? "white" : "#9ca3af",
                  boxShadow: canSubmit ? "0 4px 16px rgba(22,163,74,0.35)" : "none",
                  transition: "all 0.2s",
                }}>
                {submitting ? (
                  <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} /> 投稿中...</>
                ) : (
                  <><BadgeCheck style={{ width: "1.125rem", height: "1.125rem" }} /> 案件を掲載する</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
