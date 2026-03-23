# ClaudeCode 実装指示書 — 案件進行管理フロー
## Smart Asset AI
### 作成: 2026-03-08

---

## 概要

マッチング成立後のオーナー・施工会社間の全フローをプラットフォーム内で完結させる。
外部連絡（LINE・メール直接）を不要にし、直接取引も防止する。

---

## 実装するフロー（全体）

```
① マッチング成立（既存機能）
         ↓
② 双方向チャット開始（新規）
         ↓
③ 施工会社が見積PDFをアップロード（新規）
         ↓
④ オーナーが見積を承認（新規）
         ↓
⑤ 電子サイン契約（双方がサイン）（新規）
         ↓
⑥ 着手金の支払い促し通知（新規）※Stripe実装前は通知のみ
         ↓
⑦ 工事中：施工会社が写真をアップロード（新規）
         ↓
⑧ 工事完了ボタン（施工会社）→ オーナーが完了承認（新規）
         ↓
⑨ 施工会社が請求書PDFをアップロード（新規）
         ↓
⑩ オーナーが請求書を承認（新規）
         ↓
⑪ 最終金の支払い促し通知（新規）※Stripe実装前は通知のみ
         ↓
⑫ 案件クローズ・レビュー投稿（新規）
```

---

## データベース設計（Supabase）

### 既存テーブル（変更なし）
- `properties`（案件）
- `contractors`（施工会社）
- `auth.users`（ユーザー）

### 新規テーブル

#### `project_rooms`（案件進行管理部屋）
```sql
CREATE TABLE project_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) UNIQUE,
  owner_id UUID REFERENCES auth.users(id),
  contractor_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'chatting',
  -- status: chatting / estimate_uploaded / estimate_approved /
  --         contract_signed / in_progress / completed_requested /
  --         completed / invoiced / invoice_approved / closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `messages`（チャットメッセージ）
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id),
  sender_id UUID REFERENCES auth.users(id),
  sender_role TEXT CHECK (sender_role IN ('owner', 'contractor')),
  message_type TEXT DEFAULT 'text',
  -- message_type: text / file / estimate / invoice / photo /
  --               system / approval_request / approval_done
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `contracts`（電子契約）
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id),
  property_id UUID REFERENCES properties(id),
  contract_amount INTEGER,
  advance_amount INTEGER,    -- 着手金
  final_amount INTEGER,      -- 最終金
  terms TEXT,                -- 契約条件テキスト
  document_hash TEXT,        -- SHA-256 of contract content
  owner_signed_at TIMESTAMPTZ,
  owner_ip TEXT,
  contractor_signed_at TIMESTAMPTZ,
  contractor_ip TEXT,
  pdf_url TEXT,              -- Supabase Storage
  status TEXT DEFAULT 'pending',
  -- status: pending / owner_signed / fully_signed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `project_photos`（工事写真）
```sql
CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id),
  uploader_id UUID REFERENCES auth.users(id),
  photo_type TEXT DEFAULT 'progress',
  -- photo_type: before / progress / after
  file_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## フロントエンド実装

### 新規ページ・コンポーネント

---

### A. 案件進行ページ（オーナー側）
`app/owner/projects/[roomId]/page.tsx`

**表示内容（statusに応じて変化）：**
```
ステータスバー（①〜⑫の現在位置を視覚的に表示）

[チャットエリア]
- メッセージ一覧（テキスト・ファイル・写真）
- ファイル添付ボタン
- テキスト入力 + 送信

[アクションパネル（statusに応じてボタン変化）]
- estimate_uploaded → 「見積を確認・承認する」ボタン
- estimate_approved → 「電子署名して契約する」ボタン
- contract_signed   → 「着手金の支払いを完了しました」ボタン
- completed_requested → 「工事完了を承認する」ボタン
- invoiced          → 「請求書を確認・承認する」ボタン
- invoice_approved  → 「最終金の支払いを完了しました」ボタン
```

---

### B. 案件進行ページ（施工会社側）
`app/contractor/projects/[roomId]/page.tsx`

**表示内容：**
```
ステータスバー

[チャットエリア]（同上）

[アクションパネル]
- chatting          → 「見積PDFをアップロード」ボタン
- estimate_approved → 「電子署名して契約する」ボタン
- contract_signed   → 「工事写真をアップロード」ボタン + 「工事完了を報告する」ボタン
- completed         → 「請求書PDFをアップロード」ボタン
- closed            → 完了バッジ表示
```

---

### C. 電子サインモーダル
`components/ElectronicSignModal.tsx`

```
表示内容：
1. 契約内容の全文表示（スクロール）
   - 物件名・住所
   - 工事内容（見積PDFの要約）
   - 成約金額・着手金・最終金
   - 工期
   - Smart Asset AI 利用規約への同意

2. 「上記内容に同意して電子署名する」ボタン

押下時の処理：
1. 契約内容のSHA-256ハッシュ生成（client側）
2. POST /api/contracts/sign
   { roomId, role, documentHash }
3. DB: contracts テーブルに署名記録
   { signed_at: NOW(), ip: request.ip }
4. 双方署名完了で:
   - contracts.status = 'fully_signed'
   - project_rooms.status = 'in_progress'
   - 契約書PDFを生成してSupabase Storageに保存
   - 双方にメールで契約書PDF送付
```

---

### D. 契約書PDF生成API
`app/api/contracts/generate-pdf/route.ts`

```
使用ライブラリ: pdf-lib（npm install pdf-lib）

生成する契約書の内容:
- タイトル：「工事請負契約書」
- 発注者（オーナー）氏名・住所
- 受注者（施工会社）会社名・住所・担当者名
- 工事内容
- 契約金額（税抜・税込）
- 着手金額・支払い時期
- 最終金額・支払い時期
- 工期（開始〜完了予定）
- 署名欄：「電子署名済み」+ 署名日時 + IPアドレス（最後4桁マスク）
- 文書ハッシュ（SHA-256）
- 発行日時
- フッター：「本契約書はSmart Asset AIプラットフォームにて電子署名されました」

生成後: Supabase Storageの contracts/ フォルダに保存
返却: PDF URL
```

---

### E. チャットAPI（リアルタイム）
`app/api/messages/route.ts`

```
GET  /api/messages?roomId=xxx → メッセージ一覧取得
POST /api/messages → メッセージ送信
     { roomId, messageType, content, fileUrl?, fileName? }

リアルタイム更新: Supabase Realtime で
  supabase.channel('room:'+roomId).on('postgres_changes'...) を使用
```

---

### F. ファイルアップロードAPI
`app/api/upload/route.ts`

```
POST /api/upload
FormData: { file, roomId, type }
type: estimate | invoice | photo

処理:
1. Supabase Storage にアップロード
   パス: projects/{roomId}/{type}/{filename}
2. messages テーブルに file メッセージとして記録
3. room の status を更新
   - estimate → estimate_uploaded
   - invoice  → invoiced
4. 相手方に通知（メール or サイト内通知）

返却: { fileUrl, messageId }
```

---

### G. 通知メール（支払い促し）

```
着手金促し（contract_signed 後）:
  オーナーへ: 「契約が成立しました。着手金 ¥{amount} のお支払いをお願いします」
  ※ 振込先は施工会社のプロフィールに記載の口座（現時点）

最終金促し（invoice_approved 後）:
  オーナーへ: 「工事が完了しました。最終金 ¥{amount} のお支払いをお願いします」

将来（Stripe実装後）: ボタン1つで決済完了に変更
```

---

## ナビゲーション追加

### オーナーマイページ `app/owner/mypage/page.tsx`
- 進行中案件カードに「進捗を確認する」ボタン追加
- → `/owner/projects/[roomId]` へ遷移

### 施工会社マイページ `app/contractor/mypage/page.tsx`
- 進行中案件カードに「現場管理へ」ボタン追加
- → `/contractor/projects/[roomId]` へ遷移

---

## 実装手順（優先順位）

```
Phase 1（コア機能）:
1. Supabaseテーブル4つを作成（SQL実行）
2. チャット機能（messages API + リアルタイム）
3. ファイルアップロード（見積PDF・請求書PDF）
4. ステータス管理（project_rooms.status）

Phase 2（電子契約）:
5. pdf-lib インストール・契約書PDF生成
6. ElectronicSignModal コンポーネント
7. 署名API（/api/contracts/sign）
8. 署名済みPDF保存・メール送付

Phase 3（写真・完了）:
9. 工事写真アップロード
10. 完了承認フロー
11. 通知メール

Phase 4（将来・Stripe連携）:
12. 着手金・最終金のStripe決済ボタン
```

---

## 技術スタック

- PDF生成: `pdf-lib`（npm install pdf-lib）
- ハッシュ: `crypto`（Node.js標準）
- ファイル保存: Supabase Storage（既存）
- リアルタイム: Supabase Realtime（既存）
- メール: 既存のSendGrid or Resend設定を流用
- フロント: Next.js + TypeScript（既存）

---

## 注意事項

- 既存ページのデザイン・レイアウトは変更しないこと
- モバイル(/m/)配下は後回し（PC版優先）
- ビルド: `cd ~/smart-asset/frontend && npm run build`
- エラー時: `rm -rf .next node_modules/.cache` → 再ビルド
- pm2 restart frontend（id: 2）

---

## 参考ファイル

- 設計書v2: ~/smart-asset/REWRITE_BRIEF_V2.md
- Stripe手順書: ~/smart-asset/STRIPE_INSTRUCTIONS.md
- 本指示書: ~/smart-asset/PROJECT_FLOW_INSTRUCTIONS.md

---

## 追加実装：オーナー向け修繕管理機能（Phase 5）

### UI方針
- **必ずsmart-asset.aiの既存デザインに合わせること**
- カラー: ネイビー（#0f172a / #1e3a8a）・ブルー（#2563eb）・グリーン（#16a34a）
- カード: white背景・borderRadius 1.25rem・boxShadow 0 1px 4px rgba(0,0,0,0.07)
- フォント: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif
- 既存コンポーネントを積極的に再利用すること

---

### 機能1: 修繕履歴台帳

**ページ:** `app/owner/mypage/page.tsx` に「修繕履歴」タブを追加

**DB:** project_rooms + contracts + project_photos が完成すれば自動生成可能
→ 案件クローズ時に `repair_history` テーブルに自動保存

```sql
CREATE TABLE repair_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  room_id UUID REFERENCES project_rooms(id),
  work_type TEXT,        -- 外壁塗装・屋根修繕・防水工事 等
  contractor_name TEXT,
  amount INTEGER,        -- 税抜金額
  completed_at DATE,
  next_inspection_years INTEGER DEFAULT 7, -- 次回点検目安年数
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI表示:**
```
物件ごとにカード表示
┌─────────────────────────────┐
│ 🏠 ○○マンション             │
│ 外壁塗装   2024/03  ¥850,000│
│ 防水工事   2022/08  ¥420,000│
│ 屋根修繕   2020/11  ¥380,000│
└─────────────────────────────┘
```

---

### 機能2: 次回修繕アラート

**工種別の目安年数（AI通知ロジック）:**
```
外壁塗装:    7〜10年
屋根塗装:    10〜15年
防水工事:    8〜12年
給排水管:    15〜20年
外構・舗装:  10〜15年
```

**通知タイミング:**
- 完了日 + 目安年数の75%経過時点（早めの検討促し）
- オーナーマイページのバナー表示 + メール通知

**UI:**
```
⚠️ そろそろ検討時期のお知らせ
外壁塗装（○○マンション）から 6年が経過しました。
一般的に7〜10年が再塗装の目安です。
[AI診断を受ける] [業者を探す]
```

---

### 機能3: 書類保管庫

**保存される書類（自動）:**
- 電子契約書PDF（案件クローズ時）
- 工事完了写真まとめPDF（自動生成）
- 業者がアップした見積・請求書PDF

**ページ:** `app/owner/documents/page.tsx`（新規）

**UI:**
```
物件別フォルダ表示
📁 ○○マンション
  📄 工事請負契約書_2024-03.pdf
  📄 工事完了写真_2024-05.pdf
  📄 請求書_2024-05.pdf
  📄 工事請負契約書_2022-08.pdf
```
- ダウンロードボタン（Supabase Storage URL）
- 売却時・保険申請時のワンクリック一括DL

---

### 機能4: 修繕費レポート

**ページ:** オーナーマイページに「費用レポート」タブ

**表示内容:**
- 年別修繕費棒グラフ（recharts または SVGで描画）
- 物件別内訳
- 工種別内訳
- 確定申告用CSV出力ボタン（不動産所得の経費として使用可）

**UI例:**
```
2024年の修繕費合計: ¥1,270,000
  外壁塗装   ¥850,000 (67%)
  防水工事   ¥420,000 (33%)

[CSVダウンロード（確定申告用）]
```

---

### ナビゲーション追加

`app/owner/mypage/page.tsx` のタブに追加:
- 「修繕履歴」タブ
- 「書類保管庫」タブ  
- 「費用レポート」タブ

アラートバナーをマイページ最上部に表示。

---

### 実装優先順位（Phase 5）
1. repair_history テーブル作成
2. 案件クローズ時の自動保存ロジック
3. 修繕履歴UIタブ
4. 書類保管庫ページ
5. 次回修繕アラート（バナー表示）
6. 費用レポート + CSVエクスポート

