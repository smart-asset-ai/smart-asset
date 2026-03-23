import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// POST /api/upload — upload a file to Supabase Storage
// Form data: file (File), roomId (string), fileType (estimate|contract|photo|other)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const roomId = formData.get("roomId") as string | null;
  const fileType = (formData.get("fileType") as string) || "other";

  if (!file || !roomId) {
    return NextResponse.json({ error: "file and roomId are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Build storage path: projects/{roomId}/{fileType}/{timestamp}-{filename}
  const ext = file.name.split(".").pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `projects/${roomId}/${fileType}/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data: uploadData, error: uploadError } = await sb.storage
    .from("projects")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL (signed URL for private bucket)
  const { data: signedData } = await sb.storage
    .from("projects")
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 year

  const fileUrl = signedData?.signedUrl ?? "";

  return NextResponse.json({
    path: uploadData.path,
    url: fileUrl,
    name: file.name,
    size: file.size,
    type: file.type,
  }, { status: 201 });
}
