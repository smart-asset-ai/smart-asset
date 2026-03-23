import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// GET /api/messages?roomId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("messages")
    .select("id, sender_id, sender_role, message_type, content, file_url, file_name, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { room_id, sender_id, sender_role, message_type, content, file_url, file_name } = body;

  if (!room_id || !sender_id || !sender_role) {
    return NextResponse.json(
      { error: "room_id, sender_id, sender_role are required" },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("messages")
    .insert({
      room_id,
      sender_id,
      sender_role,
      message_type: message_type ?? "text",
      content: content ?? null,
      file_url: file_url ?? null,
      file_name: file_name ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update room's updated_at
  await sb
    .from("project_rooms")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", room_id);

  return NextResponse.json(data, { status: 201 });
}
