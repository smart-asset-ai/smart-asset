import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("goat_data")
      .select("data")
      .eq("id", "goat")
      .single();

    if (error) throw error;
    return NextResponse.json(data?.data ?? {}, { headers: HEADERS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { error } = await supabase
      .from("goat_data")
      .upsert({ id: "goat", data: body, updated_at: new Date().toISOString() });

    if (error) throw error;
    return NextResponse.json({ ok: true }, { headers: HEADERS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: HEADERS });
  }
}
