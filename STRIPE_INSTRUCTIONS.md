# ClaudeCode 実装指示書 — Stripe成約時決済フロー
## Smart Asset AI

---

## 前提・環境

- サーバー: ubuntu@141.253.121.51
- SSH鍵: 自分の環境のデフォルト鍵を使用（~/.ssh/id_rsa 等）
- フロントエンド: ~/smart-asset/frontend（Next.js + TypeScript + Turbopack）
- バックエンド: ~/smart-asset/backend（Node.js/Express, ポート3001）
- 既存の環境変数: ~/smart-asset/frontend/.env.local（Supabase・既存Stripe testキーあり）
- PM2: frontend = id 2 / backend = id 1
- ビルド: `npm run build` → `pm2 restart frontend`

---

## ゴール

**成約確定ボタンを押したタイミングで、オーナーと施工会社それぞれからStripeで成約金額（税抜）の0.5%を徴収する。**

- 登録時はCC不要（現状維持）
- 成約時に初めてStripeカード入力UIを表示
- 双方が決済完了したら案件をクローズ

---

## 実装タスク一覧

### TASK 1: Stripeライブラリのインストール

```bash
cd ~/smart-asset/frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

### TASK 2: バックエンドAPI — PaymentIntent作成

ファイル: `~/smart-asset/backend/src/routes/stripe.js`（新規作成 or 既存に追記）

```
エンドポイント: POST /api/stripe/create-payment-intent
認証: Bearer token（Supabase JWT）必須

リクエストボディ:
{
  propertyId: string,       // 案件ID
  contractAmount: number,   // 成約金額（税抜・円）
  role: "owner" | "contractor"  // 呼び出し元のロール
}

処理:
1. contractAmount × 0.005 = feeAmount（小数点以下切り捨て）
2. stripe.paymentIntents.create({
     amount: feeAmount,
     currency: "jpy",
     metadata: { propertyId, role, contractAmount }
   })
3. clientSecret を返す

レスポンス:
{ clientSecret: string, amount: number }
```

---

### TASK 3: バックエンドAPI — Webhook

ファイル: `~/smart-asset/backend/src/routes/stripe.js`

```
エンドポイント: POST /api/stripe/webhook
ミドルウェア: raw bodyパーサー必須（express.raw）
Stripeシグネチャ検証: stripe.webhooks.constructEvent()

イベント処理: payment_intent.succeeded
処理:
1. metadata.propertyId, metadata.role を取得
2. Supabaseの payments テーブルに記録:
   { property_id, role, amount, stripe_payment_intent_id, status: "paid" }
3. 双方(owner + contractor)のpaymentsが揃ったら
   propertiesテーブルの status を "completed" に更新
```

---

### TASK 4: Supabase — テーブル追加

Supabaseのダッシュボード or マイグレーションで以下のテーブルを作成:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'contractor')),
  amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### TASK 5: フロントエンド — 成約確定モーダル

ファイル: `~/smart-asset/frontend/components/SuccessPaymentModal.tsx`（新規作成）

```
機能:
- Stripe Elementsのカード入力UI
- 金額表示（例：「成約金額100万円 → 手数料5,000円」）
- 「支払って成約を確定する」ボタン
- 決済完了後に親コンポーネントにコールバック

使用するStripeコンポーネント:
- loadStripe（NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY）
- Elements, PaymentElement, useStripe, useElements
```

---

### TASK 6: フロントエンド — 成約確定ボタンの組み込み

以下のページに「成約を確定する」ボタンを追加し、SuccessPaymentModalを呼び出す:

**オーナー側:**
- `~/smart-asset/frontend/app/owner/mypage/page.tsx`
  - 案件リストの各案件に「成約を確定する」ボタンを追加
  - ボタン押下 → SuccessPaymentModal表示

**施工会社側:**
- `~/smart-asset/frontend/app/contractor/mypage/page.tsx`
  - 応募済み案件に「成約を確認する」ボタンを追加
  - ボタン押下 → SuccessPaymentModal表示

---

### TASK 7: フロントエンド — 環境変数

`~/smart-asset/frontend/.env.local` に以下が設定されているか確認:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... （または pk_test_...）
STRIPE_SECRET_KEY=sk_live_... （または sk_test_...）
STRIPE_WEBHOOK_SECRET=whsec_...
```

設定がない場合はテストキー（pk_test / sk_test）で仮実装する。
本番キーへの切り替えは後でオーナーが実施。

---

### TASK 8: テスト確認

1. テストモードで動作確認
2. テストカード: `4242 4242 4242 4242` / 有効期限: 任意の未来日 / CVC: 任意3桁
3. 成約フロー全体:
   - オーナーが「成約を確定する」→ カード入力 → 決済
   - 業者が「成約を確認する」→ カード入力 → 決済
   - 双方完了後に案件ステータスが「completed」になること
4. ビルドエラーがないこと: `npm run build`
5. pm2 restart frontend

---

## 注意事項

- ビルドコマンド: `cd ~/smart-asset/frontend && npm run build`
- エラー時: `rm -rf .next node_modules/.cache` → 再ビルド
- 既存ページのデザイン・レイアウトは変更しないこと
- 既存の文言（特に利用規約第5条）は変更しないこと
- モバイル(/m/)配下のUIは変更しないこと

---

## 参考ファイル

- 設計書v2: ~/smart-asset/REWRITE_BRIEF_V2.md
- 本手順書: ~/smart-asset/STRIPE_INSTRUCTIONS.md
- Stripe説明ページ（既存）: app/stripe-info/page.tsx
