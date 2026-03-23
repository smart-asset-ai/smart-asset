"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Hash,
  Check,
  Loader2,
  AlertCircle,
  ChevronRight,
  Search,
  Star,
  Zap,
} from "lucide-react";

const WORK_TYPES = [
  "外壁塗装","屋根工事","防水工事","外壁修繕","高圧洗浄",
  "シール工事","サッシ工事","足場設置","タイル工事","内装リフォーム",
  "設備工事（電気）","設備工事（配管）","エクステリア","解体工事","新築工事",
  "大規模修繕","耐震補強","バリアフリー改修","電気工事","木工事","その他",
];

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

type PlanType = "free" | "plan_a" | "plan_b";

interface PlanInfo {
  id: PlanType;
  name: string;
  price: string;
  priceNote: string;
  badge: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    id: "free", name: "3ヶ月無料（フル機能）", price: "¥0", priceNote: "3ヶ月間", badge: "FREE",
    features: [
      "プロフィールページ自動生成",
      "業者マップへのピン表示",
      "AIスコア算出・ランク取得",
      "オーナーとのチャット・見積もり",
      "電子サイン契約",
      "修繕履歴の蓄積",
      "※3ヶ月後は無料のまま登録継続可（一部機能制限）",
    ],
  },
  {
    id: "plan_a", name: "Aプラン", price: "¥500", priceNote: "/月（税抜）¥550税込", badge: "PLAN A",
    features: [
      "プロフィール・マップ掲載（無制限）",
      "チャット・ファイル送受信",
      "案件への応募（無制限）",
      "修繕履歴の蓄積・管理",
      "施工事例写真掲載",
    ],
  },
  {
    id: "plan_b", name: "Bプラン", price: "¥800", priceNote: "/月（税抜）¥880税込", badge: "PLAN B",
    highlight: true,
    features: [
      "Aプランの全機能",
      "電子サイン契約（即日締結・印紙不要）",
      "優先表示（検索上位枠）",
      "AIスコア分析レポート",
      "専用バッジ・認定マーク表示",
    ],
  },
];

interface FormData {
  company_name: string; postal_code: string; prefecture: string; city: string;
  address_detail: string; phone: string; email: string; construction_license: string;
  corporate_number: string; main_work_type: string; work_types: string[]; description: string; website: string;
  plan: PlanType;
}

const initialForm: FormData = {
  company_name: "", postal_code: "", prefecture: "", city: "", address_detail: "",
  phone: "", email: "", construction_license: "", corporate_number: "",
  main_work_type: "", work_types: [], description: "", website: "", plan: "free" as PlanType,
};

type Step = 1 | 2 | 3;

// ── Reusable style constants ────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "1.5rem", marginBottom: "1.25rem",
};
const inputBase: React.CSSProperties = {
  border: "1px solid #d1d5db", borderRadius: "0.625rem", color: "#111827",
  background: "white", padding: "0.625rem 0.875rem", fontSize: "0.875rem",
  outline: "none", width: "100%", boxSizing: "border-box",
};
const inputWithIcon: React.CSSProperties = { ...inputBase, paddingLeft: "2.5rem" };
const labelBase: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem",
};
const requiredBadge: React.CSSProperties = {
  background: "#fee2e2", color: "#b91c1c", fontSize: "0.65rem", fontWeight: 700,
  padding: "0.15rem 0.5rem", borderRadius: "9999px", border: "1px solid #fca5a5",
  marginLeft: "0.375rem", verticalAlign: "middle",
};
const optionalBadge: React.CSSProperties = {
  background: "#f0fdf4", color: "#166534", fontSize: "0.65rem", fontWeight: 700,
  padding: "0.15rem 0.5rem", borderRadius: "9999px", border: "1px solid #bbf7d0",
  marginLeft: "0.375rem", verticalAlign: "middle",
};
const iconWrap: React.CSSProperties = {
  position: "relative" as const, display: "flex", alignItems: "center",
};
const iconPos: React.CSSProperties = {
  position: "absolute" as const, left: "0.75rem", pointerEvents: "none" as const,
  color: "#9ca3af", display: "flex", alignItems: "center",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "1.0625rem", fontWeight: 800, color: "#111827",
  paddingBottom: "0.875rem", marginBottom: "1.25rem", borderBottom: "1px solid #e5e7eb",
};

export default function ContractorRegisterPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [postalLoading, setPostalLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showRequired, setShowRequired] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const stepParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("step") : null;
    if (stepParam === "2") {
      const saved = localStorage.getItem("contractor-register-form");
      if (saved) {
        try { setForm(JSON.parse(saved)); } catch {}
      }
      setStep(2);
    }
  }, []);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleWorkType = (type: string) =>
    setForm((prev) => ({
      ...prev,
      work_types: prev.work_types.includes(type)
        ? prev.work_types.filter((t) => t !== type)
        : [...prev.work_types, type],
    }));

  // Restore form (separate key from OTP flow key)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('contractor-register-persist');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.form) setForm((prev) => ({ ...prev, ...d.form }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('contractor-register-persist', JSON.stringify({ form }));
    } catch {}
  }, [form]);

  const validatePhone = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    if (!val) return "";
    if (!/^[0-9\-\(\)\+\s]+$/.test(val) || digits.length < 10 || digits.length > 11) {
      return "電話番号の形式が正しくありません（例: 03-1234-5678 または 090-1234-5678）";
    }
    return "";
  };

  const validateEmail = (val: string) => {
    if (!val) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return "メールアドレスの形式が正しくありません（例: info@example.co.jp）";
    }
    return "";
  };

  const lookupPostalCode = useCallback(async (code: string) => {
    const digits = code.replace(/[^0-9]/g, "");
    if (digits.length !== 7) return;
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
      const data = await res.json();
      if (data.results?.[0]) {
        const r = data.results[0];
        setForm((prev) => ({ ...prev, prefecture: r.address1, city: r.address2 + r.address3 }));
      }
    } catch { /* silently fail */ }
    finally { setPostalLoading(false); }
  }, []);

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    update("postal_code", val);
    const digits = val.replace(/[^0-9]/g, "");
    if (digits.length === 7) lookupPostalCode(digits);
  };

  const validateStep = (s: Step): boolean => {
    if (s === 1) return !!(form.company_name && form.postal_code && form.prefecture && form.city && form.address_detail && form.phone && form.email && !validatePhone(form.phone) && !validateEmail(form.email));
    if (s === 2) return form.work_types.length > 0;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";
      const payload = {
        company_name: form.company_name, postal_code: form.postal_code,
        prefecture: form.prefecture, city: form.city,
        address: `${form.prefecture}${form.city}${form.address_detail}`,
        address_detail: form.address_detail || null, phone: form.phone, email: form.email,
        construction_license: form.construction_license || null,
        corporate_number: form.corporate_number || null,
        main_work_type: form.main_work_type || null, work_types: form.work_types, description: form.description || null,
        website: form.website || null, subscription_plan: form.plan, status: "pending",
      };
      const res = await fetch(`${API_URL}/api/contractors/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `登録エラー (${res.status})`);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。もう一度お試しください。");
    } finally { setSubmitting(false); }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  // Handle emailSent screen
  if (emailSent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem 2rem" }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "28rem", width: "100%", textAlign: "center", padding: "2.5rem" }}>
          <div style={{ width: "5rem", height: "5rem", borderRadius: "9999px", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Mail style={{ width: "2.5rem", height: "2.5rem", color: "#2563eb" }} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem" }}>メールをご確認ください</h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            <strong style={{ color: "#1e40af" }}>{form.email}</strong><br />に認証リンクを送信しました。<br />メール内のリンクをクリックして登録を続けてください。
          </p>
          <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>迷惑メールフォルダもご確認ください</p>
        </div>
      </div>
    );
  }

  if (success) {
    const selectedPlan = PLANS.find((p) => p.id === form.plan);
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem 2rem" }}>
        <div style={{ ...card, maxWidth: "28rem", width: "100%", textAlign: "center", padding: "2.5rem" }}>
          <div style={{ width: "5rem", height: "5rem", borderRadius: "9999px", background: "#dcfce7", border: "1px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Check style={{ width: "2.5rem", height: "2.5rem", color: "#16a34a" }} />
          </div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem" }}>
            登録申請が完了しました！
          </h2>
          <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            ご登録ありがとうございます。
          </p>
          {selectedPlan && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
              選択プラン：<strong>{selectedPlan.name}</strong>
              {form.plan !== "free" && (
                <span style={{ color: "#3b82f6", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                  ※ お支払いの詳細はメールにてご案内します
                </span>
              )}
            </div>
          )}
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            登録後すぐに掲載が開始されます。プロフィールを充実させてAIスコアを上げましょう。
          </p>
          <button
            onClick={() => router.push("/")}
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, borderRadius: "0.875rem", padding: "0.75rem 2rem", border: "none", cursor: "pointer", fontSize: "0.9375rem", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}
          >
            トップページへ
          </button>
        </div>
      </div>
    );
  }

  const stepTitles = ["施工業社様会員登録フォーム", "専門情報登録フォーム", "プラン選択・確認"];
  const steps = ["会社情報", "専門情報", "プラン・確認"];
  const canNext = step === 1 ? (agreed && validateStep(1)) : validateStep(step);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)", paddingTop: "5rem", paddingBottom: "2.5rem" }}>
        <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Building2 style={{ width: "1.75rem", height: "1.75rem", color: "white" }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", marginBottom: "0.5rem" }}>
            {stepTitles[step - 1]}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>
            Smart Asset AIに登録して新しい顧客を獲得しましょう
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* Step indicator */}
        <div style={{ ...card, padding: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {steps.map((label, i) => {
              const stepNum = (i + 1) as Step;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: "2rem", height: "2rem", borderRadius: "9999px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", fontWeight: 700,
                      ...(isDone
                        ? { background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a" }
                        : isActive
                        ? { background: "#2563eb", border: "1px solid #1d4ed8", color: "white" }
                        : { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#9ca3af" })
                    }}>
                      {isDone ? <Check style={{ width: "1rem", height: "1rem" }} /> : stepNum}
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, ...(isActive ? { color: "#2563eb" } : isDone ? { color: "#059669" } : { color: "#9ca3af" }) }}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: "1px", margin: "0 0.5rem", background: isDone ? "#86efac" : "#e5e7eb" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Step 1: Company Info ─────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ ...card, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={sectionTitle}>会社基本情報</h2>

              {/* 会社名 */}
              <div>
                <label style={labelBase}>
                  会社名 <span style={requiredBadge}>必須</span>
                </label>
                <div style={iconWrap}>
                  <span style={iconPos}><Building2 style={{ width: "1rem", height: "1rem" }} /></span>
                  <input type="text" value={form.company_name} onChange={(e) => update("company_name", e.target.value)}
                    placeholder="株式会社スマート建設" required style={inputWithIcon} />
                </div>
              </div>

              {/* 郵便番号 */}
              <div>
                <label style={labelBase}>
                  郵便番号 <span style={requiredBadge}>必須</span>
                  <span style={{ color: "#6b7280", fontWeight: 400, fontSize: "0.75rem", marginLeft: "0.375rem" }}>
                    入力すると住所を自動補完
                  </span>
                </label>
                <div style={{ ...iconWrap, maxWidth: "16rem" }}>
                  <span style={iconPos}><Search style={{ width: "1rem", height: "1rem" }} /></span>
                  <input type="text" value={form.postal_code} onChange={handlePostalChange}
                    placeholder="000-0000" maxLength={8} required style={inputWithIcon} />
                  {postalLoading && (
                    <span style={{ position: "absolute", right: "0.75rem" }}>
                      <Loader2 style={{ width: "1rem", height: "1rem", color: "#60a5fa", animation: "spin 1s linear infinite" }} />
                    </span>
                  )}
                </div>
              </div>

              {/* 都道府県・市区町村 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelBase}>都道府県 <span style={requiredBadge}>必須</span></label>
                  <select value={form.prefecture} onChange={(e) => update("prefecture", e.target.value)}
                    required style={inputBase}>
                    <option value="">選択</option>
                    {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelBase}>市区町村 <span style={requiredBadge}>必須</span></label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                    placeholder="渋谷区" required style={inputBase} />
                </div>
              </div>

              {/* 番地・建物名 */}
              <div>
                <label style={labelBase}>番地・建物名 <span style={requiredBadge}>必須</span></label>
                <div style={iconWrap}>
                  <span style={iconPos}><MapPin style={{ width: "1rem", height: "1rem" }} /></span>
                  <input type="text" value={form.address_detail} onChange={(e) => update("address_detail", e.target.value)}
                    placeholder="1-2-3 スマートビル 5F" style={inputWithIcon} />
                </div>
              </div>

              {/* 電話・メール */}
              <div className="grid-2col-responsive" style={{ gap: "1.25rem", alignItems: "start" }}>
                <div style={{ paddingBottom: "0.25rem" }}>
                  <label style={labelBase}>電話番号 <span style={requiredBadge}>必須</span></label>
                  <div style={iconWrap}>
                    <span style={iconPos}><Phone style={{ width: "1rem", height: "1rem" }} /></span>
                    <input type="tel" value={form.phone}
                      onChange={(e) => { update("phone", e.target.value); setPhoneError(""); }}
                      onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                      placeholder="03-1234-5678" required style={{ ...inputWithIcon, borderColor: phoneError ? "#ef4444" : undefined }} />
                  </div>
                  {phoneError && <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>{phoneError}</p>}
                </div>
                <div style={{ marginTop: 0 }}>
                  <label style={{ ...labelBase, marginTop: "0.125rem" }}>メールアドレス <span style={requiredBadge}>必須</span></label>
                  <div style={iconWrap}>
                    <span style={iconPos}><Mail style={{ width: "1rem", height: "1rem" }} /></span>
                    <input type="email" value={form.email}
                      onChange={(e) => { update("email", e.target.value); setEmailError(""); }}
                      onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                      placeholder="info@company.co.jp" required style={{ ...inputWithIcon, borderColor: emailError ? "#ef4444" : undefined }} />
                  </div>
                  {emailError && <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>{emailError}</p>}
                </div>
              </div>

              {/* ウェブサイト */}
              <div>
                <label style={labelBase}>ウェブサイト <span style={optionalBadge}>任意</span></label>
                <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)}
                  placeholder="https://www.example.co.jp" style={inputBase} />
              </div>
            </div>
          )}

          {/* ── Step 2: Professional Info ────────────────────────────────── */}
          {step === 2 && (
            <div style={{ ...card, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={sectionTitle}>専門資格・対応業務</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelBase}>建設業許可番号 <span style={optionalBadge}>任意</span></label>
                  <div style={iconWrap}>
                    <span style={iconPos}><FileText style={{ width: "1rem", height: "1rem" }} /></span>
                    <input type="text" value={form.construction_license} onChange={(e) => update("construction_license", e.target.value)}
                      placeholder="国土交通大臣 第○○○○○号" style={inputWithIcon} />
                  </div>
                </div>
                <div>
                  <label style={labelBase}>法人番号 <span style={optionalBadge}>任意</span></label>
                  <div style={iconWrap}>
                    <span style={iconPos}><Hash style={{ width: "1rem", height: "1rem" }} /></span>
                    <input type="text" value={form.corporate_number} onChange={(e) => update("corporate_number", e.target.value)}
                      placeholder="1234567890123" maxLength={13} style={inputWithIcon} />
                  </div>
                </div>
              </div>

              {/* Work types */}
              <div>
                <label style={labelBase}>
                  対応工事種別 <span style={requiredBadge}>必須</span>
                  <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.75rem", marginLeft: "0.375rem" }}>複数選択可</span>
                </label>

                {/* メイン業務 — 1つ選択 */}
                <div style={{ background: "#eff6ff", borderRadius: "0.875rem", padding: "1rem", marginBottom: "1rem", border: "1px solid #bfdbfe" }}>
                  <p style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    ⭐ メイン業務（1つ選択）
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.625rem", lineHeight: 1.5 }}>
                    最も得意な工事を1つ選んでください。オーナーとのマッチ度に使われます。
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {WORK_TYPES.map(type => (
                      <button key={type} type="button" onClick={() => update("main_work_type", form.main_work_type === type ? "" : type)}
                        style={{ padding: "0.375rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", border: "none",
                          ...(form.main_work_type === type
                            ? { background: "#1d4ed8", color: "white", boxShadow: "0 2px 8px rgba(29,78,216,0.35)" }
                            : { background: "white", color: "#374151", border: "1px solid #d1d5db" }) }}>
                        {form.main_work_type === type ? "★ " : ""}{type}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {WORK_TYPES.map((type) => {
                    const sel = form.work_types.includes(type);
                    return (
                      <button key={type} type="button" onClick={() => toggleWorkType(type)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.375rem",
                          padding: "0.5rem 0.75rem", borderRadius: "0.625rem",
                          fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
                          transition: "all 0.15s",
                          ...(sel
                            ? { background: "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(37,99,235,0.85))", border: "1px solid rgba(96,165,250,0.5)", color: "white", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }
                            : { background: "#f9fafb", border: "1px solid #d1d5db", color: "#374151" })
                        }}>
                        {sel && <Check style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />}
                        {type}
                      </button>
                    );
                  })}
                </div>
                {form.work_types.length === 0 && (
                  <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.5rem" }}>1つ以上選択してください</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={labelBase}>会社・サービス紹介 <span style={optionalBadge}>任意</span></label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="会社の特徴、強み、実績などをご記入ください" rows={4}
                  style={{ ...inputBase, resize: "none", lineHeight: 1.6 }} />
              </div>
            </div>
          )}

          {/* ── Step 3: Plan + Confirm ────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Plan selection */}
              <div style={card}>
                <h2 style={sectionTitle}>プランを選択</h2>
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "1.25rem", marginTop: "-0.75rem" }}>
                  ※ 有料プランはStripeにて決済が必要です。登録後にメールでご案内します。
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {PLANS.map((plan) => {
                    const isSel = form.plan === plan.id;
                    const isSelHL = isSel && plan.highlight;
                    return (
                      <button key={plan.id} type="button"
                        onClick={() => setForm((prev) => ({ ...prev, plan: plan.id }))}
                        style={{
                          width: "100%", textAlign: "left", borderRadius: "0.875rem", padding: "1.125rem",
                          cursor: "pointer", transition: "all 0.15s",
                          ...(isSelHL
                            ? { background: "linear-gradient(135deg, rgba(59,130,246,0.75), rgba(37,99,235,0.65))", border: "2px solid rgba(96,165,250,0.6)", boxShadow: "0 4px 24px rgba(59,130,246,0.25)" }
                            : isSel
                            ? { background: "rgba(59,130,246,0.12)", border: "2px solid rgba(96,165,250,0.5)" }
                            : { background: "#f9fafb", border: "2px solid #e5e7eb" })
                        }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px",
                                ...(isSelHL ? { background: "rgba(255,255,255,0.45)", color: "white" }
                                  : plan.id === "plan_a" ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
                                  : { background: "#f1f5f9", color: "#64748b", border: "1px solid #d1d5db" })
                              }}>{plan.badge}</span>
                              {plan.highlight && (
                                <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                                  🏆 人気No.1
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: isSelHL ? "white" : "#111827" }}>{plan.price}</span>
                              {plan.id !== "free" && <span style={{ fontSize: "0.875rem", color: isSelHL ? "rgba(255,255,255,0.7)" : "#6b7280" }}>/月</span>}
                            </div>
                            <div style={{ fontSize: "0.75rem", marginTop: "0.125rem", color: isSelHL ? "rgba(255,255,255,0.6)" : "#9ca3af" }}>{plan.priceNote}</div>
                          </div>
                          <div style={{
                            width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "0.25rem",
                            ...(isSel ? { background: "rgba(59,130,246,0.6)", border: "2px solid rgba(96,165,250,0.7)" } : { background: "transparent", border: "2px solid #d1d5db" })
                          }}>
                            {isSel && <Check style={{ width: "0.875rem", height: "0.875rem", color: "white" }} />}
                          </div>
                        </div>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {plan.features.map((f) => (
                            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: isSelHL ? "rgba(219,234,254,0.85)" : "#64748b" }}>
                              <Check style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0, marginTop: "0.125rem", color: isSelHL ? "white" : "#34d399" }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 登録内容確認 */}
              <div style={card}>
                <h2 style={sectionTitle}>登録内容の確認</h2>
                <dl style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "会社名", value: form.company_name },
                    { label: "郵便番号", value: form.postal_code },
                    { label: "所在地", value: `${form.prefecture}${form.city}${form.address_detail}` },
                    { label: "電話番号", value: form.phone },
                    { label: "メール", value: form.email },
                    { label: "建設業許可", value: form.construction_license || "（未入力）" },
                    { label: "メイン業務", value: form.main_work_type || "未選択" },
                  { label: "対応工事", value: form.work_types.join("、") || "未選択" },
                    { label: "選択プラン", value: PLANS.find((p) => p.id === form.plan)?.name || "" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "1rem" }}>
                      <dt style={{ color: "#9ca3af", fontSize: "0.875rem", width: "5.5rem", flexShrink: 0 }}>{item.label}</dt>
                      <dd style={{ color: "#374151", fontSize: "0.875rem", fontWeight: 600 }}>{item.value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem" }}>
                  <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.875rem 1rem", marginTop: "1.25rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: "1rem", height: "1rem", marginTop: "0.125rem", flexShrink: 0, accentColor: "#2563eb", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.6 }}>
                <a href="/terms" target="_blank" style={{ color: "#2563eb", fontWeight: 600 }}>利用規約</a>に同意します。無料会員登録後、会社情報はMAPに登録されます。会員ページから削除可能（退会）。
              </span>
            </label>
          )}
          {showRequired && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", marginTop: "1rem" }}>
              <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
              必須項目をすべて入力し、利用規約に同意してください。
            </div>
          )}
          {error && step === 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", marginTop: "1rem" }}>
              <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
              {error}
            </div>
          )}
          {/* Navigation */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep((prev) => (prev - 1) as Step)}
                style={{ flex: 1, background: "white", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 700, borderRadius: "0.875rem", padding: "0.875rem", cursor: "pointer", fontSize: "0.9375rem" }}>
                戻る
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={async () => {
                  if (!canNext) { setShowRequired(true); return; }
                  setShowRequired(false);
                  if (step === 1) {
                    if (!validateStep(1)) { setShowRequired(true); return; }
                    // Already authenticated — skip magic link and go directly to step 2
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData.session?.user) {
                      setStep(2);
                      return;
                    }
                    setSendingOtp(true);
                    try {
                      localStorage.setItem("contractor-register-form", JSON.stringify(form));
                      localStorage.setItem("auth-next-intent", "contractor-register");
                      // Send magic link via Resend API directly
                      const res = await fetch("/api/send-magic-link", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: form.email }),
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || "メール送信に失敗しました");
                      }
                      setEmailSent(true);
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : "メール送信に失敗しました");
                    } finally { setSendingOtp(false); }
                  } else {
                    setStep((prev) => (prev + 1) as Step);
                  }
                }}
                disabled={!canNext || sendingOtp}
                style={{
                  flex: 1, fontWeight: 700, borderRadius: "0.875rem", padding: "0.875rem",
                  border: "none", cursor: canNext ? "pointer" : "not-allowed", fontSize: "0.9375rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  ...(canNext && !sendingOtp
                    ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }
                    : { background: "#e5e7eb", color: "#9ca3af" })
                }}>
                {sendingOtp ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />メール送信中...</> : <>次へ <ChevronRight style={{ width: "1rem", height: "1rem" }} /></>}
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                style={{
                  flex: 1, fontWeight: 700, borderRadius: "0.875rem", padding: "0.875rem",
                  border: "none", cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.9375rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  ...(submitting
                    ? { background: "#e5e7eb", color: "#9ca3af" }
                    : { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" })
                }}>
                {submitting ? (
                  <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />送信中...</>
                ) : (
                  <><Check style={{ width: "1rem", height: "1rem" }} />送信</>
                )}
              </button>
            )}
          </div>
        </form>


      </div>
    </div>
  );
}
