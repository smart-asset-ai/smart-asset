"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronRight, ExternalLink,
  Shield, Home, FileText, AlertTriangle, Calculator,
  Hammer, Scale, CreditCard, Zap, Clock, Building2,
  Users, Star, ArrowRight, Info
} from "lucide-react";

type KnowledgeSection = {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  bg: string;
  items: { title: string; body: string; links?: { label: string; url: string }[] }[];
};

const SECTIONS: KnowledgeSection[] = [
  {
    id: "repair-basics",
    icon: Building2,
    title: "大規模修繕・長期修繕計画の基礎",
    color: "#16a34a",
    bg: "#f0fdf4",
    items: [
      {
        title: "大規模修繕とは？",
        body: "建物の外壁・屋根・防水・設備などを定期的にメンテナンスする工事の総称。マンションは通常12〜15年周期で行います。放置すると漏水・コンクリート劣化が進み、修繕コストが倍以上になることも。「小さいうちに直す」が鉄則です。",
      },
      {
        title: "長期修繕計画の考え方（10〜30年スパン）",
        body: "目安として【5年ごと】に点検、【10〜15年】で外壁塗装・防水工事、【20〜25年】で屋根・設備更新を計画します。戸建て・アパートの場合も同様の周期が参考になります。費用は建物規模・材質によりますが、延床100㎡あたり年間5〜10万円を積み立てるイメージが一般的です。",
      },
      {
        title: "修繕費積立の考え方",
        body: "賃貸アパートオーナーは「修繕積立金」を毎月自分で積み立てることを推奨します。国土交通省ガイドラインでは分譲マンションの修繕積立金は月額200円〜/㎡が目安。実際には不足するケースが多く、計画的な積立が重要です。",
        links: [
          { label: "国土交通省 マンション長期修繕計画", url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk5_000058.html" },
        ],
      },
      {
        title: "各工事の耐用年数と修繕周期",
        body: "外壁塗装：10〜15年 / 防水工事（ウレタン系）：10〜12年 / 屋根葺き替え：20〜30年 / 給排水管：20〜25年 / 鉄骨階段塗装：8〜12年 / エレベーター：20〜25年。これらを組み合わせた修繕計画表を作成することが重要です。",
      },
    ],
  },
  {
    id: "tax",
    icon: Calculator,
    title: "不動産オーナーの税金知識",
    color: "#2563eb",
    bg: "#eff6ff",
    items: [
      {
        title: "修繕費 vs 資本的支出の違い（重要！）",
        body: "修繕費＝現状回復目的（全額その年に経費計上可）。資本的支出＝価値UP・耐用年数延長（減価償却が必要）。外壁塗装は通常「修繕費」。ただし高級材料への変更など性能向上目的は「資本的支出」になります。20万円以下・3年以内の周期的修繕は「修繕費」として処理可能（所得税基本通達37-10〜12）。",
        links: [
          { label: "国税庁 修繕費の取扱い", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2210.htm" },
        ],
      },
      {
        title: "不動産所得と青色申告",
        body: "不動産賃貸収入は「不動産所得」として確定申告。青色申告（65万円特別控除）を活用すると大幅節税になります。青色申告には青色申告承認申請書の提出が必要（新規：開業から2ヶ月以内、既存：その年の3月15日まで）。記帳はクラウド会計（freee・マネーフォワード）を使うと楽です。",
        links: [
          { label: "国税庁 不動産所得", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1370.htm" },
        ],
      },
      {
        title: "消費税の扱い",
        body: "個人のアパートオーナーで住宅用賃貸のみの場合、通常は消費税非課税業者（課税売上1000万円以下）。修繕工事の費用は消費税込みで払いますが、非課税業者は消費税の還付を受けられません。ただし事業用物件（店舗・事務所）兼用の場合は要注意。インボイス制度（2023年〜）では業者がインボイス対応業者かどうかも確認が必要です。",
      },
      {
        title: "相続・贈与と不動産",
        body: "不動産は相続財産の中でも評価が複雑。路線価・固定資産税評価額で評価されるため、時価より低く評価される場合が多い（節税効果）。小規模宅地等の特例（330㎡まで80%減額）も活用できます。相続後の修繕費・リフォームは「取得費加算」の対象になる場合も。",
        links: [
          { label: "国税庁 相続税・贈与税", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/souzokunissue.htm" },
        ],
      },
    ],
  },
  {
    id: "subsidy",
    icon: Zap,
    title: "補助金・助成金・控除制度",
    color: "#d97706",
    bg: "#fffbeb",
    items: [
      {
        title: "省エネ改修補助金（最新情報）",
        body: "国土交通省の「子育てエコホーム支援事業」「先進的窓リノベ事業」「給湯省エネ事業」など。断熱・窓改修・高効率給湯器の導入で補助が受けられます。最新の制度は補助金ポータル（jGrants）で確認を。予算は早期に終了することが多いので早めの申請が重要です。",
        links: [
          { label: "国土交通省 住宅支援施策", url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_fr4_000043.html" },
          { label: "jGrants（補助金ポータル）", url: "https://jgrants.go.jp/" },
        ],
      },
      {
        title: "耐震改修補助",
        body: "旧耐震基準（1981年以前）の建物は自治体の耐震診断・改修補助が受けられることが多い。費用の1/2〜2/3、最大100万円以上の補助が出るケースも（自治体による）。まずは管轄の市区町村の住宅課に問い合わせを。",
        links: [
          { label: "国土交通省 耐震化補助", url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_fr2_000033.html" },
        ],
      },
      {
        title: "バリアフリー改修・介護リフォーム",
        body: "介護保険制度：要介護1以上の認定者は住宅改修費20万円まで（9割給付）。自治体によっては追加の補助も。手すり設置・段差解消・滑り止め・扉改修などが対象。事前申請が必要です。",
        links: [
          { label: "厚生労働省 住宅改修費の支給", url: "https://www.mhlw.go.jp/topics/kaigo/youseikettei/kaitei_2006/dl/35.pdf" },
        ],
      },
      {
        title: "住宅ローン控除・不動産取得税",
        body: "2024年〜の住宅ローン控除は借入残高の0.7%（最長13年）。省エネ基準適合住宅・ZEH・長期優良住宅で上限額が変わります。不動産取得税は原則4%ですが住宅用途・面積・新築等で軽減措置あり。取得後60日以内に都道府県に申告を忘れずに。",
      },
    ],
  },
  {
    id: "tenancy",
    icon: Home,
    title: "賃貸借契約・入退去の知識",
    color: "#7c3aed",
    bg: "#f5f3ff",
    items: [
      {
        title: "原状回復の考え方（ガイドラインに基づく）",
        body: "国土交通省「原状回復をめぐるトラブルとガイドライン」（2011年改訂版）が実務の基準。通常の使用による経年劣化・自然損耗はオーナー負担。タバコの汚れ・ペットによる損傷・故意の破損は借主負担。フローリング・壁紙の耐用年数（6年・8年）を考慮した負担割合が重要です。",
        links: [
          { label: "国土交通省 原状回復ガイドライン", url: "https://www.mlit.go.jp/jutakukentiku/house/torikumi/genzyokaifuku.htm" },
        ],
      },
      {
        title: "退去時のチェックポイント",
        body: "①入居時の室内写真と退去時を比較（入居時撮影が重要）②クリーニング費用の取り扱い③鍵交換費用（原則オーナー負担）④設備の故障記録⑤敷金精算のタイミング（退去後1ヶ月以内が一般的）。精算明細書は詳細に作成し、借主に説明できるようにすること。",
      },
      {
        title: "更新・解約・立ち退き",
        body: "普通借家契約：2年ごと更新が一般的。解約は6ヶ月前通知（貸主側）。正当事由が必要で立退料の支払いが必要な場合も。定期借家契約：期間満了で終了。再契約可。オーナーにとって管理しやすいが入居者が敬遠する場合も。最近は管理会社を通さず直接管理するオーナーも増えています。",
      },
      {
        title: "家賃滞納への対応",
        body: "1ヶ月滞納：まず電話・メール連絡。2ヶ月：内容証明郵便で督促。3ヶ月以上：保証会社への連絡（保証会社加入の場合）または少額訴訟（60万円以下）。明渡請求訴訟は時間・費用がかかるため、保証会社への加入と定期的なコミュニケーションが予防に効果的。",
        links: [
          { label: "法務省 少額訴訟", url: "https://www.moj.go.jp/MINJI/minji68.html" },
        ],
      },
    ],
  },
  {
    id: "construction",
    icon: Hammer,
    title: "建築・工事の基礎知識",
    color: "#dc2626",
    bg: "#fef2f2",
    items: [
      {
        title: "建設業許可とは",
        body: "500万円以上（建築一式は1500万円以上）の工事は建設業許可が必要（建設業法）。許可のない業者に発注すると法的トラブルになる場合があります。許可番号は「国土交通大臣（特定）××号」または「××都道府県知事（般○○）○○号」の形式。Smart Asset AIでは許可情報を登録時に確認しています。",
        links: [
          { label: "国土交通省 建設業許可検索", url: "https://etsuran2.mlit.go.jp/TAKKEN/" },
        ],
      },
      {
        title: "見積書の見方・チェックポイント",
        body: "①工事名・仕様が具体的に書かれているか②材料名・メーカー・グレードが記載されているか③数量・単価・金額の内訳があるか④諸経費・消費税の扱いが明確か⑤工期・支払い条件が記載されているか。「一式」という表記は後のトラブルのもと。必ず内訳を出してもらいましょう。",
      },
      {
        title: "契約書の必須事項",
        body: "①工事内容（仕様書・図面）②請負代金と支払い方法③工期（着工〜完工日）④瑕疵担保責任（完工後1〜5年）⑤変更時の取り決め⑥紛争解決方法。口頭での合意は避け、必ず書面（または電子契約）で締結を。当サービスでは契約書テンプレートを近日公開予定です。",
      },
      {
        title: "着工金・中間金・竣工金",
        body: "大規模工事では「着工金（30%程度）→中間金（40%程度）→竣工金（30%）」の分割払いが一般的。着工前に全額払うのは危険。完工検査後に竣工金を払うことで、手抜き工事・未完成リスクを軽減できます。Smart Asset AIでは着工金の支払い目安もご案内しています。",
      },
    ],
  },
  {
    id: "contract",
    icon: FileText,
    title: "契約書・印紙・電子契約",
    color: "#0891b2",
    bg: "#ecfeff",
    items: [
      {
        title: "印紙税の基礎",
        body: "請負契約書（工事）は印紙税の課税文書。100万円超〜200万円以下：200円、200万円超〜300万円以下：500円、300万円超〜500万円以下：1000円、500万円超〜1000万円以下：5000円（2024年現在の軽減税率）。印紙を貼らないこと自体は契約の効力に影響しませんが、過怠税（3倍）が課されます。",
        links: [
          { label: "国税庁 印紙税の税額一覧", url: "https://www.nta.go.jp/publication/pamph/inshi/pdf/0022010-044.pdf" },
        ],
      },
      {
        title: "電子契約のメリット",
        body: "電子契約（クラウドサイン・DocuSign等）では印紙税が不要（電子文書は課税対象外）。500万円の工事契約なら印紙5000円の節約になります。保管も楽でリモート締結が可能。ただし両者がシステム登録済みであること・電磁的記録として有効に成立していることが必要です。",
        links: [
          { label: "クラウドサイン", url: "https://www.cloudsign.jp/" },
        ],
      },
      {
        title: "瑕疵担保責任（契約不適合責任）",
        body: "2020年の民法改正により「瑕疵担保責任」→「契約不適合責任」に変更。引渡後に工事が仕様と違う・欠陥がある場合、オーナーは履行の追完・代金減額・損害賠償・解除を請求できます（民法559条・562条〜）。責任期間は契約で定め、一般的に1〜5年が多い。知った時から1年以内に通知が必要です。",
      },
    ],
  },
  {
    id: "legal",
    icon: Scale,
    title: "法律・クレーム対応",
    color: "#9333ea",
    bg: "#fdf4ff",
    items: [
      {
        title: "工事トラブルの解決手順",
        body: "①まず業者と書面で問題を指摘（内容証明推奨）②解決しない場合は建設工事紛争審査会（国土交通省所管・無料・迅速）③小額訴訟（60万円以下）④通常訴訟。まず電話・メールの証拠を残すことが大切。サイト内のチャットよりご相談いただけます。",
        links: [
          { label: "建設工事紛争審査会", url: "https://www.mlit.go.jp/totikensangyo/const/1_6_bt_000096.html" },
        ],
      },
      {
        title: "入居者クレーム対応の基本",
        body: "①クレームは素早く受け付け・記録②感情的にならず事実確認③緊急性の判断（漏水・設備故障は即日対応）④対応結果を文書で残す⑤費用負担の確認（修繕費か設備故障か）。入居者との関係を維持することが最終的な収益につながります。",
      },
      {
        title: "最近の判例・動向（2023〜2025年）",
        body: "①保証会社の代位弁済後の回収強化②孤独死・特殊清掃費用の借主・保証人への請求認容判例が増加③民泊禁止条項の有効性④外国人入居者への対応義務⑤デジタル化による契約書管理の重要性。賃貸管理の法改正は毎年ありますので、弁護士・不動産管理士との顧問契約も検討を。",
        links: [
          { label: "法テラス（無料法律相談）", url: "https://www.houterasu.or.jp/" },
        ],
      },
    ],
  },
  {
    id: "urban",
    icon: Building2,
    title: "都市計画・建築規制",
    color: "#0f766e",
    bg: "#f0fdfa",
    items: [
      {
        title: "用途地域とは",
        body: "住居系（第一種低層〜準住居）商業系（近隣商業・商業）工業系（準工業・工業・工業専用）の13種類。用途地域により建てられる建物の種類・高さ・容積率・建ぺい率が決まります。修繕工事自体は用途地域の制限を受けませんが、増築・用途変更は確認申請が必要なケースも。",
        links: [
          { label: "国土交通省 用途地域", url: "https://www.mlit.go.jp/crd/city/plan/03_mati/04/index.htm" },
        ],
      },
      {
        title: "確認申請が必要な工事",
        body: "床面積10㎡超の増築・修繕・模様替え（準防火・防火地域では増築面積問わず）は確認申請が必要。屋根の葺き替えは原則不要（大規模修繕でも現状維持なら不要）。ただし用途変更（住居→店舗など）は200㎡超で確認申請必要。リフォーム前に建築士に相談を推奨します。",
      },
    ],
  },
];

export default function OwnerKnowledgePage() {
  const [openSection, setOpenSection] = useState<string | null>(SECTIONS[0].id);
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)", paddingTop: "6rem", paddingBottom: "3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0 1.5rem", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <BookOpen style={{ width: "0.875rem", height: "0.875rem", color: "#c4b5fd" }} />
            <span style={{ color: "#c4b5fd", fontSize: "0.875rem", fontWeight: 700 }}>知識ハブ — オーナー向け無料ガイド</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: "1rem" }}>
            不動産オーナーが<br />知っておくべきこと、全部。
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.8, maxWidth: "36rem", marginBottom: "2rem" }}>
            修繕・税金・補助金・賃貸法律・契約書・電子契約・クレーム対応…AIがまとめた不動産オーナー必携の知識集です。随時更新。
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {SECTIONS.map(s => (
              <button key={s.id}
                onClick={() => { setOpenSection(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                <s.icon style={{ width: "0.75rem", height: "0.75rem" }} /> {s.title.slice(0, 10)}…
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bar */}
      <div style={{ background: "#fefce8", borderBottom: "1px solid #fde68a", padding: "0.75rem 1.5rem" }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#713f12", fontWeight: 600 }}>
            💡 知識を活用したら、実際に地元業者に修繕を依頼してみましょう
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href="/diagnosis" style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", background: "#7c3aed", borderRadius: "0.625rem", color: "white", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 700 }}>
              <Zap style={{ width: "0.875rem", height: "0.875rem" }} /> AI無料診断
            </Link>
            <Link href="/owner/contractors" style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", background: "#16a34a", borderRadius: "0.625rem", color: "white", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 700 }}>
              業者を探す →
            </Link>
          </div>
        </div>
      </div>

      {/* Knowledge sections */}
      <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        {SECTIONS.map(section => (
          <div key={section.id} id={section.id} style={{ marginBottom: "1rem" }}>
            {/* Section header */}
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", background: openSection === section.id ? section.bg : "white", borderRadius: openSection === section.id ? "1rem 1rem 0 0" : "1rem", border: `2px solid ${openSection === section.id ? section.color + "40" : "#e5e7eb"}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: section.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${section.color}30` }}>
                  <section.icon style={{ width: "1.25rem", height: "1.25rem", color: section.color }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111827" }}>{section.title}</span>
                <span style={{ background: section.bg, color: section.color, fontSize: "0.6875rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", border: `1px solid ${section.color}30` }}>{section.items.length}項目</span>
              </div>
              <ChevronDown style={{ width: "1.25rem", height: "1.25rem", color: "#9ca3af", transform: openSection === section.id ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
            </button>

            {/* Section body */}
            {openSection === section.id && (
              <div style={{ background: "white", border: `2px solid ${section.color}40`, borderTop: "none", borderRadius: "0 0 1rem 1rem", overflow: "hidden" }}>
                {section.items.map((item, idx) => (
                  <div key={idx} style={{ borderBottom: idx < section.items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <button
                      onClick={() => setOpenItem(openItem === `${section.id}-${idx}` ? null : `${section.id}-${idx}`)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111827" }}>{item.title}</span>
                      <ChevronDown style={{ width: "1rem", height: "1rem", color: "#9ca3af", flexShrink: 0, transform: openItem === `${section.id}-${idx}` ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                    {openItem === `${section.id}-${idx}` && (
                      <div style={{ padding: "0 1.5rem 1.25rem" }}>
                        <p style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: item.links ? "1rem" : 0 }}>{item.body}</p>
                        {item.links && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {item.links.map(link => (
                              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", background: section.bg, color: section.color, textDecoration: "none", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, border: `1px solid ${section.color}30` }}>
                                <ExternalLink style={{ width: "0.75rem", height: "0.75rem" }} /> {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{ marginTop: "2rem", background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: "1.25rem", padding: "2rem 1.5rem", textAlign: "center" }}>
          <Info style={{ width: "2rem", height: "2rem", color: "#c4b5fd", margin: "0 auto 0.75rem" }} />
          <h3 style={{ color: "white", fontWeight: 900, fontSize: "1.25rem", marginBottom: "0.5rem" }}>もっと詳しく知りたい場合</h3>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem", marginBottom: "1.25rem", lineHeight: 1.7 }}>
            工事に困った際・業者とのトラブル時はお気軽にご連絡ください
          </p>
          <a href="/m/diagnosis" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#4f46e5", color: "white", textDecoration: "none", padding: "0.875rem 1.75rem", borderRadius: "0.875rem", fontWeight: 800, fontSize: "0.9375rem" }}>
            AI診断・チャットで相談する <ArrowRight style={{ width: "1rem", height: "1rem" }} />
          </a>
        </div>
      </div>
    </div>
  );
}
