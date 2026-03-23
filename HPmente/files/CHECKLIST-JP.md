# ✅ Smart Asset AI 管理画面 実装チェックリスト

## 📦 ファイル一覧（全部で 6 個）

- [ ] `IMPLEMENTATION-GUIDE-JP.md` - 完全な日本語実装ガイド
- [ ] `smart-asset-admin-full.jsx` - Supabase 連携した React 管理画面
- [ ] `supabase-setup.sql` - テーブル・RLS ポリシー作成 SQL
- [ ] `smart-asset-backend-maintenance.py` - FastAPI メンテナンスロジック
- [ ] `deployment-instructions.json` - JSON デプロイ手順書
- [ ] `deploy-script.sh` - 自動デプロイ Bash スクリプト

---

## 🔧 デプロイ手順（15分で完了）

### **フェーズ 1: Supabase 設定（5分）**

- [ ] Supabase コンソールにログイン
  - URL: https://app.supabase.com
  - プロジェクト: `xwzotyjutiwwgvfldre`

- [ ] SQL エディタで `supabase-setup.sql` を実行
  - 左メニュー → SQL Editor
  - New Query → コピー＆ペースト → Run

- [ ] テーブル作成確認
  ```bash
  curl -s 'https://xwzotyjutiwwgvfldre.supabase.co/rest/v1/settings?key=eq.maintenance' \
    -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koZonk' | jq .
  ```

---

### **フェーズ 2: VM3 フロントエンド（5分）**

VM3 に SSH ログイン：
```bash
ssh -i ~/.ssh/stagea_key ubuntu@141.253.121.51
```

- [ ] フロントエンド統合
  ```bash
  cd /home/ubuntu/smart-asset/frontend
  cp smart-asset-admin-full.jsx src/pages/admin.jsx
  npm run build
  pm2 restart smart-asset-frontend
  ```

- [ ] 動作確認
  ```
  URL: https://smart-asset.ai/admin
  → 管理画面が表示される
  ```

---

### **フェーズ 3: VM3 バックエンド（5分）**

- [ ] バックエンド統合
  ```bash
  cd /home/ubuntu/smart-asset/backend
  cp smart-asset-backend-maintenance.py app/maintenance.py
  echo 'httpx>=0.24.0' >> requirements.txt
  pip install -r requirements.txt --break-system-packages
  sudo systemctl restart smart-asset-backend
  ```

- [ ] 動作確認
  ```bash
  curl https://smart-asset.ai/api/status | jq
  # 出力: { "maintenance": false, "message": "", ... }
  ```

---

## ✨ 機能確認チェック

### **管理画面**

- [ ] **エディタモード**
  - [ ] セクション表示/非表示切り替え
  - [ ] セクション内容編集
  - [ ] テキスト入力が反映される
  - [ ] 「保存」ボタンで Supabase に保存される

- [ ] **プレビューモード**
  - [ ] 編集内容がリアルタイム反映
  - [ ] Hero, Features, CTA の 3 セクションが表示
  - [ ] レスポンシブデザイン確認（モバイル）

### **メンテナンスモード**

- [ ] **ボタンが見える**
  - [ ] ヘッダー右上に存在
  - [ ] 通常時は緑色「サイト稼働中」
  - [ ] メンテナンスモード時は赤色「メンテナンス中」

- [ ] **切り替え動作**
  - [ ] クリック → 色が変わる
  - [ ] クリック → `https://smart-asset.ai` に反映
  - [ ] メンテナンスページが表示される
  - [ ] 再度クリック → 通常ページが表示される

### **API**

- [ ] **GET /api/status**
  - [ ] ステータスコード 200
  - [ ] JSON で `maintenance`, `message` を返す

- [ ] **POST /api/maintenance/toggle**
  - [ ] ステータスコード 200
  - [ ] Supabase に状態が保存される

- [ ] **GET /api/pages**
  - [ ] セクション情報が返される
  - [ ] JSONB 形式で完全性を保持

---

## 🎯 サイト動作確認

### **メンテナンス OFF の場合**

```
https://smart-asset.ai
→ 通常のホームページが表示
```

- [ ] ヘッダーが見える
- [ ] 各セクション（Hero, Features, CTA）が見える
- [ ] レスポンシブ対応確認

### **メンテナンス ON の場合**

```
https://smart-asset.ai
→ メンテナンスページが表示
```

- [ ] 「メンテナンス中です」表示
- [ ] メッセージが表示される
- [ ] ステータスコード 503 を返す
- [ ] ローディングアニメーション表示

---

## 🔐 セキュリティチェック

- [ ] **HTTPS/SSL 確認**
  ```bash
  curl -I https://smart-asset.ai
  # HTTP/2 200 で確認
  ```

- [ ] **CORS 設定**
  ```bash
  curl -H "Origin: https://example.com" https://smart-asset.ai
  # Access-Control-Allow-Origin ヘッダー確認
  ```

- [ ] **API キー保護**
  - [ ] Supabase API キーが環境変数に保存
  - [ ] ソースコードに露出していない

---

## 🚀 デプロイ後のタスク

### **短期（今週）**
- [ ] 管理画面で複数のメンテナンス切り替えテスト
- [ ] モバイル UI 確認（iPhone/Android）
- [ ] ページ表示速度確認（Lighthouse）
- [ ] エラーログ監視（日本語エラーメッセージ）

### **中期（今月）**
- [ ] 認証追加（Supabase Auth または JWT）
- [ ] セクション並び替え機能（ドラッグ&ドロップ）
- [ ] 画像アップロード機能
- [ ] 複数ページ対応（about, pricing など）

### **長期（次月以降）**
- [ ] ブログ機能追加
- [ ] コメント機能
- [ ] アナリティクス統合
- [ ] A/B テスト機能

---

## 🆘 トラブルシューティング

### **Q: 管理画面が 404 エラー**
- [ ] Nginx 設定確認
- [ ] `/admin` パスがプロキシされているか確認
- [ ] フロントエンド再起動: `pm2 restart smart-asset-frontend`

### **Q: メンテナンスボタンが動作しない**
- [ ] Supabase RLS ポリシー確認
- [ ] API キーが正しいか確認
- [ ] バックエンド ログ確認: `journalctl -u smart-asset-backend`

### **Q: Supabase に接続できない**
- [ ] ネットワーク確認: `curl -I https://xwzotyjutiwwgvfldre.supabase.co`
- [ ] API キー確認: `echo $SUPABASE_ANON_KEY`
- [ ] VPN/プロキシ確認

### **Q: メンテナンスページが表示されない**
- [ ] Supabase 設定確認: `settings` テーブルの `maintenance` カラムを確認
- [ ] FastAPI ミドルウェア確認
- [ ] ブラウザキャッシュ削除: Ctrl+Shift+Del

---

## 📊 パフォーマンス目標

| 指標 | 目標 | チェック |
|------|------|---------|
| ページロード時間 | < 2s | [ ] |
| API レスポンス | < 500ms | [ ] |
| 管理画面読み込み | < 1s | [ ] |
| メンテナンス切り替え | < 100ms | [ ] |
| Lighthouse スコア | > 90 | [ ] |

---

## 📞 サポート連絡先

- **技術サポート**: Altair（Discord）
- **ドキュメント**: `IMPLEMENTATION-GUIDE-JP.md`
- **API リファレンス**: `IMPLEMENTATION-GUIDE-JP.md` 内の API セクション

---

## ✅ 最終確認

- [ ] 全ファイル確認済み
- [ ] 3 フェーズ全て実装済み
- [ ] 全機能テスト完了
- [ ] セキュリティチェック完了
- [ ] 本番環境デプロイ準備完了

---

**デプロイ日時**: _______________  
**デプロイ者**: _______________  
**テスト完了日**: _______________  

---

**ステータス**: ✅ **本番準備完了**
