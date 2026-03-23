#!/bin/bash
# Smart Asset AI - 依存パッケージ自動アップデート

echo "🔄 依存パッケージをアップデート中..."

# venv有効化
source /home/ubuntu/smart-asset/backend/venv/bin/activate

# 主要パッケージをアップデート
pip install --upgrade \
  fastapi \
  uvicorn \
  anthropic \
  httpx \
  supabase \
  pydantic \
  pydantic-settings \
  python-dotenv

echo "✅ アップデート完了"

# バックエンド再起動
echo "🔄 バックエンドを再起動中..."
sudo systemctl restart smart-asset-backend

echo "✅ 完了"
