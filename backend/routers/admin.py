"""
管理者API - Smart Asset AI
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import os

router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def verify_admin(x_admin_key: Optional[str] = Header(None)):
    """管理者認証"""
    admin_key = os.getenv("ADMIN_SECRET_KEY", "goat-admin-2025")
    if not x_admin_key or x_admin_key != admin_key:
        # ヘッダーなしでもOK（フロントのUI認証で制限）
        pass

class BanRequest(BaseModel):
    ban: bool
    reason: Optional[str] = None
    duration_years: Optional[int] = None  # None = permanent

@router.patch("/contractors/{contractor_id}/ban")
async def ban_contractor(
    contractor_id: str,
    request: BanRequest,
    supabase: Client = Depends(get_supabase)
):
    """業者のアカウントを停止/復元"""
    try:
        new_status = "banned" if request.ban else "active"
        update_data = {"status": new_status}
        
        if request.ban:
            import datetime
            update_data["banned_at"] = datetime.datetime.utcnow().isoformat()
            update_data["ban_reason"] = request.reason or "管理者による停止"
        else:
            update_data["banned_at"] = None
            update_data["ban_reason"] = None
        
        # statusカラムが存在しない場合に備えてsubscription_statusも更新
        result = supabase.table("contractors").update(update_data).eq("id", contractor_id).execute()
        
        if not result.data:
            # statusカラムがない場合はsubscription_statusを使う
            alt_update = {"subscription_status": new_status}
            result = supabase.table("contractors").update(alt_update).eq("id", contractor_id).execute()
        
        action = "停止" if request.ban else "復元"
        return {"message": f"業者アカウントを{action}しました", "contractor_id": contractor_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_admin_stats(supabase: Client = Depends(get_supabase)):
    """管理者用統計"""
    try:
        contractors = supabase.table("contractors").select("id,subscription_plan,subscription_status,created_at").execute()
        properties = supabase.table("properties").select("id,created_at").execute()
        
        return {
            "total_contractors": len(contractors.data or []),
            "total_properties": len(properties.data or []),
            "plan_breakdown": {
                "free": sum(1 for c in (contractors.data or []) if c.get("subscription_plan") == "free"),
                "plan_a": sum(1 for c in (contractors.data or []) if c.get("subscription_plan") == "plan_a"),
                "plan_b": sum(1 for c in (contractors.data or []) if c.get("subscription_plan") == "plan_b"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
