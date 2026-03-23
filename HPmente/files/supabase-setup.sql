-- Smart Asset AI 管理画面用 Supabase テーブル

-- ページセクションテーブル
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sections JSONB DEFAULT '[]'::jsonb,
  name VARCHAR(255) DEFAULT 'home'
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pages_name ON pages(name);

-- 設定テーブル（メンテナンスモード等）
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB DEFAULT 'null'::jsonb,
  message TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- デフォルトデータ挿入
INSERT INTO pages (name, sections) VALUES (
  'home',
  '[
    {
      "id": 1,
      "title": "ヒーロー",
      "type": "hero",
      "visible": true,
      "content": {
        "headline": "Smart Asset - 不動産修繕マッチングプラットフォーム",
        "subheadline": "修繕工事を迅速に、透明に。",
        "ctaText": "プロフェッショナルを探す",
        "imageUrl": "/placeholder-hero.jpg"
      }
    },
    {
      "id": 2,
      "title": "特徴",
      "type": "features",
      "visible": true,
      "content": {
        "heading": "Smart Asset の特徴",
        "features": [
          {"id": "f1", "title": "スピード", "description": "最短24時間でマッチング"},
          {"id": "f2", "title": "透明性", "description": "すべての見積もりが可視化"},
          {"id": "f3", "title": "信頼", "description": "認定プロフェッショナルのみ"}
        ]
      }
    },
    {
      "id": 3,
      "title": "CTA",
      "type": "cta",
      "visible": true,
      "content": {
        "heading": "さあ、始めましょう。",
        "description": "無料で登録、今すぐプロを見つけます。",
        "buttonText": "登録する"
      }
    }
  ]'
) ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, message, description) VALUES
(
  'maintenance',
  'false'::jsonb,
  'ただいまメンテナンス中です。しばらくお待ちください。',
  'メンテナンスモード（true/false）'
) ON CONFLICT (key) DO NOTHING;

-- RLS (Row Level Security) ポリシー
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Enable read access for all users" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON settings
  FOR SELECT USING (true);

-- 管理画面からの書き込み（本来は認証が必要ですが、デモ用に許可）
CREATE POLICY "Enable update for admin" ON pages
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable update for admin" ON settings
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable insert for admin" ON pages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for admin" ON settings
  FOR INSERT WITH CHECK (true);
