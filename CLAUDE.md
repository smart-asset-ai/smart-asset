# CLAUDE.md — OpenClaw / Smart Asset AI 全体コンテキスト
> このファイルはClaude Codeが起動時に自動読み込みする記憶ファイルです。
> 運営者: 合同会社GOAT (GOAT LLC) / AI WORK STAGE (aiworkstage.com) / 東京 JST(UTC+9)

---

## 🏢 事業概要

| 項目 | 内容 |
|------|------|
| 会社名 | 合同会社GOAT (GOAT LLC) |
| サービス | AI WORK STAGE (aiworkstage.com) |
| 主力プロダクト | **Smart Asset AI** (smart-asset.ai) — 不動産修繕マッチングプラットフォーム |
| マルチエージェント | **OpenClaw** — Discord上で動く5体のAIエージェントシステム |
| インフラ | Oracle Cloud Always Free VPS × 2台 |

---

## 🖥️ インフラ構成

### VM3 — Smart Asset AI 専用
- **IP:** `141.253.121.51`
- **OS:** Ubuntu 24
- **用途:** Smart Asset AI フロントエンド / バックエックエンド
- **フロントエンド:** Next.js + Tailwind → `~/smart-asset/frontend/` (PM2管理)
- **バックエンド:** FastAPI (Python/venv)
- **Web:** Nginx + SSL (Let's Encrypt)
- **DB:** Supabase
- **監視:** 5分ごと監視スクリプト稼働中
- **全サービス:** `Restart=always` (systemd)

### VM1 — OpenClaw / KabuBot 専用
- **IP:** `141.253.102.142`
- **用途:** OpenClaw Discordボット群 / KabuBot (株スクリーニング)
- **VM1→VM3 SSH:** `ssh -i ~/.ssh/stagea_key ubuntu@141.253.121.51`

---

## 🔑 認証情報・APIキー

### Supabase
- **URL:** `https://xwzotyjutiwwgvfldre.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koNzonk`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0MjIxMCwiZXhwIjoyMDg4MTE4MjEwfQ.qTsgx1gLdan8YFx9F9kNpdCEqfdDo3GLb0uStvUb5lM`

### Anthropic
- **API Key:** `sk-ant-api03-XXXXXXXX（省略）`
- **コスト方針:** Sonnet=診断品質用, Haiku=常時稼働チャット用

### OpenClaw Gateway
- **Token:** `a83c3ed5e30ae904d4fbbfa8cd2419d09046e39e7906a8a9`
- **Dashboard:** `http://localhost:18789/?token=a83c3ed5e30ae904d4fbbfa8cd2419d09046e39e7906a8a9` (SSHトンネル port 18789)

### Discord Webhook (Altairチャンネル直送)
- **URL:** `https://discord.com/api/webhooks/1477067820004016286/WQlSlY3VN3rWBb22sLdWo8DxfZ-BCiP0yv1JYNHV0cLmvtPUMaIjQfNfai-2PbXV0nNP`
- **送信方法:** `/tmp/payload.json` にheredocで書いて `-d @/tmp/payload.json` で送信

---

## 🤖 OpenClaw — Discordボット構成

- **サーバーID:** `1475430294638166180`
- **稼働サービス:** `openclaw-gateway.service` のみ (systemd)
- **⚠️ 重要:** `agent_bot.py` を直接startすると **409 Conflict** → 絶対に起動しない

| ボット名 | エージェント名 | モデル | 役割 |
|---------|-------------|-------|------|
| Kairos | zephyr | Claude Opus | 会長 |
| Altair | main | Claude Sonnet | 社長/秘書 |
| Iris | dariel | Claude Haiku | SNS/X戦略 |
| Merku | ophelia | Claude Haiku | YouTube戦略/営業 |
| Pluto | neid | Claude Haiku | TikTok/会計 |

### Altair専用チャンネル
- **チャンネルID:** `1475435302930743378`
- **特徴:** @メンション不要で自動反応 (他チャンネルは `@Altair` 必須)

### 基本オペレーションフロー
```
主が指示 → Claudeがwebhook送信 → AltairがVMで自動実行 → Discord結果ログ
```
→ VPS直接ターミナル作業不要

---

## 🏠 Smart Asset AI — 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js + Tailwind CSS |
| バックエンド | FastAPI (Python, venv) |
| DB/Storage | Supabase |
| Web/SSL | Nginx + Let's Encrypt |
| プロセス管理 | PM2 (frontend) + systemd |
| インフラ | Oracle Cloud Always Free VPS |

### 最近の実装
- CMS風ビジュアルエディタ (ノーコード、Figma/Webflow風) → コードなしでホームページ編集
- メンテナンスモードトグル
- モバイルUI改善 (ハンバーガーメニュー、コンパクトヘッダー/フッター)
- Stripe登録 (日本市場、特商法対応)
- Flask APIサーバー (port 5001) — ホームページ編集用

---

## 📈 KabuBot (株スクリーニング)

- **稼働VM:** VM1 (`141.253.102.142`)
- **API:** Gemini (無料枠) ← 旧Claude APIから移行済み
- **対象:** JPX上場約3,600銘柄
- **指標:** RSI、ゴールデンクロス、出来高、PER/PBR
- **実行時刻:** 08:30 / 12:30 / 15:30 JST
- **出力:** Discord TOP5銘柄 + Yahoo Finance / 株探 / TradingView リンク

---

## 📋 運用ポリシー・制約事項

1. **コスト最小化が最優先** — Oracle VPSリソースはほぼ上限
2. **Altair使用はClaude側自動化が完成してから**
3. **API/仕様は必ず最新を確認してからAltairへ指示**
4. **VM3 (2コア) = Smart Asset AI専用**
5. **VM1 = OpenClaw + KabuBot専用**
6. **VTuber Factory:** VOICEVOXをkill済み、cronも削除、service無効化済み (ファイルは保持)

---

## 🔧 よく使うコマンド

```bash
# VM3 フロントエンド確認
pm2 status
pm2 logs smart-asset-frontend

# VM3 バックエンド確認
sudo systemctl status smart-asset-backend

# Nginx
sudo systemctl status nginx
sudo nginx -t

# OpenClaw (VM1)
sudo systemctl status openclaw-gateway.service
sudo journalctl -u openclaw-gateway.service -f

# Discord Webhook送信
cat > /tmp/payload.json << 'EOF'
{"content": "メッセージ内容"}
EOF
curl -X POST -H "Content-Type: application/json" \
  -d @/tmp/payload.json \
  "https://discord.com/api/webhooks/1477067820004016286/WQlSlY3VN3rWBb22sLdWo8DxfZ-BCiP0yv1JYNHV0cLmvtPUMaIjQfNfai-2PbXV0nNP"
```

---

## 📁 重要ファイルパス

| ファイル/ディレクトリ | 場所 |
|---------------------|------|
| Smart Asset フロントエンド | `~/smart-asset/frontend/` (VM3) |
| OpenClaw gateway | VM1 (openclaw-gateway.service) |
| disco-sync.py | VM1 |
| altair-memory-to-discord.py | VM1 |

---

## 🌐 外部サービス

| サービス | 用途 |
|---------|------|
| Supabase | DB / Storage |
| Cloudflare | DNS / CDN |
| Termius | SSH クライアント |
| Oracle Cloud | VPS (Always Free) |
| Discord | エージェント間通信 |
| Stripe | 決済 (日本市場) |
| kabu Station API | 株自動売買 (Kairosエージェント検討中) |

---

---

## 🧾 GOAT会計システム（2026年5月 構築完了）

### ファイル構成
| ファイル | 場所 | 内容 |
|---------|------|------|
| `GOAT_会計_v7.html` | `~/Desktop/` (ローカル) | 会計・経費・仕訳・PL/BS・e-Tax |
| `GOAT_見積請求_v24.html` | `~/Desktop/` (ローカル) | 見積・請求・原価管理 |

### クラウドバックアップ構成
- **Supabaseテーブル:** `goat_data`（id='goat'にJSONB一括保存）
- **API（VM3）:**
  - `GET  https://smart-asset.ai/api/goat/sync` → Supabaseから読込
  - `POST https://smart-asset.ai/api/goat/sync` → Supabaseへ保存
  - `GET  https://smart-asset.ai/api/goat/health` → `{ok:true}`
- **APIコード:** `~/smart-asset/frontend/app/api/goat/` (GitHub管理)
- **Nginxルート:** `/api/goat/` → `localhost:3000` に追加済み

### v24→v7 連動
- `GOAT_見積請求_v24.html` の「✅ 売上として会計登録」ボタン
- `localStorage('goat_v7_data')` 経由でv7に売上エントリを自動追加 + VM3へ即時バックアップ
- 両ファイルが `file://` 同一オリジンのlocalStorageを共有

### データキー
- `localStorage key:` `goat_v7_data`（メイン）/ `goat_v7_data_backup`（バックアップ）
- `type:'capital'` = 資本金（PL除外・BS資本の部に計上）

### 注意事項
- VM3（141.253.121.51）はOracle Cloud Always Free → 停止する場合はTermius経由で手動再起動
- SSH直接接続は可能（Termius使用）、ローカルからは不可の場合あり
- 再起動後: `sudo fuser -k 3000/tcp; pm2 restart 1` が必要な場合あり

---

*最終更新: 2026年5月 / このファイルをプロジェクトルートに置くとClaude Codeが自動読み込みします*
