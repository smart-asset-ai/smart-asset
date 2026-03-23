import Link from "next/link";
import { Shield, AlertTriangle, Scale, Users } from "lucide-react";

const card: React.CSSProperties = {
  background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "1.5rem",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)", paddingTop: "5rem", paddingBottom: "2.5rem" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Scale style={{ width: "1.75rem", height: "1.75rem", color: "white" }} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "white", marginBottom: "0.5rem" }}>利用規約</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>最終更新日：2025年1月1日　運営：合同会社GOAT</p>
        </div>
      </section>

      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Section 1 */}
          <section style={card}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb", flexShrink: 0 }} />
              第1条（サービスの概要と橋渡し原則）
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p>Smart Asset AI（以下「本サービス」）は、合同会社GOAT（以下「当社」）が運営する小規模不動産修繕マッチングプラットフォームです。</p>
              <p><strong style={{ color: "#111827" }}>当社はオーナー様と業者様を繋ぐ橋渡し役であり、実際の工事請負契約・工事内容・価格・品質・支払い等の責任は、オーナー様と業者様の間で発生するものとします。</strong></p>
              <p>当社は仲介手数料を受け取らず、業者様のプラン料金のみによって運営されます。工事の完成・品質・トラブルについて当社は一切の責任を負いません。</p>
            </div>
          </section>

          {/* Section 2 - BAN */}
          <section style={{ ...card, border: "1px solid rgba(251,146,60,0.4)" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield style={{ width: "1.25rem", height: "1.25rem", color: "#f97316", flexShrink: 0 }} />
              第2条（禁止事項・アカウント停止措置）
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p>以下の行為を禁止します。違反が確認された場合、<strong style={{ color: "#111827" }}>AIによる自動検知または管理者の判断により、警告・ランク降格・アカウントの一時停止（最大3年間）または永久停止（BAN）を行う場合があります。</strong></p>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li>虚偽情報の登録・提供</li>
                <li>本サービスを経由せず直接取引を行う行為（迂回契約）</li>
                <li>オーナー様または業者様への不当な圧力・脅迫</li>
                <li>不正なレビュー・評価の操作</li>
                <li>複数アカウントの作成</li>
                <li>法律に違反する工事・取引の斡旋</li>
                <li>当社または他のユーザーへの誹謗中傷</li>
                <li>建設業法・宅地建物取引業法等の関連法規への違反</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: "0.75rem", padding: "0.875rem" }}>
                <p style={{ fontWeight: 700, color: "#b45309", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>⚠️ BAN・停止措置について</p>
                <p style={{ color: "#92400e", fontSize: "0.8125rem", lineHeight: 1.6 }}>
                  アカウント停止の判断はAIシステムおよび管理者が行います。停止措置に対する不服申立ては、サイト内のお問い合わせフォームよりご連絡ください。ただし、不正行為が明確な場合は永久停止とし、申立ては受け付けない場合があります。停止期間中の料金は返金されません。
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Disputes */}
          <section style={{ ...card, border: "1px solid rgba(239,68,68,0.3)" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle style={{ width: "1.25rem", height: "1.25rem", color: "#ef4444", flexShrink: 0 }} />
              第3条（トラブル対応・免責事項）
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p><strong style={{ color: "#111827" }}>工事の品質・費用・日程・完成等に関するトラブルは、オーナー様と業者様の両者間で解決するものとします。</strong>当社はいかなるトラブルに対しても責任を負わず、損害賠償の義務を負いません。</p>
              <p>ただし、当社はトラブルが発生した場合に限り、以下のサポートを任意で提供することがあります。</p>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li><strong style={{ color: "#111827" }}>弁護士紹介サービス</strong>：建設工事・不動産に関するトラブルを専門とする弁護士をご紹介します。弁護士費用は当事者の負担となります。</li>
                <li>AIによるトラブル事案の記録・分析（悪質業者の特定・BAN措置）</li>
                <li>必要に応じた第三者機関へのエスカレーション支援</li>
              </ul>
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: "0.75rem", padding: "0.875rem" }}>
                <p style={{ fontWeight: 700, color: "#b91c1c", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>⚠️ 重要：トラブル時の連絡先</p>
                <p style={{ color: "#b91c1c", fontSize: "0.8125rem", lineHeight: 1.6, opacity: 0.85 }}>
                  トラブルが発生した場合は、まず双方で話し合いを行ってください。解決しない場合はサイト内のお問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 - AI Auto */}
          <section style={{ ...card, border: "1px solid rgba(167,139,250,0.3)" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield style={{ width: "1.25rem", height: "1.25rem", color: "#8b5cf6", flexShrink: 0 }} />
              第4条（AIによる自動運営）
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p>本サービスは99%以上の運営をAIが自動化しています。AIはスコアリング・マッチング・異常検知・違反検出・通知送信等を自動で行います。</p>
              <p>AIの判断によるランク変更・アカウント制限等は原則として有効とします。AIの誤判断が疑われる場合はサイト内のお問い合わせフォームよりご連絡ください。</p>
            </div>
          </section>

          {/* Section 5 - Pricing */}
          <section style={card}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scale style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280", flexShrink: 0 }} />
              第5条（料金・支払い・返金）
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p><strong style={{ color: "#111827" }}>共通：</strong>登録後3ヶ月間は、オーナー様・施工会社様ともに全機能を無料でご利用いただけます。3ヶ月経過後も無料のまま登録継続が可能ですが、チャット・電子サイン・修繕履歴機能は制限されます。</p>
              <div style={{ background: "#f0fdf4", borderRadius: "0.75rem", padding: "1rem 1.25rem", border: "1px solid #bbf7d0", marginBottom: "0.75rem" }}>
                <p style={{ fontWeight: 800, color: "#065f46", marginBottom: "0.625rem" }}>🏠 オーナー様向け有料プラン</p>
                <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "#065f46" }}>
                  <li>Aプラン（チャット・修繕履歴解放）：<strong>¥500/月（税抜）/ ¥550/月（税込・Stripe自動決済）</strong></li>
                  <li>Bプラン（全機能解放・電子サイン含む）：<strong>¥800/月（税抜）/ ¥880/月（税込・Stripe自動決済）</strong></li>
                  <li>キャンセルはいつでも可能（翌月末まで有効）</li>
                </ul>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: "0.75rem", padding: "1rem 1.25rem", border: "1px solid #bfdbfe" }}>
                <p style={{ fontWeight: 800, color: "#1e40af", marginBottom: "0.625rem" }}>🛠 施工会社様向け有料プラン</p>
                <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "#1e3a8a" }}>
                  <li>Aプラン（チャット・修繕履歴解放）：<strong>¥500/月（税抜）/ ¥550/月（税込・Stripe自動決済）</strong></li>
                  <li>Bプラン（全機能解放・電子サイン含む）：<strong>¥800/月（税抜）/ ¥880/月（税込・Stripe自動決済）</strong></li>
                  <li>キャンセルはいつでも可能（翌月末まで有効）</li>
                </ul>
              </div>
              <p>当サービスを使用したが、オーナー様、施工会社様で直接取引をし、サービス利用料の回避行為があった場合、AI自動検知により、不正行為と看做し、自動的に退会扱いとなり、再入会は不可となりますので、あらかじめご了承ください。</p>
              <p>※stripe決済の説明は<a href="/stripe-info" style={{ color: "#2563eb", textDecoration: "underline" }}>コチラ</a></p>
              <p>支払いはStripeによるクレジットカード決済となります。<strong style={{ color: "#111827" }}>一度お支払いいただいたプラン料金の返金はできません。</strong>アカウント停止の場合も同様です。</p>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy" style={card}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>プライバシーポリシー</h2>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p>当社は、登録情報（氏名・会社名・住所・連絡先等）をサービス提供・AIスコアリング・改善目的のみに使用します。第三者への販売・提供は行いません。</p>
              <p>ユーザーの行動データはサービス改善のために匿名化して分析する場合があります。</p>
            </div>
          </section>

          {/* Tokusho */}
          <section id="transactions" style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "2rem", height: "2rem", background: "#fef3c7", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⚖️</div>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#111827" }}>特定商取引法に基づく表記</h2>
            </div>
            <dl style={{ fontSize: "0.875rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { label: "販売業者名",     value: "合同会社GOAT" },
                { label: "代表責任者",     value: "飯田 大地" },
                { label: "所在地",         value: "請求があった場合は遅滞なく開示します" },
                { label: "電話番号",       value: "請求があった場合は遅滞なく開示します" },
                { label: "メール",         value: null },
                { label: "URL",           value: "https://smart-asset.ai" },
                { label: "サービス名",     value: "Smart Asset AI" },
                { label: "販売価格",       value: "登録後3ヶ月間は全機能無料\nAプラン：¥500/月（税抜）¥550/月（税込）\nBプラン：¥800/月（税抜）¥880/月（税込）\n※オーナー・施工会社ともに同額" },
                { label: "無料期間",       value: "登録後3ヶ月間は全機能を無料で利用可能。3ヶ月経過後も無料で登録継続可（チャット・電子サイン・修繕履歴は有料プランで解除）" },
                { label: "支払方法",       value: "クレジットカード（Stripe）/ 銀行振込（一部）" },
                { label: "支払時期",       value: "月額プランは毎月自動決済。成約手数料は成約確認後に請求。" },
                { label: "サービス提供",   value: "登録完了後、即日利用可能" },
                { label: "キャンセル",     value: "月額プランはいつでもキャンセル可能。翌月末日まで有効。" },
                { label: "返金",           value: "原則不可。ただし、当社の重大な過失によりサービスを提供できなかった場合はこの限りではありません。" },
                { label: "動作環境",       value: "Safari / Chrome 最新版推奨（iOS・Android・PC対応）" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid #f3f4f6" }}>
                  <dt style={{ color: "#6b7280", width: "7rem", flexShrink: 0, fontWeight: 600, fontSize: "0.8125rem", paddingTop: "0.0625rem" }}>{item.label}</dt>
                  <dd style={{ color: "#111827", flex: 1, lineHeight: 1.65, whiteSpace: "pre-line" }}>
                    {item.value ?? (
                      <a href="mailto:info@smart-asset.ai" style={{ color: "#2563eb" }}>info@smart-asset.ai</a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div style={{ marginTop: "1.25rem", background: "#fffbeb", borderRadius: "0.75rem", padding: "0.875rem 1rem", border: "1px solid #fde68a", fontSize: "0.8125rem", color: "#92400e", lineHeight: 1.7 }}>
              ⚠️ 当サービスはオーナーと施工会社の<strong>仲介プラットフォーム</strong>です。工事契約の当事者はオーナーと施工会社であり、当社は契約当事者ではありません。
            </div>
          </section>

          <div style={{ textAlign: "center", fontSize: "0.8125rem", color: "#9ca3af" }}>
            <p>
              <Link href="/" style={{ color: "#9ca3af" }}>← ホームに戻る</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
