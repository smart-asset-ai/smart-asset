# ClaudeCode 最終実装指示書（完全版）
## Smart Asset AI — 全フェーズ一括完成
### 作成: 2026-03-08

---

## 前提確認

- サーバー: ubuntu@141.253.121.51
- フロントエンド: ~/smart-asset/frontend（Next.js + TypeScript）
- バックアップ: ~/smart-asset/frontend_backup_20260308_1408
- ビルド: `cd ~/smart-asset/frontend && npm run build && pm2 restart frontend`
- UI原則: **必ず既存のsmart-asset.aiデザインに合わせること**
  - カラー: #0f172a / #1e3a8a / #2563eb / #16a34a
  - カード: white背景・borderRadius 1.25rem・boxShadow 0 1px 4px rgba(0,0,0,0.07)
  - フォント: -apple-system, BlinkMacSystemFont, 'Hiragino Sans'

---

## 【完了済み】Phase 1 + 2（変更不要）
- project_rooms / messages / project_photos / contracts テーブル ✅
- チャット・ファイルアップロード API ✅
- /owner/projects/[roomId] / /contractor/projects/[roomId] ✅
- ElectronicSignModal（電子サイン）✅
- 契約書PDF生成・Storage保存 ✅

---

## 【実装A】Phase 3 — 工事写真・完了承認フロー

### A-1. 施工会社側：工事写真アップロード

`/contractor/projects/[roomId]/page.tsx` に追加：

```
status === 'in_progress' の時：
- 「工事写真をアップロード」ボタン表示
- クリック → ファイル選択（複数可）
- 写真種別選択: before（着工前）/ progress（工事中）/ after（完了）
- アップロード先: /api/upload（type=photo）
- アップロード後: project_photos テーブルに保存
- チャット欄に写真メッセージとして表示

「工事完了を報告する」ボタン（after写真が1枚以上ある場合のみ活性）:
- クリック → project_rooms.status = 'completed_requested'
- オーナーにメール通知（またはサイト内通知バナー）:
  「施工会社から工事完了の報告が届きました。内容をご確認ください。」
```

### A-2. オーナー側：完了承認

`/owner/projects/[roomId]/page.tsx` に追加：

```
status === 'completed_requested' の時：
- 工事写真一覧を表示（before/progress/after をタブ切り替え）
- 「工事完了を承認する」ボタン
- クリック → project_rooms.status = 'completed'
- チャットに「工事完了が承認されました」のシステムメッセージ投稿
- 施工会社に通知: 「工事完了が承認されました。請求書をアップロードしてください。」
```

---

## 【実装B】Phase 4 — 支払い促し通知

### B-1. 着手金の促し（契約後）

```
project_rooms.status が 'in_progress' になった直後：
- オーナーのチャット画面に黄色バナーを表示：
  「✅ 契約が成立しました。施工会社へ着手金のお支払いをお願いします。
   お支払い方法は施工会社とご相談ください。」
- 施工会社の画面にも：
  「✅ 契約が成立しました。着手金の受け取り後、工事を開始してください。」
```

### B-2. 最終金の促し（完了承認後）

```
project_rooms.status が 'closed'（または invoice_approved）になった直後：
- オーナーのチャット画面に緑バナーを表示：
  「工事が完了しました。施工会社へ最終金のお支払いをお願いします。
   請求書をご確認の上、指定口座へお振込みください。」
```

### B-3. 請求書アップロード・承認フロー

施工会社側（status === 'completed'）：
```
「請求書PDFをアップロード」ボタン
→ アップロード後: status = 'invoiced'
→ オーナーに通知
```

オーナー側（status === 'invoiced'）：
```
「請求書を確認・承認する」ボタン
→ PDF表示（Storageから）
→ 承認クリック: status = 'invoice_approved' → 'closed'
→ 最終金の支払い促しバナー表示
```

---

## 【実装C】Phase 5 — オーナー向け修繕管理機能

### C-1. Supabase テーブル追加

```sql
CREATE TABLE repair_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  room_id UUID REFERENCES project_rooms(id),
  work_type TEXT,
  contractor_name TEXT,
  amount INTEGER,
  completed_at DATE,
  next_inspection_years INTEGER DEFAULT 8,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**案件クローズ時の自動保存:**
project_rooms.status が 'closed' になった時点で repair_history に自動INSERT

### C-2. オーナーマイページにタブ追加

`/owner/mypage/page.tsx` に3タブを追加:

**タブ1: 修繕履歴**
```
物件別カード表示（既存designに合わせる）
各履歴行:
- 工種名 / 施工会社名 / 完了日 / 金額（¥表示）
- 工事写真サムネイル（クリックで拡大）
- 「詳細を見る」→ /owner/projects/[roomId] へ遷移
```

**タブ2: 書類保管庫**
```
物件別フォルダ表示
各書類:
- 📄 契約書PDF（電子署名済み）
- 📄 請求書PDF
- 🖼 工事完了写真まとめ
各行に「ダウンロード」ボタン（Supabase Storage の signed URL）
一括DLボタン（全書類をZIP、将来実装でもOK）
```

**タブ3: 費用レポート**
```
年別修繕費の棒グラフ（SVGまたはCSSで描画・外部ライブラリ不要）
物件別内訳リスト
CSVダウンロードボタン:
  カラム: 完了日,物件名,工種,施工会社,金額(税抜),メモ
  ファイル名: repair_report_YYYY.csv
```

### C-3. 次回修繕アラートバナー

`/owner/mypage/page.tsx` の最上部に表示:

```
工種ごとの目安年数:
外壁塗装: 8年 / 屋根: 12年 / 防水: 10年 / 給排水: 18年 / 外構: 12年

completed_at + next_inspection_years * 0.75 < 今日 の場合バナー表示:

⚠️ [物件名] の外壁塗装から6年が経過しました。
一般的に8年が再修繕の目安です。
[AI診断を受ける →] [業者を探す →]
```

---

## 【実装D】全ページ文言・アピール更新

### D-1. サービスの新しい価値訴求（全ページ共通）

既存の「マッチングサービス」から以下に転換:

**メインキャッチコピー（トップページ）:**
```
大規模修繕を改革。
地元の職人と直接やりとり。
```

**サービスの特徴（新規追加セクション）:**
```
見積もりから契約・完了まで、すべてこのアプリで完結。

① AI診断 — 第三者AIが見積もりの適正価格を客観評価
② 電子サイン契約 — 印紙税ゼロ。法的に有効な電子契約書を自動発行
③ 現場管理 — チャット・写真・書類を一元管理
④ 修繕台帳 — 工事履歴が自動蓄積。売却・保険・確定申告に活用
```

**印紙税節約の訴求（業者ページ・オーナーページに追加）:**
```
電子契約で印紙税ゼロ。
500万円の工事なら印紙代¥5,000 + 郵送費が不要。
月額¥1,000が何倍もの価値に。
```

### D-2. トップページ `/app/page.tsx` の更新

**statsカード（既存の数字カードを以下に変更）:**
```
{ value: "0円", label: "AI診断", sub: "登録不要・第三者が客観評価" }
{ value: "電子", label: "サイン契約", sub: "印紙税ゼロ・PDF自動発行" }
{ value: "全て", label: "アプリ内完結", sub: "見積→契約→完了まで" }
```

**新規セクション追加（ヒーロー下に）:**
```
「使い方 3ステップ」セクション:
Step 1: 無料でAI診断 → 見積もりの適正価格をAIが確認
Step 2: 地元業者とマッチング → チャットで見積もり受け取り
Step 3: 電子署名して契約 → 現場管理・完了まで一元管理
```

### D-3. オーナーページ `/app/owners/page.tsx` の更新

**ヒーローサブテキスト変更:**
```
「あなたが払ったお金は、あなたの建物を直す職人に届くべきです。」
AI診断 + 電子契約 + 修繕台帳が、すべて無料で使えます。
```

**WHY SECTIONに追加（既存カードの後に）:**
```
新カード: 「工事履歴が財産になる」
説明: 修繕履歴・写真・契約書が自動保存。
      建物の売却時・保険申請時・確定申告時に活用できます。
```

### D-4. 施工会社ページ `/app/contractors/page.tsx` の更新

**ヒーローサブテキスト:**
```
「あなたの技術は、正当に評価されるべきです。」
大手の下請けから卒業して、直接オーナーと仕事をしよう。
電子契約で印紙税ゼロ。月額¥1,000で受注管理ツールも使い放題。
```

**プランカード（現在¥2,000 → 以下に変更）:**
```
3ヶ月間 無料キャンペーン中
→ 以降 ¥1,000/月

含まれる機能:
✓ 案件応募・オーナー営業し放題
✓ チャット・ファイル送受信
✓ 電子サイン契約（印紙税ゼロ）
✓ 工事写真・請求書管理
✓ AIスコアによる優先表示
```

### D-5. モバイルトップ `/app/m/page.tsx` の更新

**クイックアクショングリッドに追加:**
```
{ icon: FileCheck, label: "電子契約", sub: "印紙税ゼロ", color: "#7c3aed", bg: "#f5f3ff", href: "/stripe-info" }
```

**stats更新:**
```
{ text: "電子サイン契約", sub: "印紙税ゼロ・法的有効", color: "#7c3aed" }
```

---

## 【実装E】利用規約・Stripe説明ページの更新

### E-1. 施工会社プランを利用規約に正確に記載

`/app/terms/page.tsx` の第5条に追記:

```
施工会社様向け料金プラン：
- 登録・地図掲載・プロフィール作成：無料
- 案件進行管理ツール（チャット・電子契約・写真管理）：
  初回登録から3ヶ月間無料キャンペーン後、月額¥1,000（Stripe自動決済）
- キャンセルはいつでも可能（翌月末まで有効）
```

---

## 最終確認チェックリスト

実装後、以下を全て確認してからビルドすること:

```
□ npm run build でエラーなし
□ pm2 restart frontend（id: 2）
□ https://smart-asset.ai で200確認
□ /owners ページに新機能説明あり
□ /contractors ページに3ヶ月無料+¥1,000/月記載
□ /owner/mypage に修繕履歴・書類・レポートタブあり
□ /owner/projects/[roomId] で写真UP・完了承認動作
□ /contractor/projects/[roomId] で写真UP・完了報告動作
□ モバイル（/m）で主要ページ確認
```

---

## ビルドエラー時の対処

```bash
rm -rf .next node_modules/.cache
npm run build
```

---

## 参考ファイル

- ~/smart-asset/PROJECT_FLOW_INSTRUCTIONS.md（詳細設計書）
- ~/smart-asset/REWRITE_BRIEF_V2.md（コンテンツ方針）
- ~/smart-asset/STRIPE_INSTRUCTIONS.md（Stripe実装詳細）
- バックアップ: ~/smart-asset/frontend_backup_20260308_1408
