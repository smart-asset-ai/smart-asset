-- Smart Asset AI — Phase 1 Migration
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/xwzotvjutixwpgvfldre/sql/new

-- ==============================
-- 1. project_rooms
-- ==============================
CREATE TABLE IF NOT EXISTS project_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_company_name TEXT,
  property_address TEXT,
  status TEXT DEFAULT 'chatting'
    CHECK (status IN ('chatting','estimate_uploaded','estimate_approved','contract_signed','in_progress','completed_requested','completed','invoiced','invoice_approved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 2. messages
-- ==============================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT CHECK (sender_role IN ('owner', 'contractor')) NOT NULL,
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','file','estimate','contract','photo','system')),
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 3. contracts
-- ==============================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  contract_amount INTEGER,
  advance_amount INTEGER,
  final_amount INTEGER,
  terms TEXT,
  document_hash TEXT,
  owner_signed_at TIMESTAMPTZ,
  owner_ip TEXT,
  contractor_signed_at TIMESTAMPTZ,
  contractor_ip TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','owner_signed','contractor_signed','fully_signed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 4. project_photos
-- ==============================
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES project_rooms(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_type TEXT DEFAULT 'progress'
    CHECK (photo_type IN ('before','progress','after','completion')),
  file_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- RLS Policies
-- ==============================

-- project_rooms: owner or contractor of the room can read/update
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rooms" ON project_rooms
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = contractor_id);
CREATE POLICY "Service role full access rooms" ON project_rooms
  FOR ALL USING (true) WITH CHECK (true);

-- messages: members of the room can read/insert
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_rooms r WHERE r.id = room_id AND (r.owner_id = auth.uid() OR r.contractor_id = auth.uid()))
  );
CREATE POLICY "Room members can insert messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM project_rooms r WHERE r.id = room_id AND (r.owner_id = auth.uid() OR r.contractor_id = auth.uid()))
  );

-- contracts: room members
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members can view contracts" ON contracts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_rooms r WHERE r.id = room_id AND (r.owner_id = auth.uid() OR r.contractor_id = auth.uid()))
  );

-- project_photos: room members
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members can view photos" ON project_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_rooms r WHERE r.id = room_id AND (r.owner_id = auth.uid() OR r.contractor_id = auth.uid()))
  );

-- ==============================
-- Storage bucket for project files
-- ==============================
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', false)
ON CONFLICT (id) DO NOTHING;

-- Allow room members to upload to their room folder
CREATE POLICY "Room members can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'projects' AND auth.uid() IS NOT NULL);
CREATE POLICY "Room members can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'projects' AND auth.uid() IS NOT NULL);

-- ==============================
-- Indexes for performance
-- ==============================
CREATE INDEX IF NOT EXISTS idx_project_rooms_owner ON project_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_rooms_contractor ON project_rooms(contractor_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_project_photos_room ON project_photos(room_id);
