import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DIAGNOSIS_PROMPT = `あなたは建築・不動産修繕の専門家AIです。提供された建物情報と写真を詳細に分析し、以下のJSON形式のみで回答してください（JSON以外のテキスト不可）。

{
  "ai_score": 数値（0〜100の整数。劣化が激しいほど低い。良好=80〜100, 要注意=60〜79, 要修繕=40〜59, 緊急=0〜39）,
  "severity": "low|medium|high|critical",
  "summary": "2〜3文での診断サマリー。具体的な劣化箇所・状態を含める",
  "details": "詳細分析（400〜600文字）。写真に見える具体的な劣化（クラック幅・剥離面積・錆の程度等）、築年数・修繕歴との整合性、地域の気候特性（塩害・凍結等）を考慮して記述すること",
  "parts": [
    {
      "name": "外壁",
      "status": "良好|要観察|要修繕|緊急",
      "score": 数値（0〜100）,
      "work_type": "該当工事種別または空文字",
      "description": "その部位の状態（50〜80文字）",
      "estimated_cost": "費用目安（例: 80〜150万円）または「—」",
      "cost_basis": "費用の根拠（例: 外壁面積約200㎡×塗装3,000円/㎡＋足場代50万円）または「延床面積・階数の情報があればより正確に算出できます」"
    }
  ],
  "estimated_total": "総修繕費概算（例: 120〜250万円）",
  "estimated_total_basis": "総費用の根拠説明（1〜2文。情報不足の場合は「建物面積・階数・使用材料の情報があればより正確な概算を算出できます」と記載）",
  "info_needed": "より正確な診断に必要な追加情報（例: 「延床面積・階数・前回修繕時の工事内容があればより詳細な費用算出が可能です」）または空文字",
  "timeline": "対処推奨タイムライン（例: 「今後1〜2年以内に対処推奨」）",
  "recommended_actions": ["具体的な推奨アクション1","推奨アクション2","推奨アクション3","推奨アクション4","推奨アクション5"],
  "work_types": ["外壁塗装"],
  "risk_factors": ["リスク要因1","リスク要因2"],
  "strengths": ["良好な点1"]
}

parts は3〜6部位。写真がある場合は視認できる劣化を根拠に判定。写真がない場合は築年数・修繕歴から想定劣化を判定。
estimated_cost は「X〜Y万円」形式で必ず記載。情報不足で費用算出できない場合は「現地調査後に算出」と記載。
cost_basis は費用の計算根拠を具体的に記載（㎡数・単価・工程等）。情報不足の場合は不足情報を明示。

severity基準: low=軽微(score70+), medium=要注意(score50-69), high=要修繕(score30-49), critical=緊急(score0-29)`;

export async function POST(req: NextRequest) {
  const {
    image, mediaType, description,
    buildingType, buildingAge, lastRepair,
    floorArea, floors, location
  } = await req.json();

  try {
    const buildingInfo = [
      `建物種別: ${buildingType || "不明"}`,
      buildingAge ? `築年数: ${buildingAge}` : null,
      lastRepair ? `前回修繕: ${lastRepair}` : null,
      floorArea ? `延床面積: ${floorArea}㎡` : null,
      floors ? `階数: ${floors}階建て` : null,
      location ? `所在地: ${location}` : null,
      description ? `補足・気になる点: ${description}` : null,
    ].filter(Boolean).join("\n");

    let messageContent: Anthropic.MessageParam["content"];

    if (image) {
      messageContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: (mediaType || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: image,
          },
        },
        {
          type: "text",
          text: `【建物情報】\n${buildingInfo}\n\n上記建物の写真と情報を基に、専門家として詳細な修繕診断を行ってください。写真に見える劣化・問題点を具体的に指摘し、費用根拠も明記してください。`,
        },
      ];
    } else {
      messageContent = [
        {
          type: "text",
          text: `【建物情報】\n${buildingInfo}\n\n※写真なし。上記建物情報を基に、築年数・修繕履歴から想定される劣化状況を詳細に診断し、費用根拠も明記してください。`,
        },
      ];
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: DIAGNOSIS_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Diagnosis error:", error);
    return NextResponse.json({ error: "診断に失敗しました" }, { status: 500 });
  }
}
