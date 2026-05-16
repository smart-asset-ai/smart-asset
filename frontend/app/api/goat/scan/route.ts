import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image) return NextResponse.json({ error: "image required" }, { status: 400, headers: HEADERS });

    const mt = (mediaType || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mt, data: image },
          },
          {
            type: "text",
            text: `この領収書・レシート画像から情報を読み取り、必ずJSONのみで返してください。他のテキストは不要です。

カテゴリの選択肢（最も適切なものを1つ選ぶ）:
売上・収益 / 費用－人件費 / 費用－外注・業務委託 / 費用－材料・仕入 / 費用－オフィス / 費用－販促・広告 / 費用－移動・交通 / 費用－IT・サーバー / 費用－会議・接待 / 費用－税金・公課 / 費用－金融 / 費用－その他

勘定科目の例（カテゴリに合ったものを1つ選ぶ）:
売上高 / 外注費 / 材料費 / 地代家賃 / 水道光熱費 / 通信費 / 消耗品費 / 広告宣伝費 / 交際費 / 旅費交通費 / 交通費 / サーバー費 / クラウド利用料 / ライセンス費 / 会議費 / 租税公課 / 支払手数料 / 振込手数料 / 雑費 / 役員報酬 / 給与手当 / 法定福利費

{"date":"YYYY-MM-DD","amountInc":税込金額の整数,"vendor":"店名または取引先","description":"品目や摘要（簡潔に）","taxRate":10,"category":"上記カテゴリから1つ","account":"上記勘定科目から1つ"}
日付が不明な場合は今日の日付、金額が不明な場合は0、店名不明の場合は空文字を使ってください。`,
          },
        ],
      }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "parse error", raw: text }, { status: 422, headers: HEADERS });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result, { headers: HEADERS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: HEADERS });
  }
}
