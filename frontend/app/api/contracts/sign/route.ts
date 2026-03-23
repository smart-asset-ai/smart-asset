import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// POST /api/contracts/sign
// Body: { roomId, contractId?, role, documentHash, contractAmount, advanceAmount, finalAmount, terms, propertyAddress, contractorName, workDescription? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    roomId,
    contractId,
    role,
    documentHash,
    contractAmount,
    advanceAmount,
    finalAmount,
    terms,
    propertyAddress,
    contractorName,
    workDescription,
  } = body;

  if (!roomId || !role || !documentHash) {
    return NextResponse.json({ error: "roomId, role, documentHash are required" }, { status: 400 });
  }

  // Get client IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const maskedIp = ip.replace(/(\d+)$/, "***");

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  let finalContractId = contractId;

  if (contractId) {
    // Update existing contract — add this party's signature
    const updateData: Record<string, unknown> =
      role === "owner"
        ? { owner_signed_at: now, owner_ip: maskedIp, document_hash: documentHash }
        : { contractor_signed_at: now, contractor_ip: maskedIp, document_hash: documentHash };

    const { data: existing } = await sb
      .from("contracts")
      .select("owner_signed_at, contractor_signed_at")
      .eq("id", contractId)
      .single();

    // Check if both parties have now signed
    const ownerSigned = role === "owner" ? true : !!existing?.owner_signed_at;
    const contractorSigned = role === "contractor" ? true : !!existing?.contractor_signed_at;

    if (ownerSigned && contractorSigned) {
      updateData.sign_status = "fully_signed";
    } else {
      updateData.sign_status = role === "owner" ? "owner_signed" : "contractor_signed";
    }

    await sb.from("contracts").update(updateData).eq("id", contractId);

    // If fully signed, update room status and generate PDF
    if (ownerSigned && contractorSigned) {
      await sb
        .from("project_rooms")
        .update({ status: "in_progress", updated_at: now })
        .eq("id", roomId);

      // Insert system message
      await sb.from("messages").insert({
        room_id: roomId,
        sender_role: "owner",
        message_type: "system",
        content: "✅ 双方が電子署名しました。契約が成立し、工事が開始されました。",
      });

      // Generate PDF asynchronously (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/contracts/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, roomId }),
      }).catch(() => {});
    }
  } else {
    // Create new contract
    const insertData = {
      room_id: roomId,
      contract_amount: contractAmount,
      advance_amount: advanceAmount,
      final_amount: finalAmount,
      terms,
      document_hash: documentHash,
      sign_status: role === "owner" ? "owner_signed" : "contractor_signed",
      ...(role === "owner"
        ? { owner_signed_at: now, owner_ip: maskedIp }
        : { contractor_signed_at: now, contractor_ip: maskedIp }),
    };

    const { data: newContract, error } = await sb
      .from("contracts")
      .insert(insertData)
      .select("id")
      .single();

    if (error || !newContract) {
      return NextResponse.json({ error: error?.message || "Failed to create contract" }, { status: 500 });
    }
    finalContractId = newContract.id;

    // Update room status
    await sb
      .from("project_rooms")
      .update({ status: "contract_signed", updated_at: now })
      .eq("id", roomId);

    // System message
    await sb.from("messages").insert({
      room_id: roomId,
      sender_role: "owner",
      message_type: "system",
      content: `📝 ${role === "owner" ? "オーナー" : "施工会社"}が電子署名しました。相手方の署名をお待ちください。`,
    });
  }

  return NextResponse.json({ contractId: finalContractId, status: "signed" }, { status: 200 });
}
