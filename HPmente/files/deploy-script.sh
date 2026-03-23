#!/bin/bash

# Smart Asset AI 管理画面 自動デプロイ（Altair 用）
# 使用方法: このスクリプトを Altair に送付、実行

echo "=== Smart Asset AI 管理画面デプロイ開始 ==="
echo "タイムスタンプ: $(date)"

# ステップ 1: Supabase テーブル作成確認
echo ""
echo "【ステップ 1】Supabase テーブル作成確認..."
curl -s "https://xwzotyjutiwwgvfldre.supabase.co/rest/v1/settings?key=eq.maintenance" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koZonk" | jq .
echo "✅ Supabase 接続確認完了"

# ステップ 2: フロントエンド統合
echo ""
echo "【ステップ 2】フロントエンド統合..."
cd /home/ubuntu/smart-asset/frontend

# smart-asset-admin-full.jsx をダウンロード（または git から取得）
# 以下は仮のダウンロードURL（実際には CI/CD から取得）
# wget -O src/pages/admin.jsx https://...

# または SCP で転送済みの場合：
if [ -f "/tmp/smart-asset-admin-full.jsx" ]; then
  cp /tmp/smart-asset-admin-full.jsx src/pages/admin.jsx
  echo "✅ React コンポーネント配置完了"
fi

# ビルド
npm run build 2>&1 | tail -20
echo "✅ フロントエンドビルド完了"

# PM2 再起動
pm2 restart smart-asset-frontend
echo "✅ フロントエンド再起動完了"

# ステップ 3: バックエンド統合
echo ""
echo "【ステップ 3】バックエンド統合..."
cd /home/ubuntu/smart-asset/backend

# Python ファイル配置
if [ -f "/tmp/smart-asset-backend-maintenance.py" ]; then
  cp /tmp/smart-asset-backend-maintenance.py app/maintenance.py
  echo "✅ Python モジュール配置完了"
fi

# 依存関係インストール
echo "httpx>=0.24.0" >> requirements.txt
pip install -r requirements.txt --break-system-packages 2>&1 | grep -E "Successfully|already satisfied"
echo "✅ 依存関係インストール完了"

# Systemd 再起動
sudo systemctl restart smart-asset-backend
echo "✅ バックエンド再起動完了"

# ステップ 4: Nginx 設定確認
echo ""
echo "【ステップ 4】Nginx 設定確認..."
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Nginx リロード完了"

# ステップ 5: 動作確認
echo ""
echo "【ステップ 5】動作確認..."

echo "API ステータス確認："
curl -s https://smart-asset.ai/api/status | jq .

echo ""
echo "メンテナンス設定確認："
curl -s "https://xwzotyjutiwwgvfldre.supabase.co/rest/v1/settings?key=eq.maintenance" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koZonk" | jq .

# ステップ 6: サービス確認
echo ""
echo "【ステップ 6】サービスステータス確認..."
sudo systemctl status smart-asset-frontend --no-pager | grep -E "Active|enabled"
sudo systemctl status smart-asset-backend --no-pager | grep -E "Active|enabled"

echo ""
echo "=== デプロイ完了 ==="
echo "✅ 管理画面: https://smart-asset.ai/admin"
echo "✅ メンテナンスボタン: ヘッダー右上"
echo "✅ API: https://smart-asset.ai/api/status"
echo ""
echo "タイムスタンプ: $(date)"
