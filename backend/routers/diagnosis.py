"""
AI診断API
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import os
from services.claude_service import ClaudeService

router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

class DiagnosisRequest(BaseModel):
    property_id: Optional[str] = None
    address: str
    building_age: int
    property_type: str  # 'apartment', 'mansion', 'house'
    last_repair_year: Optional[int] = None
    floor_area: Optional[float] = None
    current_issues: Optional[str] = None

@router.post("/")
async def diagnose_property(
    request: DiagnosisRequest,
    supabase: Client = Depends(get_supabase)
):
    """AI診断実行"""
    try:
        # Claude APIで診断
        claude = ClaudeService()
        diagnosis_result = await claude.diagnose_property(
            address=request.address,
            building_age=request.building_age,
            property_type=request.property_type,
            last_repair_year=request.last_repair_year,
            floor_area=request.floor_area,
            current_issues=request.current_issues
        )
        
        # 診断結果を保存（property_idがある場合）
        if request.property_id:
            supabase.table("ai_diagnoses").insert({
                "property_id": request.property_id,
                "diagnosis_data": diagnosis_result,
                "model_used": "claude-sonnet-4-20250514"
            }).execute()
        
        return {
            "diagnosis": diagnosis_result,
            "property_id": request.property_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{property_id}")
async def get_diagnosis_history(property_id: str, supabase: Client = Depends(get_supabase)):
    """診断履歴取得"""
    try:
        result = supabase.table("ai_diagnoses") \
            .select("*") \
            .eq("property_id", property_id) \
            .order("created_at", desc=True) \
            .execute()
        
        return {"diagnoses": result.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
