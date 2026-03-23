import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// GET /api/project-photos?roomId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("project_photos")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/project-photos
// Body: { roomId, photoType, fileUrl, uploaderId?, caption? }
export async function POST(req: NextRequest) {
  const { roomId, photoType, fileUrl, uploaderId, caption } = await req.json();
  if (!roomId || !photoType || !fileUrl) {
    return NextResponse.json(
      { error: "roomId, photoType, fileUrl are required" },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("project_photos")
    .insert({
      room_id: roomId,
      photo_type: photoType,
      file_url: fileUrl,
      uploader_id: uploaderId ?? null,
      caption: caption ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
