"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Plus, Search, Edit3, Trash2, Eye, EyeOff, BookOpen,
  TrendingUp, Tag, Save, X, ChevronDown, AlertCircle,
  CheckCircle, Clock, Globe, Lock, BarChart3, RefreshCw, ArrowLeft
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Status = "draft" | "published" | "archived";

interface Category {
  id: string;
  name: string;
  slug: string;
  color_code: string;
  icon?: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: Status;
  category_id: string;
  featured_image?: string;
  published_at?: string;
  view_count: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  article_categories?: { name: string; color_code: string; slug: string; icon?: string };
}

const EMPTY_ARTICLE: Omit<Article, "id" | "created_at" | "view_count"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  category_id: "",
  seo_title: "",
  seo_description: "",
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:     { label: "下書き",   color: "#9ca3af", bg: "#f3f4f6", icon: <Clock    style={{ width: "0.75rem", height: "0.75rem" }} /> },
  published: { label: "公開中",   color: "#16a34a", bg: "#f0fdf4", icon: <Globe    style={{ width: "0.75rem", height: "0.75rem" }} /> },
  archived:  { label: "アーカイブ",color: "#6b7280", bg: "#f9fafb", icon: <Lock    style={{ width: "0.75rem", height: "0.75rem" }} /> },
};

const ADMIN_PASSWORD = "smartasset2026";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `article-${Date.now()}`;
}

// ── Admin password gate ────────────────────────────────────────────────────
function AdminGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const check = () => {
    if (pw === ADMIN_PASSWORD) { onAuth(); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", paddingTop: "3.5rem" }}>
      <div style={{ background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", width: "100%", maxWidth: "380px", margin: "1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#f1f5f9", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "2rem" }}>🔐</div>
          <h1 style={{ fontWeight: 900, fontSize: "1.375rem", color: "#111827" }}>管理者ページ</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>パスワードを入力してください</p>
        </div>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="パスワード"
          style={{ width: "100%", padding: "0.875rem 1rem", border: `1.5px solid ${error ? "#ef4444" : "#e5e7eb"}`, borderRadius: "0.875rem", fontSize: "1rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }}
        />
        {error && <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>パスワードが違います</p>}
        <button onClick={check}
          style={{ width: "100%", padding: "0.875rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", borderRadius: "0.875rem", color: "white", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>
          ログイン
        </button>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/admin" style={{ color: "#6b7280", fontSize: "0.8125rem", textDecoration: "none" }}>← 管理者ダッシュボードへ</Link>
        </div>
      </div>
    </div>
  );
}

// ── Article editor modal ───────────────────────────────────────────────────
function ArticleEditor({
  article, categories, onSave, onClose,
}: {
  article: Partial<Article> | null;
  categories: Category[];
  onSave: (data: Partial<Article>) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !article?.id;
  const [form, setForm] = useState<Partial<Article>>({
    ...EMPTY_ARTICLE,
    ...article,
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"basic" | "content" | "seo">("basic");
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "seo">("basic");

  const update = (key: keyof Article, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleTitleChange = (val: string) => {
    setForm(f => ({
      ...f,
      title: val,
      slug: isNew ? slugify(val) : f.slug,
      seo_title: isNew ? val : f.seo_title,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb",
    borderRadius: "0.75rem", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = { fontWeight: 700, fontSize: "0.8125rem", color: "#374151", display: "block", marginBottom: "0.375rem" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: "760px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Modal header */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.125rem", color: "#111827" }}>{isNew ? "📝 新規記事作成" : "✏️ 記事を編集"}</h2>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: saving ? "#9ca3af" : "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", borderRadius: "0.75rem", color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: saving ? "not-allowed" : "pointer" }}>
              <Save style={{ width: "0.875rem", height: "0.875rem" }} />
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={onClose}
              style={{ padding: "0.625rem", background: "#f3f4f6", border: "none", borderRadius: "0.75rem", cursor: "pointer", color: "#6b7280" }}>
              <X style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #f0f0f0", padding: "0 2rem" }}>
          {(["basic", "content", "seo"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "0.875rem 1.25rem", background: "none", border: "none", borderBottom: `2px solid ${activeTab === t ? "#2563eb" : "transparent"}`, color: activeTab === t ? "#2563eb" : "#6b7280", fontWeight: activeTab === t ? 700 : 500, fontSize: "0.875rem", cursor: "pointer" }}>
              {t === "basic" ? "基本情報" : t === "content" ? "本文" : "SEO設定"}
            </button>
          ))}
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.75rem 2rem" }}>
          {activeTab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>タイトル *</label>
                <input value={form.title || ""} onChange={e => handleTitleChange(e.target.value)} placeholder="記事タイトルを入力..." style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>カテゴリ</label>
                  <select value={form.category_id || ""} onChange={e => update("category_id", e.target.value)} style={{ ...inputStyle, background: "white" }}>
                    <option value="">カテゴリを選択</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ステータス</label>
                  <select value={form.status || "draft"} onChange={e => update("status", e.target.value as Status)} style={{ ...inputStyle, background: "white" }}>
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>スラッグ (URL)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem", whiteSpace: "nowrap" }}>/blog/category/</span>
                  <input value={form.slug || ""} onChange={e => update("slug", e.target.value)} placeholder="article-slug" style={{ flex: 1, border: "none", background: "transparent", fontSize: "0.9375rem", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>概要文 (一覧に表示)</label>
                <textarea value={form.excerpt || ""} onChange={e => update("excerpt", e.target.value)} placeholder="120〜160文字程度の概要を入力..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div>
              <label style={labelStyle}>本文 (HTML対応)</label>
              <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
                {"<h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>"}などのHTMLタグが使えます
              </p>
              <textarea
                value={form.content || ""}
                onChange={e => update("content", e.target.value)}
                placeholder="<h2>見出し</h2>\n<p>本文...</p>"
                rows={20}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.7 }}
              />
            </div>
          )}

          {activeTab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ background: "#f0f9ff", borderRadius: "0.875rem", padding: "1rem", border: "1px solid #bae6fd" }}>
                <p style={{ fontSize: "0.8125rem", color: "#0369a1", fontWeight: 600 }}>💡 SEO最適化のポイント</p>
                <p style={{ fontSize: "0.8125rem", color: "#0369a1", marginTop: "0.25rem" }}>タイトルは30〜60文字、説明文は120〜160文字が理想です</p>
              </div>
              <div>
                <label style={labelStyle}>SEOタイトル</label>
                <input value={form.seo_title || ""} onChange={e => update("seo_title", e.target.value)} placeholder="検索結果に表示されるタイトル..." style={inputStyle} />
                <p style={{ fontSize: "0.75rem", color: (form.seo_title?.length || 0) > 60 ? "#ef4444" : "#9ca3af", marginTop: "0.25rem" }}>{form.seo_title?.length || 0}/60文字</p>
              </div>
              <div>
                <label style={labelStyle}>メタディスクリプション</label>
                <textarea value={form.seo_description || ""} onChange={e => update("seo_description", e.target.value)} placeholder="検索結果に表示される説明文..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                <p style={{ fontSize: "0.75rem", color: (form.seo_description?.length || 0) > 160 ? "#ef4444" : "#9ca3af", marginTop: "0.25rem" }}>{form.seo_description?.length || 0}/160文字</p>
              </div>

              {/* Preview */}
              {(form.seo_title || form.title) && (
                <div style={{ background: "white", borderRadius: "0.875rem", padding: "1.25rem", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.75rem", fontWeight: 600 }}>検索結果プレビュー</p>
                  <p style={{ color: "#1558d6", fontSize: "1.0625rem", fontWeight: 500, marginBottom: "0.25rem" }}>{form.seo_title || form.title}</p>
                  <p style={{ color: "#006621", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>smart-asset.ai/blog/...</p>
                  <p style={{ color: "#545454", fontSize: "0.875rem" }}>{form.seo_description || form.excerpt || "説明文が設定されていません"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────────────────
export default function AdminArticlesPage() {
  const [authed, setAuthed] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [editing, setEditing] = useState<Partial<Article> | null | "new">(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: arts }, { data: cats }] = await Promise.all([
      supabase.from("articles").select(`*, article_categories(name, color_code, icon)`).order("created_at", { ascending: false }),
      supabase.from("article_categories").select("*").eq("is_active", true).order("sort_order"),
    ]);
    setArticles(arts || []);
    setCategories(cats || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  const handleSave = async (data: Partial<Article>) => {
    if (!data.title?.trim()) { showToast("タイトルを入力してください", "error"); return; }
    const slug = data.slug || slugify(data.title);
    const payload = { ...data, slug, published_at: data.status === "published" && !data.published_at ? new Date().toISOString() : data.published_at };

    if (data.id) {
      const { error } = await supabase.from("articles").update(payload).eq("id", data.id);
      if (error) { showToast("更新に失敗しました: " + error.message, "error"); return; }
      showToast("記事を更新しました ✓");
    } else {
      const { error } = await supabase.from("articles").insert({ ...payload, view_count: 0 });
      if (error) { showToast("作成に失敗しました: " + error.message, "error"); return; }
      showToast("記事を作成しました ✓");
    }
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { showToast("削除に失敗しました", "error"); return; }
    showToast("記事を削除しました");
    fetchData();
  };

  const toggleStatus = async (article: Article) => {
    const next: Status = article.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("articles").update({
      status: next,
      published_at: next === "published" ? new Date().toISOString() : article.published_at,
    }).eq("id", article.id);
    if (!error) { showToast(`${next === "published" ? "公開" : "下書きに変更"}しました`); fetchData(); }
  };

  const filtered = articles.filter(a => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSearch = search === "" || a.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total:     articles.length,
    published: articles.filter(a => a.status === "published").length,
    draft:     articles.filter(a => a.status === "draft").length,
    views:     articles.reduce((s, a) => s + (a.view_count || 0), 0),
  };

  if (!authed) return <AdminGate onAuth={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3.5rem" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "4.5rem", right: "1.5rem", zIndex: 300, background: toast.type === "success" ? "#166534" : "#7f1d1d", color: "white", padding: "0.875rem 1.25rem", borderRadius: "0.875rem", fontWeight: 700, fontSize: "0.9375rem", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {toast.type === "success" ? <CheckCircle style={{ width: "1rem", height: "1rem" }} /> : <AlertCircle style={{ width: "1rem", height: "1rem" }} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "1.25rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <Link href="/admin" style={{ color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem" }}>
                <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} /> 管理ダッシュボード
              </Link>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "1.375rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <BookOpen style={{ width: "1.375rem", height: "1.375rem", color: "#2563eb" }} /> 記事管理
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 1rem", background: "#f3f4f6", border: "none", borderRadius: "0.75rem", color: "#6b7280", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
              <RefreshCw style={{ width: "0.875rem", height: "0.875rem" }} /> 更新
            </button>
            <button onClick={() => setEditing({})}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", borderRadius: "0.75rem", color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
              <Plus style={{ width: "0.875rem", height: "0.875rem" }} /> 記事を追加
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }} className="stats-grid">
          {[
            { label: "総記事数",   value: stats.total,                     icon: "📄", color: "#2563eb" },
            { label: "公開中",     value: stats.published,                 icon: "🌐", color: "#16a34a" },
            { label: "下書き",     value: stats.draft,                     icon: "✏️", color: "#d97706" },
            { label: "総閲覧数",   value: stats.views.toLocaleString(),    icon: "👀", color: "#7c3aed" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "#9ca3af", fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: "1.25rem" }}>{s.icon}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: "1.75rem", color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="記事を検索..."
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", border: "1.5px solid #e5e7eb", borderRadius: "0.75rem", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["all", "published", "draft", "archived"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: "0.5rem 0.875rem", border: "none", borderRadius: "2rem", cursor: "pointer", fontWeight: 700, fontSize: "0.8125rem", background: statusFilter === s ? "#111827" : "#f3f4f6", color: statusFilter === s ? "white" : "#6b7280", transition: "all 0.2s" }}>
                {s === "all" ? "すべて" : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles table */}
        <div style={{ background: "white", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          {loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#9ca3af" }}>読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#9ca3af" }}>
              <BookOpen style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem" }} />
              <p>{search ? "検索結果がありません" : "記事がありません"}</p>
              <button onClick={() => setEditing({})} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", background: "#2563eb", border: "none", borderRadius: "0.75rem", color: "white", fontWeight: 700, cursor: "pointer" }}>
                最初の記事を作成
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f0f0f0" }}>
                  {["タイトル", "カテゴリ", "ステータス", "閲覧数", "公開日", "操作"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const sc = STATUS_CONFIG[a.status];
                  const cat = a.article_categories;
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={{ padding: "0.875rem 1rem", maxWidth: "300px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111827", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title || "(タイトルなし)"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>/blog/{a.slug}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {cat ? (
                          <span style={{ background: `${cat.color_code}15`, color: cat.color_code, padding: "0.25rem 0.625rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700 }}>
                            {cat.icon} {cat.name}
                          </span>
                        ) : <span style={{ color: "#d1d5db", fontSize: "0.8125rem" }}>未設定</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: sc.bg, color: sc.color, padding: "0.25rem 0.625rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700 }}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>
                        {(a.view_count || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
                        {a.published_at ? new Date(a.published_at).toLocaleDateString("ja-JP") : "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => setEditing(a)} title="編集"
                            style={{ padding: "0.375rem", background: "#eff6ff", border: "none", borderRadius: "0.5rem", color: "#2563eb", cursor: "pointer" }}>
                            <Edit3 style={{ width: "0.875rem", height: "0.875rem" }} />
                          </button>
                          <button onClick={() => toggleStatus(a)} title={a.status === "published" ? "下書きに戻す" : "公開"}
                            style={{ padding: "0.375rem", background: a.status === "published" ? "#fff7ed" : "#f0fdf4", border: "none", borderRadius: "0.5rem", color: a.status === "published" ? "#d97706" : "#16a34a", cursor: "pointer" }}>
                            {a.status === "published" ? <EyeOff style={{ width: "0.875rem", height: "0.875rem" }} /> : <Eye style={{ width: "0.875rem", height: "0.875rem" }} />}
                          </button>
                          {a.status === "published" && (
                            <Link href={`/blog/${cat?.slug ?? "category"}/${a.slug}`} target="_blank"
                              style={{ padding: "0.375rem", background: "#f3f4f6", border: "none", borderRadius: "0.5rem", color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center" }}>
                              <Globe style={{ width: "0.875rem", height: "0.875rem" }} />
                            </Link>
                          )}
                          <button onClick={() => handleDelete(a.id, a.title)} title="削除"
                            style={{ padding: "0.375rem", background: "#fff1f2", border: "none", borderRadius: "0.5rem", color: "#ef4444", cursor: "pointer" }}>
                            <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Editor modal */}
      {editing !== null && (
        <ArticleEditor
          article={typeof editing === "object" ? editing : {}}
          categories={categories}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
