import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "stats";

  try {
    if (type === "stats") {
      const [owners, properties, rooms, repairs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("project_rooms").select("id,status", { count: "exact" }),
        supabase.from("repair_history").select("amount"),
      ]);
      const roomRows = rooms.data ?? [];
      const totalRepairAmount = (repairs.data ?? []).reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
      return NextResponse.json({
        owners: owners.count ?? 0,
        properties: properties.count ?? 0,
        rooms: roomRows.length,
        inProgress: roomRows.filter((r: { status: string }) => r.status === "in_progress").length,
        closed: roomRows.filter((r: { status: string }) => r.status === "closed").length,
        totalRepairAmount,
      });
    }

    if (type === "owners") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at, role")
        .eq("role", "owner")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (type === "properties") {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, address, owner_id, status, created_at, budget")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (type === "projects") {
      const { data, error } = await supabase
        .from("project_rooms")
        .select("id, property_id, owner_id, contractor_id, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
