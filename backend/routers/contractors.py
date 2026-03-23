"""
業者API
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from supabase import create_client, Client
import os
import hashlib


def compute_demo_score(contractor: dict) -> int:
    """デモ用AIスコア計算"""
    # 自動入力データはEランク固定
    desc = contractor.get('description') or ''
    if '自動入力' in desc:
        return 20
    cid = contractor.get('id', '')
    h = int(hashlib.md5(cid.encode()).hexdigest()[:8], 16)
    base = 30 + (h % 60)
    if contractor.get('construction_license'): base = min(95, base + 5)
    if contractor.get('corporate_number'): base = min(95, base + 3)
    if contractor.get('description'): base = min(95, base + 2)
    return base


router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

class ContractorCreate(BaseModel):
    email: EmailStr
    company_name: str
    representative: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_types: List[str]
    business_hours: Optional[str] = None
    closed_days: Optional[List[str]] = None

class ContractorUpdate(BaseModel):
    company_name: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    business_hours: Optional[str] = None
    closed_days: Optional[List[str]] = None
    corporate_number: Optional[str] = None
    founded_year: Optional[int] = None
    employees: Optional[int] = None
    capital_million: Optional[int] = None
    strengths: Optional[List[str]] = None
    company_description: Optional[str] = None

@router.post("/")
async def create_contractor(contractor: ContractorCreate, supabase: Client = Depends(get_supabase)):
    """業者登録"""
    try:
        contractor_data = {
            "email": contractor.email,
            "company_name": contractor.company_name,
            "representative": contractor.representative,
            "phone": contractor.phone,
            "address": contractor.address,
            "work_types": contractor.work_types,
            "closed_days": contractor.closed_days or [],
            "subscription_plan": "free",
            "subscription_status": "inactive"
        }
        
        if contractor.latitude and contractor.longitude:
            result = supabase.rpc(
                "create_contractor_with_location",
                {**contractor_data, "p_lat": contractor.latitude, "p_lng": contractor.longitude}
            ).execute()
            contractor_id = result.data
        else:
            result = supabase.table("contractors").insert(contractor_data).execute()
            contractor_id = result.data[0]["id"]
        
        return {"message": "業者登録が完了しました", "contractor_id": contractor_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contractor_id}")
async def get_contractor(contractor_id: str, supabase: Client = Depends(get_supabase)):
    """業者詳細取得"""
    try:
        result = supabase.table("contractors").select("*").eq("id", contractor_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="業者が見つかりません")
        
        contractor = result.data[0]
        contractor["ai_score"] = compute_demo_score(contractor)
        
        certs = supabase.table("contractor_certifications").select("*").eq("contractor_id", contractor_id).execute()
        contractor["certifications"] = certs.data
        
        return contractor
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{contractor_id}")
async def update_contractor(
    contractor_id: str,
    update_data: ContractorUpdate,
    supabase: Client = Depends(get_supabase)
):
    """業者情報更新"""
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            raise HTTPException(status_code=400, detail="更新データがありません")
        result = supabase.table("contractors").update(update_dict).eq("id", contractor_id).execute()
        return {"message": "業者情報を更新しました", "data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def search_contractors(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: int = Query(20),
    work_types: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    supabase: Client = Depends(get_supabase)
):
    """業者検索"""
    try:
        if lat and lng:
            work_types_array = work_types.split(",") if work_types else None
            result = supabase.rpc(
                "nearby_contractors",
                {"lat": lat, "lng": lng, "radius_km": radius_km, "work_type_filter": work_types_array}
            ).execute()
            contractors = result.data
            for c in contractors:
                c["ai_score"] = compute_demo_score(c)
            if min_score:
                contractors = [c for c in contractors if c.get("ai_score", 0) >= min_score]
            return {"contractors": contractors}
        
        else:
            query = supabase.table("contractors").select("*")
            if work_types:
                query = query.contains("work_types", work_types.split(","))
            result = query.execute()
            data = result.data
            for c in data:
                c["ai_score"] = compute_demo_score(c)
            if min_score:
                data = [c for c in data if c.get("ai_score", 0) >= min_score]
            return {"contractors": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
