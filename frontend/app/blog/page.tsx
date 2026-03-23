"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, TrendingUp, Clock, Eye, Tag, ChevronRight,
  Search, ArrowRight, Newspaper, Star, Flame
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color_code: string;
  description?: string;
  icon?: string;
  article_count?: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  view_count: number;
  category_id: string;
  article_categories: { name: string; color_code: string; slug: string; icon?: string };
  article_tags?: { tags: { name: string; color: string } }[];
}

// ── Fallback sample articles (shown if DB has no records yet) ──
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "1", title: "マンション外壁塗装の費用相場と業者選びのポイント", slug: "mansion-gaiheki-cost",
    excerpt: "外壁塗装は10〜15年に一度の大型修繕。費用相場や失敗しない業者選びのチェックリストを解説します。",
    featured_image: "", published_at: "2026-03-01T00:00:00Z", view_count: 1240,
    category_id: "1",
    article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" },
  },
  {
    id: "2", title: "2026年版 不動産投資の利回り相場と選ぶべき物件タイプ", slug: "realestate-yield-2026",
    excerpt: "都市部・地方別の利回り比較、区分マンション vs 一棟アパートの損益分析を最新データで解説。",
    featured_image: "", published_at: "2026-02-20T00:00:00Z", view_count: 2380,
    category_id: "2",
    article_categories: { name: "不動産投資", color_code: "#7c3aed", slug: "investment", icon: "📈" },
  },
  {
    id: "3", title: "建物診断AIが変える修繕計画 — Smart Asset AIの使い方", slug: "ai-diagnosis-howto",
    excerpt: "写真1枚でひび割れ・錆・劣化を自動検知。AIスコアから長期修繕計画を自動生成する方法を紹介。",
    featured_image: "", published_at: "2026-02-10T00:00:00Z", view_count: 870,
    category_id: "3",
    article_categories: { name: "AI・テクノロジー", color_code: "#2563eb", slug: "technology", icon: "🤖" },
  },
  {
    id: "4", title: "賃貸管理コストを50%削減する電子契約の導入ガイド", slug: "denshi-keiyaku-guide",
    excerpt: "電子署名・クラウド保管・印紙代ゼロで年間管理コストを大幅削減。導入事例と手順を詳しく解説。",
    featured_image: "", published_at: "2026-01-28T00:00:00Z", view_count: 1560,
    category_id: "4",
    article_categories: { name: "物件管理", color_code: "#d97706", slug: "management", icon: "🏢" },
  },
  {
    id: "5", title: "2026年 首都圏不動産市場トレンド — 金利上昇の影響と対策", slug: "market-trend-2026",
    excerpt: "日銀利上げが不動産市場に与える影響を分析。価格推移データと投資家が取るべき戦略を解説。",
    featured_image: "", published_at: "2026-01-15T00:00:00Z", view_count: 3210,
    category_id: "5",
    article_categories: { name: "市場動向", color_code: "#dc2626", slug: "market", icon: "📊" },
  },
  {
    id: "6", title: "優良リフォーム業者の見分け方 — 見積もり比較の5つの注意点", slug: "contractor-select-tips",
    excerpt: "相見積もりで騙されないために。見積書の読み方、悪徳業者チェックリスト、Smart Asset AIでの業者検索術。",
    featured_image: "", published_at: "2026-01-05T00:00:00Z", view_count: 1890,
    category_id: "1",
    article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" },
  },
];

const SAMPLE_CATEGORIES: Category[] = [
  { id: "1", name: "修繕・リフォーム", slug: "repair", color_code: "#16a34a", icon: "🔨", article_count: 24 },
  { id: "2", name: "不動産投資", slug: "investment", color_code: "#7c3aed", icon: "📈", article_count: 18 },
  { id: "3", name: "AI・テクノロジー", slug: "technology", color_code: "#2563eb", icon: "🤖", article_count: 12 },
  { id: "4", name: "物件管理", slug: "management", color_code: "#d97706", icon: "🏢", article_count: 15 },
  { id: "5", name: "市場動向", slug: "market", color_code: "#dc2626", icon: "📊", article_count: 20 },
  { id: "6", name: "法律・税金", slug: "legal", color_code: "#0891b2", icon: "⚖️", article_count: 10 },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const cat = article.article_categories;
  const href = `/blog/${cat.slug}/${article.slug}`;

  if (featured) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          background: "white", borderRadius: "1.25rem", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.14)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}>
          {/* Image placeholder */}
          <div style={{ height: "220px", background: `linear-gradient(135deg, ${cat.color_code}20, ${cat.color_code}40)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <span style={{ fontSize: "4rem" }}>{cat.icon || "📄"}</span>
            <div style={{ position: "absolute", top: "1rem", left: "1rem", background: cat.color_code, color: "white", padding: "0.25rem 0.75rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700 }}>
              {cat.icon} {cat.name}
            </div>
            {article.view_count > 2000 && (
              <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "#ef4444", color: "white", padding: "0.25rem 0.75rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Flame style={{ width: "0.75rem", height: "0.75rem" }} /> 人気
              </div>
            )}
          </div>
          <div style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "0.625rem", lineHeight: 1.5 }}>{article.title}</h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>{article.excerpt}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem", color: "#9ca3af" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock style={{ width: "0.75rem", height: "0.75rem" }} />{formatDate(article.published_at)}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye style={{ width: "0.75rem", height: "0.75rem" }} />{article.view_count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "white", borderRadius: "1rem", padding: "1.25rem",
        border: "1px solid #f0f0f0", display: "flex", gap: "1rem", alignItems: "flex-start",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)"; }}>
        <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "0.75rem", background: `${cat.color_code}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.5rem" }}>
          {cat.icon || "📄"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <span style={{ background: `${cat.color_code}15`, color: cat.color_code, padding: "0.125rem 0.5rem", borderRadius: "2rem", fontSize: "0.6875rem", fontWeight: 700 }}>{cat.name}</span>
            {article.view_count > 1500 && <span style={{ background: "#fef2f2", color: "#dc2626", padding: "0.125rem 0.5rem", borderRadius: "2rem", fontSize: "0.6875rem", fontWeight: 700 }}>🔥 人気</span>}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.5, marginBottom: "0.25rem" }}>{article.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "#9ca3af" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock style={{ width: "0.6875rem", height: "0.6875rem" }} />{formatDate(article.published_at)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye style={{ width: "0.6875rem", height: "0.6875rem" }} />{article.view_count.toLocaleString()}</span>
          </div>
        </div>
        <ChevronRight style={{ width: "1rem", height: "1rem", color: "#d1d5db", flexShrink: 0, alignSelf: "center" }} />
      </div>
    </Link>
  );
}

export default function BlogListPage() {
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Try fetching real articles from Supabase
    const { data: artData } = await supabase
      .from("articles")
      .select(`*, article_categories(name, color_code, slug, icon), article_tags(tags(name, color))`)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20);

    if (artData && artData.length > 0) setArticles(artData);

    const { data: catData } = await supabase
      .from("article_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (catData && catData.length > 0) setCategories(catData);
    setLoading(false);
  };

  const filtered = articles.filter(a => {
    const matchCat = selectedCategory === "all" || a.article_categories?.slug === selectedCategory;
    const matchSearch = searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const popular = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const totalViews = articles.reduce((s, a) => s + a.view_count, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3.5rem" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)", color: "white", padding: "4rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", padding: "0.375rem 1rem", borderRadius: "2rem", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            <Newspaper style={{ width: "0.875rem", height: "0.875rem" }} /> Smart Asset AI メディア
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1rem", lineHeight: 1.2 }}>
            不動産オーナー・業者のための<br />実践情報メディア
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            修繕費の節約術、AI建物診断の活用法、不動産投資のリアルな情報をプロが解説
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {[
              { label: "記事数", value: `${articles.length}+` },
              { label: "月間PV", value: `${(totalViews / 1000).toFixed(0)}K+` },
              { label: "カテゴリ", value: `${categories.length}` },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.75rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ maxWidth: "480px", margin: "0 auto", position: "relative" }}>
            <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "1.125rem", height: "1.125rem", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="記事を検索... (例: 外壁塗装, 投資利回り)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.875rem 1rem 0.875rem 2.75rem", borderRadius: "0.875rem", border: "none", fontSize: "0.9375rem", boxSizing: "border-box", outline: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: "3.5rem", zIndex: 40 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.875rem 0", whiteSpace: "nowrap" }}>
            <button
              onClick={() => setSelectedCategory("all")}
              style={{ padding: "0.5rem 1.125rem", borderRadius: "2rem", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", background: selectedCategory === "all" ? "#111827" : "#f3f4f6", color: selectedCategory === "all" ? "white" : "#4b5563", transition: "all 0.2s" }}>
              すべて
            </button>
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                style={{ padding: "0.5rem 1.125rem", borderRadius: "2rem", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", background: selectedCategory === cat.slug ? cat.color_code : "#f3f4f6", color: selectedCategory === cat.slug ? "white" : "#4b5563", transition: "all 0.2s" }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem" }} className="blog-grid">

          {/* Main content */}
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>読み込み中...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
                <BookOpen style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem" }} />
                <p>記事が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* Featured grid */}
                {featured.length > 0 && (
                  <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Star style={{ width: "1.125rem", height: "1.125rem", color: "#f59e0b" }} />
                      {selectedCategory === "all" ? "注目の記事" : categories.find(c => c.slug === selectedCategory)?.name + " の記事"}
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                      {featured.map(a => <ArticleCard key={a.id} article={a} featured />)}
                    </div>
                  </div>
                )}

                {/* Rest list */}
                {rest.length > 0 && (
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <BookOpen style={{ width: "1.125rem", height: "1.125rem", color: "#6b7280" }} /> 全記事
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {rest.map(a => <ArticleCard key={a.id} article={a} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Popular articles */}
            <div style={{ background: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Flame style={{ width: "1rem", height: "1rem", color: "#ef4444" }} /> 人気記事
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {popular.map((a, i) => (
                  <Link key={a.id} href={`/blog/${a.article_categories.slug}/${a.slug}`} style={{ textDecoration: "none", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem", background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "#f3f4f6", color: i < 3 ? "white" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.75rem", flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#111827", lineHeight: 1.5, marginBottom: "0.25rem" }}>{a.title}</p>
                      <span style={{ fontSize: "0.6875rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye style={{ width: "0.625rem", height: "0.625rem" }} />{a.view_count.toLocaleString()} views</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{ background: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Tag style={{ width: "1rem", height: "1rem", color: "#6b7280" }} /> カテゴリ
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/blog/${cat.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", borderRadius: "0.75rem", background: "#f8fafc", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = `${cat.color_code}10`}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>{cat.icon} {cat.name}</span>
                    {cat.article_count && <span style={{ background: `${cat.color_code}20`, color: cat.color_code, padding: "0.125rem 0.5rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700 }}>{cat.article_count}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: "1.25rem", padding: "1.75rem", color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🤖</div>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>AI建物診断（無料）</h3>
              <p style={{ fontSize: "0.8125rem", opacity: 0.9, marginBottom: "1.25rem", lineHeight: 1.6 }}>写真1枚で外壁・屋根の劣化を自動診断。修繕費の目安を即時算出</p>
              <Link href="/diagnosis" style={{ display: "block", background: "white", color: "#2563eb", padding: "0.75rem", borderRadius: "0.875rem", fontWeight: 800, fontSize: "0.9375rem", textDecoration: "none" }}>
                無料で診断してみる →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
