import { NextResponse } from "next/server";

const HEADERS = { "Access-Control-Allow-Origin": "*" };

export async function GET() {
  return NextResponse.json({ ok: true, service: "goat-accounting" }, { headers: HEADERS });
}
