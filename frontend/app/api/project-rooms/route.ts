import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// GET /api/project-rooms?userId=xxx&role=owner|contractor
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const field = role === "owner" ? "owner_id" : "contractor_id";

  const { data, error } = await sb
    .from("project_rooms")
    .select(`
      id, status, created_at, updated_at,
      property_address, contractor_company_name,
      property_id, owner_id, contractor_id
    `)
    .eq(field, userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/project-rooms — create or get existing room
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { property_id, owner_id, contractor_id, property_address, contractor_company_name } = body;

  if (!property_id || !owner_id || !contractor_id) {
    return NextResponse.json({ error: "property_id, owner_id, contractor_id are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Check if room already exists for this property+contractor pair
  const { data: existing } = await sb
    .from("project_rooms")
    .select("id, status")
    .eq("property_id", property_id)
    .eq("contractor_id", contractor_id)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Create new room
  const { data, error } = await sb
    .from("project_rooms")
    .insert({
      property_id,
      owner_id,
      contractor_id,
      property_address: property_address ?? "",
      contractor_company_name: contractor_company_name ?? "",
      status: "chatting",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send system message
  await sb.from("messages").insert({
    room_id: data.id,
    sender_id: owner_id,
    sender_role: "owner",
    message_type: "system",
    content: "チャットルームが開設されました。",
  });

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/project-rooms — update room status
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { roomId, status } = body;

  if (!roomId || !status) {
    return NextResponse.json({ error: "roomId and status required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("project_rooms")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", roomId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 案件クローズ時に repair_history へ自動INSERT
  if (status === "closed" && data) {
    // contracts から金額・工種情報を取得
    const { data: contract } = await sb
      .from("contracts")
      .select("contract_amount, terms")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // repair_history に既存レコードがなければ INSERT
    const { data: existing } = await sb
      .from("repair_history")
      .select("id")
      .eq("room_id", roomId)
      .single();

    if (!existing) {
      await sb.from("repair_history").insert({
        owner_id: data.owner_id,
        property_id: data.property_id,
        room_id: roomId,
        work_type: contract?.terms?.split("\n")[0]?.slice(0, 50) ?? "修繕工事",
        contractor_name: data.contractor_company_name ?? "",
        property_address: data.property_address ?? "",
        amount: contract?.contract_amount ?? null,
        completed_at: new Date().toISOString().split("T")[0],
        next_inspection_years: 8,
      });
    }
  }

  return NextResponse.json(data);
}
