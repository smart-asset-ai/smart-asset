"""
Claude API サービス
"""
from anthropic import Anthropic
import os
import json
from typing import Optional

class ClaudeService:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    
    async def diagnose_property(
        self,
        address: str,
        building_age: int,
        property_type: str,
        last_repair_year: Optional[int] = None,
        floor_area: Optional[float] = None,
        current_issues: Optional[str] = None
    ) -> dict:
        """物件のAI診断"""
        
        # プロンプト構築
        property_info = f"""
物件情報:
- 所在地: {address}
- 築年数: {building_age}年
- 物件種別: {property_type}
- 延床面積: {floor_area if floor_area else '不明'}㎡
- 最終修繕年: {last_repair_year if last_repair_year else '不明'}
- 現在の不具合: {current_issues if current_issues else 'なし'}
"""
        
        prompt = f"""
あなたは不動産修繕の専門家です。以下の物件情報から、修繕の必要性を診断してください。

{property_info}

以下のJSON形式で回答してください（```json は付けないでください）:

{{
  "urgency": "高" | "中" | "低",
  "recommended_timing": "すぐに" | "1年以内" | "2-3年以内" | "3年以上先",
  "estimated_cost": {{
    "min": 最小金額（万円）,
    "max": 最大金額（万円）,
    "breakdown": [
      {{"item": "工事項目", "cost": 金額（万円）}}
    ]
  }},
  "asset_value_impact": "修繕しない場合の資産価値への影響（文章）",
  "risk_analysis": {{
    "one_year": "1年後のリスク",
    "three_years": "3年後のリスク"
  }},
  "advice": "具体的なアドバイス（3-5文）"
}}
"""
        
        try:
            # Claude API呼び出し
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # レスポンスからJSON抽出
            response_text = message.content[0].text
            
            # ```json の除去（念のため）
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # JSON解析
            diagnosis = json.loads(response_text)
            
            return diagnosis
            
        except json.JSONDecodeError as e:
            # JSON解析エラー時のフォールバック
            return {
                "urgency": "中",
                "recommended_timing": "1年以内",
                "estimated_cost": {
                    "min": 100,
                    "max": 200,
                    "breakdown": [
                        {"item": "外壁塗装", "cost": 150}
                    ]
                },
                "asset_value_impact": "AI診断の解析に失敗しました。専門家にご相談ください。",
                "risk_analysis": {
                    "one_year": "診断エラー",
                    "three_years": "診断エラー"
                },
                "advice": "診断結果の解析に失敗しました。お手数ですが再度お試しください。",
                "error": str(e)
            }
        
        except Exception as e:
            raise Exception(f"Claude API Error: {str(e)}")
