"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Clock, Eye, ChevronRight, ArrowLeft, Tag } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  view_count: number;
  article_categories: { name: string; color_code: string; slug: string; icon?: string };
}

// Fallback data per category
const CATEGORY_META: Record<string, { name: string; color: string; icon: string; desc: string }> = {
  repair:     { name: "修繕・リフォーム", color: "#16a34a", icon: "🔨", desc: "外壁・屋根・設備修繕のコスト節約術と業者選びのノウハウ" },
  investment: { name: "不動産投資",     color: "#7c3aed", icon: "📈", desc: "利回り分析・物件選び・融資戦略を専門家が解説" },
  technology: { name: "AI・テクノロジー",color: "#2563eb", icon: "🤖", desc: "AI診断・電子署名・クラウド管理でコスト削減" },
  management: { name: "物件管理",       color: "#d97706", icon: "🏢", desc: "入居者対応・修繕管理・確定申告を効率化" },
  market:     { name: "市場動向",       color: "#dc2626", icon: "📊", desc: "最新データで読み解く不動産市場トレンド分析" },
  legal:      { name: "法律・税金",     color: "#0891b2", icon: "⚖️", desc: "相続・節税・借地権など法務税務の実務解説" },
};

const FALLBACK_ARTICLES: Record<string, Article[]> = {
  repair: [
    { id: "r1", title: "マンション外壁塗装の費用相場と業者選びのポイント", slug: "mansion-gaiheki-cost", excerpt: "10〜15年に一度の外壁塗装。費用相場と失敗しない業者選びを解説。", published_at: "2026-03-01T00:00:00Z", view_count: 1240, category_id: "1", article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" } } as Article,
    { id: "r2", title: "屋根修繕 vs 屋根葺き替え — 費用対効果の比較ガイド", slug: "yane-repair-vs-replace", excerpt: "修繕か葺き替えかの判断基準と費用比較を詳しく解説。", published_at: "2026-02-15T00:00:00Z", view_count: 980, category_id: "1", article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" } } as Article,
    { id: "r3", title: "優良リフォーム業者の見分け方 — 見積もり比較の5つの注意点", slug: "contractor-select-tips", excerpt: "相見積もりで騙されないためのチェックリストを公開。", published_at: "2026-01-05T00:00:00Z", view_count: 1890, category_id: "1", article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" } } as Article,
  ],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const slug = params.category;
  const meta = CATEGORY_META[slug] ?? { name: slug, color: "#6b7280", icon: "📄", desc: "" };

  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES[slug] ?? []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("articles")
        .select(`*, article_categories!inner(name, color_code, slug, icon)`)
        .eq("status", "published")
        .eq("article_categories.slug", slug)
        .order("published_at", { ascending: false });
      if (data && data.length > 0) setArticles(data);
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3.5rem" }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${meta.color}dd, ${meta.color})`, color: "white", padding: "3rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} /> 記事一覧に戻る
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "1rem", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
              {meta.icon}
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "0.5rem" }}>{meta.name}</h1>
              <p style={{ opacity: 0.9, fontSize: "1rem" }}>{meta.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>読み込み中...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>このカテゴリの記事はまだありません</p>
            <Link href="/blog" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>← 記事一覧へ</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {articles.map(a => (
              <Link key={a.id} href={`/blog/${slug}/${a.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}>
                  <div style={{ height: "160px", background: `${meta.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>
                    {meta.icon}
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h2 style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.5, marginBottom: "0.625rem" }}>{a.title}</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.8125rem", lineHeight: 1.7, marginBottom: "1rem" }}>{a.excerpt}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock style={{ width: "0.625rem", height: "0.625rem" }} />{formatDate(a.published_at)}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye style={{ width: "0.625rem", height: "0.625rem" }} />{a.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
