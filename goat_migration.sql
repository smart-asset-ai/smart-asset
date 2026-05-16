-- GOAT会計データ保存テーブル
-- Supabaseダッシュボード → SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS goat_data (
  id TEXT PRIMARY KEY DEFAULT 'goat',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS無効（サービスロールのみアクセス）
ALTER TABLE goat_data DISABLE ROW LEVEL SECURITY;

-- 初期行を挿入（なければ）
INSERT INTO goat_data (id, data) VALUES ('goat', '{}')
ON CONFLICT (id) DO NOTHING;
