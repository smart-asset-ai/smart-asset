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
            text: `この領収書・レシート・請求書画像から情報を読み取り、必ずJSONのみで返してください。説明文は不要です。

【カテゴリ一覧】から最適な1つを選ぶ:
売上・収益 / 費用－人件費 / 費用－外注・業務委託 / 費用－材料・仕入 / 費用－オフィス / 費用－IT・サーバー / 費用－通信 / 費用－販促・広告 / 費用－移動・交通 / 費用－会議・接待 / 費用－研修・採用 / 費用－税金・公課 / 費用－金融 / 費用－保険 / 費用－減価償却・引当 / 費用－その他 / 資産－流動 / 資産－固定 / 負債－流動 / 負債－固定 / 純資産

【勘定科目】カテゴリに合う最適な1つを選ぶ（例）:
売上高・受取手数料・受取配当金・受取利息・有価証券売却益 /
役員報酬・給与手当・法定福利費・福利厚生費 /
外注費・業務委託費・デザイン費・システム開発費 /
地代家賃・電気代・水道代・消耗品費・修繕費 /
サーバー費・クラウド利用料・ライセンス費・ChatGPT利用料・SaaS利用料 /
通信費・インターネット料・携帯電話代 /
広告宣伝費・Web広告費・Google広告費・SNS広告費 /
旅費交通費・交通費・タクシー代・新幹線代・宿泊費 /
会議費・接待交際費・会食費 /
研修費・書籍費・セミナー費 /
租税公課・印紙税・法人税等 /
支払利息・振込手数料・銀行手数料・Stripe手数料・決済手数料 /
保険料・損害保険料・賠償責任保険料 /
減価償却費・貸倒引当金繰入 /
役員貸付金・役員短期貸付金・売掛金・未収入金・仮払金 /
投資有価証券・SBI証券（法人）残高 /
役員借入金・役員長期借入金・買掛金・未払金・未払消費税・源泉税預り金 /
雑費・諸会費

返却JSON（このフォーマットのみ）:
{"date":"YYYY-MM-DD","amountInc":税込金額の整数,"vendor":"店名または取引先","description":"品目や摘要（簡潔に15字以内）","taxRate":10,"category":"上記カテゴリから1つ","account":"上記勘定科目から1つ"}

判断基準:
- 日付不明→今日の日付、金額不明→0、店名不明→""
- 税率8%（軽減税率）の場合はtaxRate:8
- 不課税・非課税（交通費・保険・金融取引など）はtaxRate:0
- 法人口座への振込・借入はtype判断で負債カテゴリを選択`,
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
