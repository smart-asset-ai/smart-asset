"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import dynamic from "next/dynamic";
import { fetchContractors, getContractorRank, type Contractor } from "@/lib/api";
import {
  Lock,
  Search,
  MapPin,
  Phone,
  Mail,
  Filter,
  X,
  Building2,
  Navigation,
  ChevronRight,
  Map as MapIcon,
  List,
} from "lucide-react";

import AdSense from "@/components/AdSense";

const ContractorMap = dynamic(() => import("@/components/ContractorMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: "100%", height: "100%", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}
    >
      <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>地図を読み込み中...</div>
    </div>
  ),
});

const PREFECTURES = [
  "全国",
  "東京都",
  "神奈川県",
  "大阪府",
  "愛知県",
  "埼玉県",
  "千葉県",
  "兵庫県",
  "福岡県",
  "北海道",
  "その他",
];

const WORK_TYPE_OPTIONS = [
  "全種別",
  "外壁塗装",
  "屋根修繕",
  "防水工事",
  "内装リフォーム",
  "設備工事（電気）",
  "設備工事（配管）",
  "大規模修繕",
];

// Demo data (for when API is unavailable)
const DEMO_CONTRACTORS: Contractor[] = [
  {
    id: "1",
    company_name: "東京建設株式会社",
    address: "東京都渋谷区神南1-2-3",
    prefecture: "東京都",
    city: "渋谷区",
    phone: "03-1234-5678",
    email: "info@tokyo-kensetsu.co.jp",
    construction_license: "東京都知事 第12345号",
    work_types: ["外壁塗装", "防水工事", "大規模修繕"],
    description: "創業30年、都内マンション修繕実績多数。品質と安全を第一に。",
    latitude: 35.6617,
    longitude: 139.7041,
    photo_urls: [],
    created_at: "2024-01-01",
  },
  {
    id: "2",
    company_name: "スマートリフォーム",
    address: "東京都新宿区西新宿3-4-5",
    prefecture: "東京都",
    city: "新宿区",
    phone: "03-9876-5432",
    email: "contact@smart-reform.co.jp",
    construction_license: "東京都知事 第67890号",
    work_types: ["内装リフォーム", "外壁塗装", "屋根修繕"],
    description: "リフォーム専門20年。丁寧な施工と充実のアフターサービス。",
    latitude: 35.6938,
    longitude: 139.6963,
    photo_urls: [],
    created_at: "2024-01-02",
  },
  {
    id: "3",
    company_name: "関東防水工業",
    address: "神奈川県横浜市中区山手町1-1",
    prefecture: "神奈川県",
    city: "横浜市",
    phone: "045-123-4567",
    email: "info@kanto-bosui.co.jp",
    construction_license: "神奈川県知事 第11111号",
    work_types: ["防水工事", "屋根修繕"],
    description: "防水工事専門。屋上・ベランダ・地下室まで幅広く対応。",
    latitude: 35.4437,
    longitude: 139.6380,
    photo_urls: [],
    created_at: "2024-01-03",
  },
];

function ContractorsPageInner() {
  const searchParams = useSearchParams();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filtered, setFiltered] = useState<Contractor[]>([]);
  const [selected, setSelected] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [prefecture, setPrefecture] = useState("全国");
  const [workType, setWorkType] = useState("全種別");
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setViewMode("list");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [radiusMode, setRadiusMode] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const geocodedRef = useRef(false);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null | undefined>(undefined); // undefined=loading

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchContractors();
        setContractors(data.length ? data : DEMO_CONTRACTORS);
      } catch {
        setContractors(DEMO_CONTRACTORS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  // Auth check + owner_profiles validation
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (!u) { setIsOwner(false); return; }
      if (u.email === 'aiworkstage@gmail.com') { setIsOwner(true); return; }
      const { data: profile } = await supabase
        .from('owner_profiles')
        .select('id')
        .eq('user_id', u.id)
        .maybeSingle();
      setIsOwner(!!profile);
    };
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsOwner(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const wt = searchParams.get("work_type");
    if (wt) setWorkType(wt);

    const addr = searchParams.get("addr");
    if (addr && !geocodedRef.current) {
      geocodedRef.current = true;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${token}&language=ja&country=jp&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          if (data.features?.length > 0) {
            const [lng, lat] = data.features[0].center;
            setUserLocation({ lat, lng });
            setRadiusMode(true);
            setSortByDistance(true);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const calcDistance = useCallback(
    (lat: number, lng: number): number => {
      if (!userLocation) return Infinity;
      const R = 6371;
      const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
      const dLon = ((lng - userLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
    [userLocation]
  );

  // Filter & sort
  useEffect(() => {
    let result = [...contractors];

    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.prefecture.includes(q) ||
          c.city.includes(q) ||
          c.work_types.some((t) => t.includes(q))
      );
    }
    if (prefecture !== "全国") {
      result = result.filter((c) => c.prefecture === prefecture);
    }
    if (workType !== "全種別") {
      result = result.filter((c) => c.work_types.includes(workType));
    }
    // 10km radius filter when coming from diagnosis
    if (radiusMode && userLocation) {
      result = result.filter((c) => {
        if (!c.latitude || !c.longitude) return false;
        return calcDistance(c.latitude, c.longitude) <= 10;
      });
    }
    if (sortByDistance && userLocation) {
      result.sort((a, b) => {
        const da =
          a.latitude && a.longitude
            ? calcDistance(a.latitude, a.longitude)
            : Infinity;
        const db =
          b.latitude && b.longitude
            ? calcDistance(b.latitude, b.longitude)
            : Infinity;
        return da - db;
      });
    }

    setFiltered(result);
  }, [contractors, searchText, prefecture, workType, sortByDistance, radiusMode, userLocation, calcDistance]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setSortByDistance(true);
      },
      () => alert("位置情報の取得に失敗しました")
    );
  };

  // Auth gate: show loading or login prompt
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "2rem", height: "2rem", border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "9999px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <Lock style={{ width: "1.75rem", height: "1.75rem", color: "#d97706" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            施工会社の検索にはオーナー登録が必要です
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            無料のオーナー会員登録をすることで、<br />全国の施工会社を検索・比較できます。
          </p>
          <Link href="/owner/register" style={{ display: "block", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none", marginBottom: "0.75rem", fontSize: "1rem", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
            無料オーナー登録へ進む
          </Link>
          <a href="#" onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent("open-auth-modal")); }} style={{ display: "block", color: "#2563eb", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            すでに登録済みの方はログイン
          </a>
        </div>
      </div>
    );
  }

  // Logged in but NOT a registered owner (DB check)
  if (!isOwner) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <Lock style={{ width: "1.75rem", height: "1.75rem", color: "#d97706" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            オーナー登録が必要です
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            ログイン済みですが、オーナー登録が完了していません。<br />
            登録後、施工会社を検索できます。
          </p>
          <Link href="/owner/register" style={{ display: "block", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, padding: "0.875rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1rem", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
            オーナー登録へ進む（無料）
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", paddingTop: "3rem" }}>
      {/* Toolbar — white background, dark text */}
      <div
        style={{ flexShrink: 0, padding: "0.75rem 1rem", background: "white", borderBottom: "1px solid #e5e7eb" }}
      >
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.75rem" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af", pointerEvents: "none" }} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="会社名・地域・工事種別で検索"
              style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", color: "#111827", background: "white", outline: "none", width: "100%", paddingLeft: "2.5rem", paddingRight: searchText ? "2.25rem" : "0.875rem", paddingTop: "0.625rem", paddingBottom: "0.625rem", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <X style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.625rem 0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem",
                ...(showFilter
                  ? { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb" }
                  : { background: "white", border: "1px solid #d1d5db", color: "#374151" })
              }}
            >
              <Filter style={{ width: "1rem", height: "1rem" }} />
              絞り込み
            </button>

            {/* Location */}
            <button
              onClick={handleGetLocation}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.625rem 0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem",
                ...(userLocation
                  ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a" }
                  : { background: "white", border: "1px solid #d1d5db", color: "#374151" })
              }}
            >
              <Navigation style={{ width: "1rem", height: "1rem" }} />
              {userLocation ? "現在地取得済み" : "現在地"}
            </button>

            {/* View mode */}
            <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: "0.75rem", overflow: "hidden" }}>
              {(["split", "list", "map"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "0.625rem 0.75rem", fontSize: "0.875rem",
                    display: "flex", alignItems: "center", gap: "0.25rem", border: "none", cursor: "pointer",
                    ...(viewMode === mode
                      ? { background: "#2563eb", color: "white" }
                      : { background: "white", color: "#6b7280" })
                  }}
                >
                  {mode === "list" && <List style={{ width: "1rem", height: "1rem" }} />}
                  {mode === "map" && <MapIcon style={{ width: "1rem", height: "1rem" }} />}
                  {mode === "split" && (
                    <>
                      <List style={{ width: "0.75rem", height: "0.75rem" }} />
                      <MapIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Register CTA */}
            <Link
              href="/contractors/register"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 600, borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 0.875rem", fontSize: "0.875rem", textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
            >
              <Building2 style={{ width: "1rem", height: "1rem" }} />
              業者登録
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilter && (
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              style={{ border: "1px solid #d1d5db", borderRadius: "0.625rem", color: "#111827", background: "white", outline: "none", padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
            >
              {PREFECTURES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              style={{ border: "1px solid #d1d5db", borderRadius: "0.625rem", color: "#111827", background: "white", outline: "none", padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
            >
              {WORK_TYPE_OPTIONS.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
            {userLocation && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                />
                近い順に並び替え
              </label>
            )}
          </div>
        )}

        <div style={{ maxWidth: "80rem", margin: "0.5rem auto 0" }}>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            {loading ? "読み込み中..." : `${filtered.length}件の業者が見つかりました`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", maxWidth: "100%", minHeight: 0, display: "flex", flexWrap: viewMode === "split" ? "wrap" : "nowrap" }}>
        {/* List panel — white background, dark text */}
        {(viewMode === "split" || viewMode === "list") && (
          <div
            style={{
              width: viewMode === "split" && !isMobile ? "380px" : "100%",
              overflowY: "auto",
              flexShrink: 0,
              background: "white",
              borderRight: "1px solid #e5e7eb",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "10rem" }}>
                <div style={{ width: "1.5rem", height: "1.5rem", border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "9999px", animation: "spin 1s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", color: "#9ca3af", textAlign: "center" }}>
                <Search style={{ width: "2rem", height: "2rem", marginBottom: "0.75rem" }} />
                {radiusMode ? (
                  <>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>該当無し</p>
                    <p style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>お近く（半径10km以内）に施工会社が<br />登録されるまでお待ちください</p>
                    <button onClick={() => { setRadiusMode(false); setSortByDistance(false); }} style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#2563eb", background: "none", border: "1px solid #bfdbfe", borderRadius: "0.5rem", padding: "0.375rem 0.875rem", cursor: "pointer" }}>
                      全国から探す
                    </button>
                  </>
                ) : (
                  <p style={{ fontSize: "0.875rem" }}>条件に合う業者が見つかりません</p>
                )}
              </div>
            ) : (
              <div style={{ paddingTop: "0.75rem" }}>
                {/* AdSense — 業者一覧上部 */}
                <AdSense
                  slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTRACTORS || "0000000000"}
                  format="horizontal"
                  className=""
                />
                {filtered.map((c) => {
                  const dist =
                    userLocation && c.latitude && c.longitude
                      ? calcDistance(c.latitude, c.longitude)
                      : null;
                  const { rank, color, bg } = getContractorRank(c.ai_score);
                  const isSelected = selected?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelected(c)}
                      
                      style={{
                        margin: "0 0.75rem 0.625rem",
                        background: isSelected ? "#eff6ff" : "white",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                        borderRadius: "0.875rem",
                        boxShadow: isSelected ? "0 4px 16px rgba(59,130,246,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                        padding: "0.875rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 900, flexShrink: 0, background: bg, color: color }}
                            >
                              {rank}
                            </span>
                            <h3 style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.company_name}
                            </h3>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem", marginLeft: "2.25rem" }}>
                            <MapPin style={{ width: "0.75rem", height: "0.75rem", color: "#9ca3af", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.75rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.prefecture}{c.city}
                              {dist !== null && dist !== Infinity && (
                                <span style={{ marginLeft: "0.25rem", color: "#16a34a", fontWeight: 600 }}>
                                  ({dist.toFixed(1)}km)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        {c.ai_score && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>
                              {c.ai_score}点
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>AIスコア</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                        {c.work_types.slice(0, 3).map((type) => (
                          <span
                            key={type}
                            style={{ fontSize: "0.75rem", padding: "0.125rem 0.5rem", borderRadius: "9999px", background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
                          >
                            {type}
                          </span>
                        ))}
                        {c.work_types.length > 3 && (
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            +{c.work_types.length - 3}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div
                          style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.375rem" }}
                        >
                          <a
                            href={`tel:${c.phone}`}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#4b5563", textDecoration: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone style={{ width: "0.75rem", height: "0.75rem" }} />
                            {c.phone}
                          </a>
                          <a
                            href={`mailto:${c.email}`}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#4b5563", textDecoration: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail style={{ width: "0.75rem", height: "0.75rem" }} />
                            {c.email}
                          </a>
                          {c.description && (
                            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                              {c.description}
                            </p>
                          )}
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <a
                              href={`tel:${c.phone}`}
                              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 600, flex: 1, textAlign: "center", fontSize: "0.75rem", padding: "0.375rem 0", borderRadius: "0.5rem", textDecoration: "none", boxShadow: "0 2px 6px rgba(37,99,235,0.25)" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              電話する
                            </a>
                            <a
                              href={`mailto:${c.email}`}
                              style={{ background: "white", border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, flex: 1, textAlign: "center", fontSize: "0.75rem", padding: "0.375rem 0", borderRadius: "0.5rem", textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              メール
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Map panel */}
        {(viewMode === "split" || viewMode === "map") && (
          <div style={{ flex: 1, minWidth: 0, minHeight: "400px", height: viewMode === "map" ? "100%" : isMobile ? "50vh" : "400px", padding: "0.75rem" }}>
            <ContractorMap
              contractors={filtered}
              onSelect={setSelected}
              selectedId={selected?.id}
              userLocation={userLocation}
            />
          </div>
        )}
      </div>

      {/* Selected contractor detail (mobile map mode) */}
      {selected && viewMode === "map" && (
        <div
          
          style={{
            background: "white",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: 700, color: "#111827", fontSize: "1rem" }}>{selected.company_name}</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.125rem" }}>
                {selected.prefecture}{selected.city}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <a
                href={`tel:${selected.phone}`}
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 600, padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem", textDecoration: "none", boxShadow: "0 2px 6px rgba(37,99,235,0.3)" }}
              >
                電話
              </a>
              <button
                onClick={() => setSelected(null)}
                style={{ padding: "0.5rem", borderRadius: "0.625rem", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            {selected.work_types.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Floating register button */}
      <Link
        href="/contractors/register"
        style={{ position: "fixed", bottom: "6rem", right: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600, zIndex: 40, background: "#2563eb",
          color: "white",
          boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}
      >
        <Building2 style={{ width: "1rem", height: "1rem" }} />
        業者登録
        <ChevronRight style={{ width: "0.75rem", height: "0.75rem", opacity: 0.7 }} />
      </Link>
    </div>
  );
}

export default function ContractorsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: "2rem", height: "2rem", border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "9999px", animation: "spin 1s linear infinite" }} /></div>}>
      <ContractorsPageInner />
    </Suspense>
  );
}
