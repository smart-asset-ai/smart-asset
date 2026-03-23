"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AIMascot from "@/components/AIMascot";
import {
  Brain, FileText,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Info,
  Search,
  Building2,
} from "lucide-react";
import Link from "next/link";
import AdSense from "@/components/AdSense";

interface DiagnosisPart {
  name: string;
  status: string;
  score: number;
  work_type?: string;
  description: string;
  estimated_cost: string;
  cost_basis?: string;
}

interface DiagnosisResult {
  ai_score: number;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  details: string;
  parts: DiagnosisPart[];
  estimated_total: string;
  estimated_total_basis?: string;
  info_needed?: string;
  timeline: string;
  recommended_actions: string[];
  work_types: string[];
  risk_factors: string[];
  strengths: string[];
}

const SEVERITY_CONFIG = {
  low: { label: "軽微", icon: CheckCircle, bg: "rgba(16,185,129,0.12)", border: "rgba(52,211,153,0.35)", text: "#065f46" },
  medium: { label: "要注意", icon: Info, bg: "rgba(245,158,11,0.12)", border: "rgba(252,211,77,0.35)", text: "#92400e" },
  high: { label: "要修繕", icon: AlertTriangle, bg: "rgba(249,115,22,0.12)", border: "rgba(253,186,116,0.35)", text: "#9a3412" },
  critical: { label: "緊急対応", icon: AlertTriangle, bg: "rgba(239,68,68,0.12)", border: "rgba(252,165,165,0.35)", text: "#991b1b" },
};

const BUILDING_TYPES = ["賃貸マンション", "分譲マンション", "アパート", "一戸建て", "その他"];
const BUILDING_AGE_OPTIONS = ["5年未満", "5〜10年", "10〜20年", "20〜30年", "30〜40年", "40年以上"];
const REPAIR_AGE_OPTIONS = ["1年以内", "2〜3年前", "4〜5年前", "6〜10年前", "10年以上前", "実施なし・不明"];

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "1rem",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const inputBase: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "0.5rem",
  color: "#111827",
  background: "white",
  padding: "0.625rem 0.875rem",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.5rem",
};

export default function DiagnosisPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [buildingType, setBuildingType] = useState("賃貸マンション");
  const [buildingAge, setBuildingAge] = useState("");
  const [buildingAgeManual, setBuildingAgeManual] = useState("");
  const [lastRepair, setLastRepair] = useState("");
  const [lastRepairManual, setLastRepairManual] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [floors, setFloors] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [postalLoading, setPostalLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [ctaAgreed, setCtaAgreed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const lookupPostalCode = useCallback(async (code: string) => {
    const digits = code.replace(/[^0-9]/g, "");
    if (digits.length !== 7) return;
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        const r = data.results[0];
        setPostalAddress(`${r.address1}${r.address2}${r.address3}`);
      }
    } catch { /* silently fail */ }
    finally { setPostalLoading(false); }
  }, []);

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPostalCode(val);
    setPostalAddress("");
    const digits = val.replace(/[^0-9]/g, "");
    if (digits.length === 7) lookupPostalCode(digits);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const base64 = image ? preview.split(",")[1] : null;
      const mediaType = image ? (image.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp") : null;
      const ageLabel = buildingAgeManual ? `築${buildingAgeManual}年` : buildingAge;
      const repairLabel = lastRepairManual ? `${lastRepairManual}年前` : lastRepair;
      const contextDesc = [
        postalAddress && `物件所在地: ${postalAddress}`,
        ageLabel && `築年数: ${ageLabel}`,
        repairLabel && `前回大規模修繕: ${repairLabel}`,
        description,
      ].filter(Boolean).join("\n");
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mediaType,
          description,
          buildingType,
          buildingAge: buildingAgeManual ? `築${buildingAgeManual}年` : buildingAge,
          lastRepair: lastRepairManual ? `${lastRepairManual}年前` : lastRepair,
          floorArea,
          floors,
          location: postalAddress ? postalAddress + streetAddress : "",
        }),
      });
      if (!response.ok) throw new Error("診断に失敗しました");
      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "診断中にエラーが発生しました");
    } finally {
      setAnalyzing(false);
    }
  };

  // Restore form from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('diagnosis-form');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.postalCode) setPostalCode(d.postalCode);
        if (d.postalAddress) setPostalAddress(d.postalAddress);
        if (d.streetAddress) setStreetAddress(d.streetAddress);
        if (d.buildingName) setBuildingName(d.buildingName);
        if (d.buildingType) setBuildingType(d.buildingType);
        if (d.buildingAge) setBuildingAge(d.buildingAge);
        if (d.buildingAgeManual) setBuildingAgeManual(d.buildingAgeManual);
        if (d.lastRepair) setLastRepair(d.lastRepair);
        if (d.lastRepairManual) setLastRepairManual(d.lastRepairManual);
        if (d.floorArea) setFloorArea(d.floorArea);
        if (d.floors) setFloors(d.floors);
        if (d.description) setDescription(d.description);
      }
    } catch {}
  }, []);

  // Save form to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem('diagnosis-form', JSON.stringify({
        postalCode, postalAddress, streetAddress, buildingName,
        buildingType, buildingAge, buildingAgeManual,
        lastRepair, lastRepairManual, floorArea, floors, description,
      }));
    } catch {}
  }, [postalCode, postalAddress, streetAddress, buildingName, buildingType,
      buildingAge, buildingAgeManual, lastRepair, lastRepairManual,
      floorArea, floors, description]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const hasAge = !!buildingAge || !!buildingAgeManual;
  const hasPostal = postalCode.replace(/[^0-9]/g, '').length === 7;
  const hasStreet = streetAddress.trim() !== '';
  // buildingType always has a value (defaults to 賃貸マンション)
  const canSubmit = agreedToTerms && !analyzing && hasAge && hasPostal && hasStreet;

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ===== HERO ===== */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #2563eb 100%)", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <Brain style={{ width: "2rem", height: "2rem", color: "white" }} />
          </div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.2rem 0.875rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.75rem" }}>
            ✨ 登録不要 · 第三者AIが客観的に算出
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)", fontWeight: 900, color: "white", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            AI建物<span style={{ color: "#16a34a" }}>無料診断</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "1.5rem" }}>
            「この見積もり、高すぎないか？」不安なオーナー様へ。AIが第三者として建物の状態と適正費用を客観的に分析します。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {[
              { icon: "🔍", text: "劣化箇所の特定" },
              { icon: "💰", text: "適正費用の算出" },
              { icon: "⚠️", text: "緊急度の評価" },
              { icon: "🏗️", text: "業者マッチング" },
            ].map(f => (
              <span key={f.text} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.3rem 0.875rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.9)" }}>
                {f.icon} {f.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <div style={{ background: "#f1f5f9" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1.25rem" }}>

          {/* ---- Card 1: 写真アップロード ---- */}
          <div style={card}>
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Upload style={{ width: "1.125rem", height: "1.125rem", color: "#2563eb" }} />
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>診断する箇所の写真</h2>
              </div>
              <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #bbf7d0", flexShrink: 0 }}>任意</span>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: "1rem", lineHeight: 1.6 }}>
              📸 <strong style={{ color: "#374151" }}>写真があると診断精度が上がります。</strong>&nbsp;できるだけ近くから、複数アングルで撮影した写真をお使いください。
            </p>

            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: "2px dashed #d1d5db", borderRadius: "0.875rem", background: "#f9fafb", padding: "2.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#93c5fd";
                  (e.currentTarget as HTMLDivElement).style.background = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#d1d5db";
                  (e.currentTarget as HTMLDivElement).style.background = "#f9fafb";
                }}
              >
                <div style={{ width: "4rem", height: "4rem", borderRadius: "1rem", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload style={{ width: "2rem", height: "2rem", color: "#4f46e5" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>クリックまたはドラッグ＆ドロップ</p>
                  <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>JPG・PNG・WEBP（最大10MB）</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {["外壁ひび割れ", "屋根・防水", "設備機器", "室内の損傷"].map((hint) => (
                    <span key={hint} style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "0.75rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", border: "1px solid #e5e7eb" }}>
                      {hint}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="診断画像"
                  style={{ width: "100%", maxHeight: "16rem", objectFit: "contain", borderRadius: "0.875rem", background: "#f3f4f6", display: "block" }}
                />
                <button
                  onClick={() => { setImage(null); setPreview(""); setResult(null); }}
                  style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "2rem", height: "2rem", borderRadius: "9999px", background: "#ef4444", border: "1px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X style={{ width: "1rem", height: "1rem", color: "white" }} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: "absolute", bottom: "0.5rem", right: "0.5rem", background: "white", border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}
                >
                  <ImageIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                  変更
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
          </div>

          {/* ---- Card 2: 建物情報 ---- */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>建物情報</h2>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", fontSize: "0.7rem", padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #bbf7d0", flexShrink: 0 }}>任意（入力で精度向上）</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "1.25rem" }}>詳しく入力するほど、精度の高い費用試算と的確な業者マッチングが可能になります。</p>

            {/* 区切り線 */}
            <div style={{ borderTop: "1px solid #f3f4f6", marginBottom: "1.25rem" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* 郵便番号 */}
              <div>
                <label style={{ ...labelBase, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  郵便番号
                  <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #fca5a5", flexShrink: 0 }}>必須</span>
                  <span style={{ color: "#2563eb", fontWeight: 400, fontSize: "0.75rem" }}>入力で住所を自動補完</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={handlePostalChange}
                      placeholder="000-0000"
                      maxLength={8}
                      style={{ ...inputBase, width: "10rem", paddingLeft: "2.25rem" }}
                    />
                    {postalLoading && (
                      <Loader2 className="animate-spin" style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#60a5fa" }} />
                    )}
                  </div>
                  {postalAddress && (
                    <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontSize: "0.875rem", color: "#1d4ed8", fontWeight: 500 }}>
                      📍 {postalAddress}
                    </span>
                  )}
                </div>
                {postalAddress && (
                  <div style={{ marginTop: "0.625rem", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "0.5rem", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", color: "#92400e" }}>
                    📍 住所情報は業者検索マップに公開されます。詳細住所（部屋番号等）は入力不要です。
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.875rem" }}>
                  <div>
                    <label style={{ ...labelBase, fontWeight: 600, color: "#374151", fontSize: "0.8125rem" }}>番地以降 <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: "9999px", padding: "0.125rem 0.5rem", fontSize: "0.6875rem", fontWeight: 700, marginLeft: "0.375rem" }}>必須</span></label>
                    <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="例: 1-2-3" style={{ ...inputBase, width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ ...labelBase, fontWeight: 400, color: "#6b7280", fontSize: "0.8125rem" }}>建物名</label>
                    <input type="text" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="例: ○○マンション" style={{ ...inputBase, width: "100%" }} />
                  </div>
                </div>
              </div>

              {/* 建物種別 */}
              <div>
                <label style={{ ...labelBase, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  建物種別
                  <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #fca5a5", flexShrink: 0 }}>必須</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {BUILDING_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBuildingType(type)}
                      style={
                        buildingType === type
                          ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "1px solid #1d4ed8", color: "white", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }
                          : { background: "white", border: "1px solid #d1d5db", color: "#374151", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem", cursor: "pointer" }
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 築年数 */}
              <div>
                <label style={{ ...labelBase, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  築年数
                  <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: "1px solid #fca5a5", flexShrink: 0 }}>必須</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                  <select
                    value={buildingAge}
                    onChange={(e) => { setBuildingAge(e.target.value); setBuildingAgeManual(""); }}
                    style={{ ...inputBase, cursor: "pointer" }}
                  >
                    <option value="">選択してください</option>
                    {BUILDING_AGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>または</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="number"
                      value={buildingAgeManual}
                      onChange={(e) => { setBuildingAgeManual(e.target.value); setBuildingAge(""); }}
                      placeholder="25"
                      min="1" max="100"
                      style={{ ...inputBase, width: "5rem", textAlign: "center" }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>年</span>
                  </div>
                </div>
              </div>

              {/* 延べ床面積・階数 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelBase}>延べ床面積 <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "9999px", padding: "0.125rem 0.5rem", fontSize: "0.6875rem", fontWeight: 700, marginLeft: "0.375rem" }}>任意</span></label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="number"
                      value={floorArea}
                      onChange={(e) => setFloorArea(e.target.value)}
                      placeholder="例: 450"
                      min="1"
                      style={{ ...inputBase, flex: 1 }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>m²</span>
                  </div>
                </div>
                <div>
                  <label style={labelBase}>階数 <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "9999px", padding: "0.125rem 0.5rem", fontSize: "0.6875rem", fontWeight: 700, marginLeft: "0.375rem" }}>任意</span></label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="number"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      placeholder="例: 10"
                      min="1"
                      style={{ ...inputBase, flex: 1 }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>階</span>
                  </div>
                </div>
              </div>

              {/* 前回の大規模修繕時期 */}
              <div>
                <label style={labelBase}>前回の大規模修繕時期</label>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                  <select
                    value={lastRepair}
                    onChange={(e) => { setLastRepair(e.target.value); setLastRepairManual(""); }}
                    style={{ ...inputBase, cursor: "pointer" }}
                  >
                    <option value="">選択してください</option>
                    {REPAIR_AGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>または</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="number"
                      value={lastRepairManual}
                      onChange={(e) => { setLastRepairManual(e.target.value); setLastRepair(""); }}
                      placeholder="8"
                      min="1" max="100"
                      style={{ ...inputBase, width: "5rem", textAlign: "center" }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>年前</span>
                  </div>
                </div>
              </div>

              {/* 補足説明 */}
              <div>
                <label style={labelBase}>
                  補足説明
                  <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.75rem", marginLeft: "0.375rem" }}>（任意）</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="前回の大規模修繕の内容、現在の劣化状況、気になる点など"
                  rows={3}
                  style={{ ...inputBase, width: "100%", resize: "none", lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>

          {/* ---- 利用規約同意 ---- */}
          <div style={{ ...card, padding: "1rem 1.5rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: "0.125rem", width: "1rem", height: "1rem", accentColor: "#2563eb", flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>
                <Link href="/terms" target="_blank" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>利用規約</Link>
                に同意します。診断内容はAIによる参考情報であり、正確な費用は現場調査後の見積もりをご確認ください。
              </span>
            </label>
          </div>

          {/* ---- 診断ボタン ---- */}
          <button
            onClick={handleAnalyze}
            disabled={!canSubmit}
            style={{
              width: "100%",
              background: canSubmit
                ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                : "#e5e7eb",
              color: canSubmit ? "white" : "#9ca3af",
              fontWeight: 700,
              borderRadius: "0.875rem",
              padding: "1rem",
              fontSize: "1.125rem",
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              boxShadow: canSubmit ? "0 4px 16px rgba(37,99,235,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" style={{ width: "1.25rem", height: "1.25rem" }} />
                AIが分析中... しばらくお待ちください
              </>
            ) : (
              <>
                <Brain style={{ width: "1.25rem", height: "1.25rem" }} />
                AI無料診断をスタート
              </>
            )}
          </button>

          {/* エラー */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#dc2626", marginBottom: "1.25rem" }}>
              <AlertTriangle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* AdSense */}
          {result && (
            <AdSense
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DIAGNOSIS || "1111111111"}
              format="auto"
              className="my-4"
            />
          )}

          {/* 診断結果 */}
          {result && (() => {
            const cfg = SEVERITY_CONFIG[result.severity];
            const score = result.ai_score ?? 50;
            const scoreColor = score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : score >= 30 ? "#ea580c" : "#dc2626";
            const partStatusCfg: Record<string, { color: string; bg: string; border: string }> = {
              "良好": { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" },
              "要観察": { color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
              "要修繕": { color: "#ea580c", bg: "#ffedd5", border: "#fed7aa" },
              "緊急": { color: "#dc2626", bg: "#fee2e2", border: "#fecaca" },
            };
            const hasEnoughInfo = !result.info_needed;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* レポートカード — モックと同じデザイン */}
                <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", overflow: "hidden" }}>

                  {/* カードヘッダー */}
                  <div style={{ background: "linear-gradient(135deg, #0f2460, #2563eb)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "2rem", height: "2rem", background: "rgba(255,255,255,0.45)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Brain style={{ width: "1.125rem", height: "1.125rem", color: "white" }} />
                    </div>
                    <div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "0.9375rem" }}>AI建物診断レポート</div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>診断完了 · {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}</div>
                    </div>
                    <button onClick={() => window.print()}
                      style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "0.5rem", padding: "0.25rem 0.75rem", color: "white", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      PDF保存
                    </button>
                  </div>

                  {/* スコアエリア */}
                  <div style={{ background: "linear-gradient(135deg, #e0f2fe, #bfdbfe)", padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {score < 60 && (
                        <div style={{ background: "#fee2e2", borderRadius: "0.5rem", padding: "0.25rem 0.625rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <AlertTriangle style={{ width: "0.75rem", height: "0.75rem", color: "#dc2626" }} />
                          <span style={{ color: "#dc2626", fontSize: "0.6875rem", fontWeight: 700 }}>
                            {result.parts?.filter(p => p.status === "要修繕" || p.status === "緊急").length || 0}件の問題あり
                          </span>
                        </div>
                      )}
                      <div style={{ background: "#dcfce7", borderRadius: "0.5rem", padding: "0.25rem 0.625rem" }}>
                        <span style={{ color: "#166534", fontSize: "0.6875rem", fontWeight: 700 }}>🏠 {buildingType}</span>
                      </div>
                    </div>
                    <div style={{ background: scoreColor, borderRadius: "0.875rem", padding: "0.625rem 0.875rem", textAlign: "center", minWidth: "5rem" }}>
                      <div style={{ color: "white", fontSize: "1.875rem", fontWeight: 900, lineHeight: 1 }}>{score}</div>
                      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.6875rem", fontWeight: 700 }}>AIスコア</div>
                    </div>
                  </div>

                  <div style={{ padding: "1.25rem" }}>
                    {/* サマリー */}
                    <div style={{ background: cfg.bg, borderRadius: "0.875rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", border: `1px solid ${cfg.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                        <span style={{ background: "white", color: cfg.text, fontSize: "0.75rem", fontWeight: 800, padding: "0.2rem 0.625rem", borderRadius: "9999px", border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                        {result.timeline && <span style={{ color: cfg.text, fontSize: "0.75rem", fontWeight: 600 }}>🕐 {result.timeline}</span>}
                      </div>
                      <p style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.65, fontWeight: 500 }}>{result.summary}</p>
                    </div>

                    {/* 部位別診断テーブル */}
                    {result.parts && result.parts.length > 0 && (
                      <div style={{ marginBottom: "1.25rem" }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#374151", marginBottom: "0.625rem" }}>🔍 AI診断結果（部位別）</p>
                        {result.parts.map((part, i) => {
                          const pCfg = partStatusCfg[part.status] || { color: "#6b7280", bg: "#f1f5f9", border: "#e5e7eb" };
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0", borderBottom: "1px solid #f1f5f9" }}>
                              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", width: "3.5rem", flexShrink: 0 }}>{part.name}</span>
                              <span style={{ background: pCfg.bg, color: pCfg.color, border: `1px solid ${pCfg.border}`, fontSize: "0.6875rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", flexShrink: 0 }}>{part.status}</span>
                              <span style={{ fontSize: "0.8125rem", color: "#6b7280", flex: 1, minWidth: 0 }}>{part.work_type || part.description.slice(0, 12)}</span>
                              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827", flexShrink: 0 }}>{part.estimated_cost}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 情報不足メッセージ */}
                    {result.info_needed && (
                      <div style={{ background: "#fef3c7", borderRadius: "0.875rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", border: "1px solid #fde68a", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <Info style={{ width: "1rem", height: "1rem", color: "#d97706", flexShrink: 0, marginTop: "0.125rem" }} />
                        <p style={{ fontSize: "0.8125rem", color: "#713f12", lineHeight: 1.6 }}>
                          <strong>より正確な診断のために：</strong> {result.info_needed}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <Link
                      href={user
                        ? `/owner/contractors?work_type=${encodeURIComponent(result.work_types?.[0] || "")}&addr=${encodeURIComponent(postalAddress + streetAddress)}`
                        : `/owner/register?from=diagnosis`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: "0.875rem", padding: "0.875rem 1.25rem", textDecoration: "none" }}>
                      <div>
                        <p style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>近くの施工会社を探す</p>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem" }}>AIスコア上位3社を表示</p>
                      </div>
                      <ArrowRight style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
                    </Link>
                  </div>
                </div>

                {/* 詳細分析 */}
                <div style={card}>
                  <h3 style={{ fontWeight: 800, color: "#111827", marginBottom: "0.875rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText style={{ width: "1.125rem", height: "1.125rem", color: "#6366f1" }} /> 詳細分析
                  </h3>
                  <p style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.8, whiteSpace: "pre-line" }}>{result.details}</p>
                </div>

                {/* リスク / 強み */}
                {((result.risk_factors?.length || 0) > 0 || (result.strengths?.length || 0) > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {(result.risk_factors?.length || 0) > 0 && (
                      <div style={{ background: "#fef2f2", borderRadius: "1rem", padding: "1rem 1.125rem", border: "1px solid #fecaca" }}>
                        <h4 style={{ fontWeight: 800, color: "#991b1b", fontSize: "0.875rem", marginBottom: "0.625rem" }}>⚠️ リスク要因</h4>
                        {result.risk_factors!.map((r, i) => <div key={i} style={{ display: "flex", gap: "0.375rem", fontSize: "0.8125rem", color: "#7f1d1d", marginBottom: "0.375rem", lineHeight: 1.5 }}><span style={{ flexShrink: 0 }}>•</span>{r}</div>)}
                      </div>
                    )}
                    {(result.strengths?.length || 0) > 0 && (
                      <div style={{ background: "#f0fdf4", borderRadius: "1rem", padding: "1rem 1.125rem", border: "1px solid #bbf7d0" }}>
                        <h4 style={{ fontWeight: 800, color: "#166534", fontSize: "0.875rem", marginBottom: "0.625rem" }}>✅ 良好な点</h4>
                        {result.strengths!.map((s, i) => <div key={i} style={{ display: "flex", gap: "0.375rem", fontSize: "0.8125rem", color: "#14532d", marginBottom: "0.375rem", lineHeight: 1.5 }}><span style={{ flexShrink: 0 }}>•</span>{s}</div>)}
                      </div>
                    )}
                  </div>
                )}

                {/* 総費用 + 推奨アクション */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div style={card}>
                    <h3 style={{ fontWeight: 800, color: "#111827", marginBottom: "0.625rem", fontSize: "1rem" }}>💰 総修繕費概算</h3>
                    <p style={{ fontSize: "1.375rem", fontWeight: 900, color: "#1d4ed8", lineHeight: 1.2, marginBottom: "0.5rem" }}>{result.estimated_total}</p>
                    {result.estimated_total_basis && (
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.5, background: "#f8fafc", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                        📐 {result.estimated_total_basis}
                      </p>
                    )}
                  </div>
                  <div style={card}>
                    <h3 style={{ fontWeight: 800, color: "#111827", marginBottom: "0.625rem", fontSize: "1rem" }}>📌 推奨アクション</h3>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {result.recommended_actions?.slice(0, 5).map((action, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem" }}>
                          <CheckCircle style={{ width: "0.875rem", height: "0.875rem", color: "#22c55e", marginTop: "0.1875rem", flexShrink: 0 }} />
                          <span style={{ color: "#374151", lineHeight: 1.5 }}>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem" }}>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    対応可能な工事: <strong style={{ color: "#0f172a" }}>{result.work_types.join("・")}</strong>
                  </p>

                  {/* 利用規約同意 */}
                  {!user && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.75rem", padding: "0.875rem 1rem", marginBottom: "1rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={ctaAgreed}
                        onChange={(e) => setCtaAgreed(e.target.checked)}
                        style={{ width: "1rem", height: "1rem", marginTop: "0.125rem", flexShrink: 0, accentColor: "#16a34a" }}
                      />
                      <span style={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.65 }}>
                        ✅ <a href="/terms" target="_blank" style={{ color: "#2563eb", fontWeight: 600 }}>利用規約</a>に同意。オーナー様の情報は有料プランに登録している施工会社しか確認できません。また、開示される情報は、メールアドレスのみになります。
                      </span>
                    </label>
                  )}

                  {/* 無料会員登録ボタン（未ログイン時） */}
                  {!user && (
                    <Link
                      href={ctaAgreed ? `/owner/register?from=diagnosis&work_type=${encodeURIComponent(result.work_types[0])}${postalAddress ? `&addr=${encodeURIComponent(postalAddress + streetAddress)}` : ""}` : "#"}
                      onClick={!ctaAgreed ? (e) => e.preventDefault() : undefined}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        background: ctaAgreed ? "linear-gradient(135deg, #16a34a, #15803d)" : "#e5e7eb",
                        color: ctaAgreed ? "white" : "#9ca3af",
                        fontWeight: 700, padding: "0.875rem 1.5rem", borderRadius: "0.875rem",
                        textDecoration: "none", marginBottom: "0.75rem", fontSize: "0.9375rem",
                        boxShadow: ctaAgreed ? "0 4px 12px rgba(22,163,74,0.3)" : "none",
                        transition: "all 0.2s",
                        cursor: ctaAgreed ? "pointer" : "not-allowed",
                      }}
                    >
                      無料会員登録へ進む（施工会社の検索が可能となります。）
                      <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                    </Link>
                  )}

                  {/* ログイン済みオーナー：業者検索ボタン */}
                  {user && (
                    <Link
                      href={`/owner/contractors?work_type=${encodeURIComponent(result.work_types[0])}${postalAddress ? `&addr=${encodeURIComponent(postalAddress + streetAddress)}` : ""}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, padding: "0.875rem 1.5rem", borderRadius: "0.875rem", textDecoration: "none", marginBottom: "0.75rem", fontSize: "0.9375rem", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                    >
                      施工会社を検索する
                      <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                    </Link>
                  )}

                  {/* PDF保存ボタン */}
                  <button
                    onClick={() => window.print()}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", background: "white", border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, padding: "0.75rem 1.5rem", borderRadius: "0.875rem", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    📄 AI診断結果をPDFで保存
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
