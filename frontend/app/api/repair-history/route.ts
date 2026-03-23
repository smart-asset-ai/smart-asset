import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// GET /api/repair-history?ownerId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("repair_history")
    .select("*")
    .eq("owner_id", ownerId)
    .order("completed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
