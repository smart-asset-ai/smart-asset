import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

// POST /api/contracts/generate-pdf
// Body: { contractId, roomId }
export async function POST(req: NextRequest) {
  const { contractId, roomId } = await req.json();
  if (!contractId || !roomId) {
    return NextResponse.json({ error: "contractId and roomId are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Get contract data
  const { data: contract, error: contractError } = await sb
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  // Get room data
  const { data: room } = await sb
    .from("project_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  // Generate PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    size = 10,
    isBold = false,
    color = rgb(0.1, 0.1, 0.1)
  ) => {
    page.drawText(text, {
      x,
      y: yPos,
      size,
      font: isBold ? boldFont : font,
      color,
    });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: width - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  // Title
  drawText("工事請負契約書", width / 2 - 60, y, 18, true);
  y -= 35;
  drawLine(y);
  y -= 20;

  // Subtitle
  drawText("Smart Asset AI プラットフォームにて電子署名されました", margin, y, 9, false, rgb(0.5, 0.5, 0.5));
  y -= 25;

  // Issue date
  const issuedAt = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  drawText(`発行日: ${issuedAt}`, margin, y, 10);
  y -= 30;

  // Property
  drawLine(y);
  y -= 20;
  drawText("■ 工事物件", margin, y, 11, true);
  y -= 18;
  drawText(room?.property_address || "（住所情報なし）", margin + 10, y, 10);
  y -= 30;

  // Parties
  drawLine(y);
  y -= 20;
  drawText("■ 当事者", margin, y, 11, true);
  y -= 18;
  drawText("発注者（オーナー）:", margin + 10, y, 10, true);
  drawText(room?.owner_id || "", margin + 120, y, 10);
  y -= 18;
  drawText("受注者（施工会社）:", margin + 10, y, 10, true);
  drawText(room?.contractor_company_name || "", margin + 120, y, 10);
  y -= 30;

  // Amounts
  drawLine(y);
  y -= 20;
  drawText("■ 契約金額", margin, y, 11, true);
  y -= 18;

  const formatAmt = (n: number | null) =>
    n != null ? `¥${n.toLocaleString("ja-JP")}` : "—";

  drawText("契約金額（税込）:", margin + 10, y, 10, true);
  drawText(formatAmt(contract.contract_amount), margin + 130, y, 10);
  y -= 18;
  drawText("着手金:", margin + 10, y, 10);
  drawText(formatAmt(contract.advance_amount), margin + 130, y, 10);
  y -= 18;
  drawText("最終金:", margin + 10, y, 10);
  drawText(formatAmt(contract.final_amount), margin + 130, y, 10);
  y -= 30;

  // Terms
  if (contract.terms) {
    drawLine(y);
    y -= 20;
    drawText("■ 特約事項・工事条件", margin, y, 11, true);
    y -= 18;
    // Wrap long text
    const lines = contract.terms.split("\n");
    for (const line of lines) {
      const chunks = line.match(/.{1,60}/g) || [line];
      for (const chunk of chunks) {
        drawText(chunk, margin + 10, y, 9);
        y -= 15;
        if (y < 150) break;
      }
      if (y < 150) break;
    }
    y -= 10;
  }

  // Signatures
  if (y > 200) {
    drawLine(y);
    y -= 20;
    drawText("■ 電子署名記録", margin, y, 11, true);
    y -= 18;

    if (contract.owner_signed_at) {
      const ownerSignedDate = new Date(contract.owner_signed_at).toLocaleString("ja-JP");
      drawText("発注者（オーナー）:", margin + 10, y, 10, true);
      y -= 16;
      drawText(`署名日時: ${ownerSignedDate}`, margin + 20, y, 9);
      y -= 14;
      drawText(`IP: ${contract.owner_ip || "—"}`, margin + 20, y, 9);
      y -= 20;
    }

    if (contract.contractor_signed_at) {
      const contractorSignedDate = new Date(contract.contractor_signed_at).toLocaleString("ja-JP");
      drawText("受注者（施工会社）:", margin + 10, y, 10, true);
      y -= 16;
      drawText(`署名日時: ${contractorSignedDate}`, margin + 20, y, 9);
      y -= 14;
      drawText(`IP: ${contract.contractor_ip || "—"}`, margin + 20, y, 9);
      y -= 20;
    }
  }

  // Document hash
  if (contract.document_hash) {
    y -= 10;
    drawLine(y);
    y -= 20;
    drawText("■ 文書整合性", margin, y, 11, true);
    y -= 18;
    drawText("SHA-256:", margin + 10, y, 9, true);
    y -= 14;
    drawText(contract.document_hash.slice(0, 64), margin + 10, y, 7, false, rgb(0.4, 0.4, 0.4));
    y -= 14;
  }

  // Footer
  drawLine(100);
  page.drawText(
    "本契約書はSmart Asset AIプラットフォームにて電子署名されました。",
    {
      x: margin,
      y: 80,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  );
  page.drawText(`Contract ID: ${contractId}`, {
    x: margin,
    y: 65,
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();

  // Upload to Supabase Storage
  const fileName = `contracts/${roomId}/${contractId}-signed.pdf`;
  const { data: uploadData, error: uploadError } = await sb.storage
    .from("projects")
    .upload(fileName, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get signed URL (1 year)
  const { data: signedData } = await sb.storage
    .from("projects")
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

  const pdfUrl = signedData?.signedUrl ?? "";

  // Update contract with PDF URL
  await sb.from("contracts").update({ pdf_url: pdfUrl }).eq("id", contractId);

  // Add message with PDF link
  await sb.from("messages").insert({
    room_id: roomId,
    sender_role: "owner",
    message_type: "contract",
    content: "📄 契約書PDFが生成されました",
    file_url: pdfUrl,
    file_name: "工事請負契約書.pdf",
  });

  return NextResponse.json({ pdfUrl }, { status: 200 });
}
