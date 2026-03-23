"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Clock, Eye, ArrowLeft, Tag, Share2, BookOpen,
  ChevronRight, User, Calendar, TrendingUp, AlertCircle
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  published_at: string;
  updated_at?: string;
  view_count: number;
  seo_title?: string;
  seo_description?: string;
  article_categories: { name: string; color_code: string; slug: string; icon?: string };
  article_tags?: { tags: { name: string; color: string } }[];
}

// ── Fallback sample article content ──
const FALLBACK_ARTICLE: Article = {
  id: "sample",
  title: "マンション外壁塗装の費用相場と業者選びのポイント",
  slug: "mansion-gaiheki-cost",
  excerpt: "外壁塗装は10〜15年に一度の大型修繕。費用相場や失敗しない業者選びのチェックリストを解説します。",
  content: `
<h2>外壁塗装の費用相場</h2>
<p>マンションの外壁塗装費用は、建物の規模・工法・塗料グレードによって大きく異なります。一般的な目安は以下の通りです。</p>

<table>
  <thead><tr><th>規模</th><th>費用目安</th><th>工期</th></tr></thead>
  <tbody>
    <tr><td>小規模（〜100㎡）</td><td>80〜150万円</td><td>1〜2週間</td></tr>
    <tr><td>中規模（100〜300㎡）</td><td>150〜400万円</td><td>2〜4週間</td></tr>
    <tr><td>大規模（300㎡〜）</td><td>400万円〜</td><td>1〜3ヶ月</td></tr>
  </tbody>
</table>

<h2>塗料の種類と耐久年数</h2>
<p>塗料選びは長期的なコストに大きく影響します。初期費用が高くても、高耐久塗料を選ぶと塗り替えサイクルが延びてトータルコストが下がるケースが多いです。</p>

<ul>
  <li><strong>ウレタン系（10年）</strong>：コストが安く普及品。頻繁な塗り替えが必要。</li>
  <li><strong>シリコン系（12〜15年）</strong>：コストパフォーマンスが高く最も人気。</li>
  <li><strong>フッ素系（15〜20年）</strong>：高耐久で長期視点でお得。初期費用は高め。</li>
  <li><strong>無機系（20年以上）</strong>：最高級。長期メンテナンスフリーを重視する場合に。</li>
</ul>

<h2>業者選びの5つのチェックポイント</h2>
<p>外壁塗装は高額な工事のため、業者選びで失敗すると大きな損失につながります。以下のポイントを必ず確認しましょう。</p>

<h3>① 複数社から相見積もりを取る</h3>
<p>最低3社以上から見積もりを取り、費用・工法・保証内容を比較することが重要です。Smart Asset AIでは、AIマッチングで最適な地域業者を素早く見つけることができます。</p>

<h3>② 工事内容を書面で確認</h3>
<p>口頭の説明だけでなく、工事仕様書に「使用塗料・塗り回数・下地処理内容」が明記されているか確認しましょう。</p>

<h3>③ 保証内容を確認</h3>
<p>優良業者は通常5〜10年の施工保証を提供します。保証書の内容（対象範囲・免責事項）も必ず確認してください。</p>

<h3>④ 資格・保険の確認</h3>
<p>塗装工事業の建設業許可や、労災・賠償保険への加入を確認しましょう。無資格業者への発注はトラブルの原因になります。</p>

<h3>⑤ 実績・口コミの確認</h3>
<p>過去の施工事例や顧客の口コミを確認することで、業者の実力と誠実さを見極めることができます。</p>

<h2>Smart Asset AIで外壁状態をAI診断</h2>
<p>外壁の劣化状態を写真1枚でAI分析し、修繕の緊急度と費用概算を瞬時に算出できます。業者への相談前にAI診断を活用することで、適切な費用感を持って交渉できます。</p>
  `,
  published_at: "2026-03-01T00:00:00Z",
  view_count: 1240,
  article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" },
};

const RELATED_FALLBACK: Article[] = [
  {
    id: "r2", title: "屋根修繕 vs 屋根葺き替え — 費用対効果の比較ガイド", slug: "yane-repair-vs-replace",
    excerpt: "修繕か葺き替えかの判断基準と費用比較を詳しく解説。",
    content: "", published_at: "2026-02-15T00:00:00Z", view_count: 980,
    article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" },
  },
  {
    id: "r3", title: "優良リフォーム業者の見分け方 — 見積もり比較の5つの注意点", slug: "contractor-select-tips",
    excerpt: "相見積もりで騙されないためのチェックリストを公開。",
    content: "", published_at: "2026-01-05T00:00:00Z", view_count: 1890,
    article_categories: { name: "修繕・リフォーム", color_code: "#16a34a", slug: "repair", icon: "🔨" },
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, "").length;
  return Math.max(1, Math.ceil(words / 400));
}

export default function ArticlePage() {
  const params = useParams<{ category: string; slug: string }>();
  const { category, slug } = params;

  const [article, setArticle] = useState<Article>(FALLBACK_ARTICLE);
  const [related, setRelated] = useState<Article[]>(RELATED_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("articles")
        .select(`*, article_categories(name, color_code, slug, icon), article_tags(tags(name, color))`)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (data) {
        setArticle(data);
        // increment view count
        await supabase.from("articles").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id);
        // fetch related
        const { data: rel } = await supabase
          .from("articles")
          .select(`*, article_categories(name, color_code, slug, icon)`)
          .eq("status", "published")
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .order("view_count", { ascending: false })
          .limit(3);
        if (rel && rel.length > 0) setRelated(rel);
      }
      setLoading(false);
    };
    load();
  }, [slug, category]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const cat = article.article_categories;
  const readTime = estimateReadTime(article.content || "");

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "3.5rem" }}>
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          <div style={{ width: "2rem", height: "2rem", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "3.5rem" }}>

      {/* Breadcrumb */}
      <div style={{ background: "white", borderBottom: "1px solid #f0f0f0", padding: "0.75rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#9ca3af", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>ホーム</Link>
          <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
          <Link href="/blog" style={{ color: "#6b7280", textDecoration: "none" }}>記事一覧</Link>
          <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
          <Link href={`/blog/${cat.slug}`} style={{ color: cat.color_code, textDecoration: "none", fontWeight: 600 }}>{cat.icon} {cat.name}</Link>
          <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
          <span style={{ color: "#374151" }}>{article.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem" }} className="article-grid">

          {/* Article body */}
          <article>

            {/* Header */}
            <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <Link href={`/blog/${cat.slug}`}
                  style={{ background: `${cat.color_code}15`, color: cat.color_code, padding: "0.375rem 0.875rem", borderRadius: "2rem", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  {cat.icon} {cat.name}
                </Link>
                {article.article_tags?.map(at => (
                  <span key={at.tags.name} style={{ background: "#f3f4f6", color: "#6b7280", padding: "0.25rem 0.625rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 600 }}>
                    #{at.tags.name}
                  </span>
                ))}
              </div>

              <h1 style={{ fontWeight: 900, fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "#111827", lineHeight: 1.4, marginBottom: "1.25rem" }}>{article.title}</h1>
              <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{article.excerpt}</p>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.8125rem", color: "#9ca3af", flexWrap: "wrap", paddingTop: "1.25rem", borderTop: "1px solid #f0f0f0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Calendar style={{ width: "0.875rem", height: "0.875rem" }} />{formatDate(article.published_at)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Eye style={{ width: "0.875rem", height: "0.875rem" }} />{article.view_count.toLocaleString()} 回閲覧</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Clock style={{ width: "0.875rem", height: "0.875rem" }} />約{readTime}分で読めます</span>
                <button onClick={handleShare}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", background: copied ? "#f0fdf4" : "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "2rem", color: copied ? "#16a34a" : "#6b7280", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                  <Share2 style={{ width: "0.75rem", height: "0.75rem" }} />
                  {copied ? "コピー完了！" : "シェア"}
                </button>
              </div>
            </div>

            {/* Article content */}
            <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem 2.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
              <div
                style={{ color: "#374151", lineHeight: 1.9, fontSize: "1rem" }}
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content || "<p>記事コンテンツを準備中です。</p>" }}
              />
            </div>

            {/* CTA banner */}
            <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: "1.5rem", padding: "2rem", color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontWeight: 900, fontSize: "1.125rem", marginBottom: "0.5rem" }}>🤖 AI建物診断で無料チェック</div>
                <p style={{ opacity: 0.9, fontSize: "0.875rem", lineHeight: 1.6 }}>写真1枚で外壁・屋根の劣化を自動診断。修繕が必要かすぐわかります。</p>
              </div>
              <Link href="/diagnosis" style={{ display: "inline-block", background: "white", color: "#2563eb", padding: "0.875rem 1.75rem", borderRadius: "0.875rem", fontWeight: 800, fontSize: "0.9375rem", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
                無料診断 →
              </Link>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BookOpen style={{ width: "1rem", height: "1rem", color: "#6b7280" }} /> 関連記事
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {related.map(r => (
                    <Link key={r.id} href={`/blog/${r.article_categories.slug}/${r.slug}`}
                      style={{ display: "flex", gap: "1rem", alignItems: "flex-start", textDecoration: "none", padding: "0.875rem", borderRadius: "0.875rem", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: `${r.article_categories.color_code}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                        {r.article_categories.icon || "📄"}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.5, marginBottom: "0.25rem" }}>{r.title}</p>
                        <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{formatDate(r.published_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Table of contents (generated from H2 headings) */}
            <div style={{ background: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #f0f0f0", position: "sticky", top: "5rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen style={{ width: "0.875rem", height: "0.875rem", color: "#6b7280" }} /> 目次
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(article.content || "").match(/<h[23][^>]*>([^<]+)<\/h[23]>/g)?.map((h, i) => {
                  const text = h.replace(/<[^>]+>/g, "");
                  const level = h.startsWith("<h3") ? 2 : 1;
                  return (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", paddingLeft: level === 2 ? "1rem" : "0" }}>
                      <span style={{ color: cat.color_code, fontWeight: 700, flexShrink: 0, fontSize: "0.75rem", marginTop: "0.1rem" }}>{level === 1 ? "●" : "○"}</span>
                      <span style={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.5 }}>{text}</span>
                    </div>
                  );
                }) ?? <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>目次を生成中...</p>}
              </div>
            </div>

            {/* AI Diagnosis CTA */}
            <div style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", borderRadius: "1.25rem", padding: "1.5rem", color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>今すぐ建物診断</h3>
              <p style={{ fontSize: "0.8125rem", opacity: 0.9, marginBottom: "1.25rem", lineHeight: 1.6 }}>写真1枚でAIが劣化を検知。修繕費の目安を即時算出します。</p>
              <Link href="/diagnosis" style={{ display: "block", background: "white", color: "#7c3aed", padding: "0.75rem", borderRadius: "0.875rem", fontWeight: 800, fontSize: "0.875rem", textDecoration: "none" }}>
                無料で診断する →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .article-content h2 {
          font-weight: 800; font-size: 1.25rem; color: #111827;
          margin: 2rem 0 1rem; padding-left: 0.875rem;
          border-left: 4px solid ${cat.color_code};
        }
        .article-content h3 {
          font-weight: 700; font-size: 1.0625rem; color: #1f2937;
          margin: 1.5rem 0 0.75rem;
        }
        .article-content p { margin-bottom: 1.25rem; }
        .article-content ul, .article-content ol { margin: 0 0 1.25rem 1.5rem; }
        .article-content li { margin-bottom: 0.5rem; }
        .article-content strong { font-weight: 700; color: #111827; }
        .article-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border-radius: 0.75rem; overflow: hidden; }
        .article-content th { background: #f8fafc; font-weight: 700; padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; border-bottom: 2px solid #e5e7eb; }
        .article-content td { padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9375rem; }
        .article-content tr:hover td { background: #f8fafc; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .article-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
