"""
物件API
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from supabase import create_client, Client
import os

router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

class PropertyCreate(BaseModel):
    owner_id: str
    address: str
    latitude: float
    longitude: float
    property_type: str  # 'apartment', 'mansion', 'house'
    building_age: int
    last_repair_year: Optional[int] = None
    floor_area: Optional[float] = None
    current_issues: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None

class PropertyUpdate(BaseModel):
    repair_interest: Optional[bool] = None
    recruitment_work_types: Optional[List[str]] = None
    current_issues: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None

@router.get("/")
async def list_properties(
    prefecture: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    supabase: Client = Depends(get_supabase)
):
    """物件一覧取得（マップ表示用）"""
    try:
        query = supabase.table("properties").select("*").order("created_at", desc=True)
        if prefecture:
            query = query.eq("prefecture", prefecture)
        result = query.limit(limit).execute()
        return {"properties": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_property(property_data: PropertyCreate, supabase: Client = Depends(get_supabase)):
    """物件登録"""
    try:
        # まずRPCを試みる
        try:
            result = supabase.rpc(
                "create_property_with_location",
                {
                    "p_owner_id": property_data.owner_id,
                    "p_address": property_data.address,
                    "p_lat": property_data.latitude,
                    "p_lng": property_data.longitude,
                    "p_property_type": property_data.property_type,
                    "p_building_age": property_data.building_age,
                    "p_last_repair_year": property_data.last_repair_year,
                    "p_floor_area": property_data.floor_area,
                    "p_current_issues": property_data.current_issues,
                    "p_budget_min": property_data.budget_min,
                    "p_budget_max": property_data.budget_max
                }
            ).execute()
            return {"message": "物件を登録しました", "property_id": result.data}
        except Exception:
            # RPCが失敗した場合は直接テーブルにインサート
            insert_data = {
                "owner_id": property_data.owner_id,
                "address": property_data.address,
                "latitude": property_data.latitude,
                "longitude": property_data.longitude,
                "property_type": property_data.property_type,
                "building_age": property_data.building_age,
            }
            if property_data.last_repair_year:
                insert_data["last_repair_year"] = property_data.last_repair_year
            if property_data.current_issues:
                insert_data["current_issues"] = property_data.current_issues
            if property_data.budget_min:
                insert_data["budget_min"] = property_data.budget_min
            if property_data.budget_max:
                insert_data["budget_max"] = property_data.budget_max
            
            result = supabase.table("properties").insert(insert_data).execute()
            if result.data:
                return {"message": "物件を登録しました", "property_id": result.data[0]["id"]}
            raise HTTPException(status_code=500, detail="物件の登録に失敗しました")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/owner/{owner_id}")
async def get_owner_properties(owner_id: str, supabase: Client = Depends(get_supabase)):
    """オーナーの物件一覧取得"""
    try:
        result = supabase.table("properties").select("*").eq("owner_id", owner_id).execute()
        return {"properties": result.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{property_id}")
async def get_property(property_id: str, supabase: Client = Depends(get_supabase)):
    """物件詳細取得"""
    try:
        result = supabase.table("properties").select("*").eq("id", property_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="物件が見つかりません")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{property_id}")
async def update_property(
    property_id: str,
    update_data: PropertyUpdate,
    supabase: Client = Depends(get_supabase)
):
    """物件情報更新"""
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="更新データがありません")
        
        result = supabase.table("properties").update(update_dict).eq("id", property_id).execute()
        
        return {"message": "物件情報を更新しました", "data": result.data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{property_id}")
async def delete_property(property_id: str, supabase: Client = Depends(get_supabase)):
    """物件削除"""
    try:
        result = supabase.table("properties").delete().eq("id", property_id).execute()
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
