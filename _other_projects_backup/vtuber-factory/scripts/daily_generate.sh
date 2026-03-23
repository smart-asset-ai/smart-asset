#!/bin/bash
# 毎日の自動動画生成＋アップロード

cd /home/ubuntu/vtuber-factory
source venv/bin/activate

# Webhookサーバー経由で生成（Discord通知付き）
curl -s -X POST http://localhost:8080/generate/quick \
  -H "Content-Type: application/json" \
  -d '{"command": "investment", "auto_upload": true, "privacy": "private"}'

echo "[$(date)] daily_generate completed" >> /home/ubuntu/vtuber-factory/cron.log
