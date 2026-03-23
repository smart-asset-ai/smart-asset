"""
Coupon management routes.

Supabase table required (run once in Supabase SQL editor):
---------------------------------------------------------------------------
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent int NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses int DEFAULT 100,
  current_uses int DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
---------------------------------------------------------------------------
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_supabase

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


class CouponCreate(BaseModel):
    code: str
    discount_percent: int
    max_uses: int = 100
    expires_at: Optional[str] = None  # ISO datetime string or None
    active: bool = True


class CouponValidate(BaseModel):
    code: str


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/")
async def list_coupons():
    """List all coupons (admin)."""
    supabase = get_supabase()
    result = (
        supabase.table("coupons")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/")
async def create_coupon(body: CouponCreate):
    """Create a new coupon (admin)."""
    supabase = get_supabase()

    if not 1 <= body.discount_percent <= 100:
        raise HTTPException(status_code=400, detail="discount_percent must be 1-100")

    payload = {
        "code": body.code.upper().strip(),
        "discount_percent": body.discount_percent,
        "max_uses": body.max_uses,
        "active": body.active,
    }
    if body.expires_at:
        payload["expires_at"] = body.expires_at

    result = supabase.table("coupons").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create coupon")
    return result.data[0]


@router.patch("/{coupon_id}/toggle")
async def toggle_coupon(coupon_id: str):
    """Toggle coupon active status (admin)."""
    supabase = get_supabase()

    # Get current state
    current = supabase.table("coupons").select("active").eq("id", coupon_id).execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Coupon not found")

    new_active = not current.data[0]["active"]
    result = (
        supabase.table("coupons")
        .update({"active": new_active})
        .eq("id", coupon_id)
        .execute()
    )
    return result.data[0] if result.data else {"active": new_active}


@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: str):
    """Delete a coupon (admin)."""
    supabase = get_supabase()
    supabase.table("coupons").delete().eq("id", coupon_id).execute()
    return {"deleted": True}


# ── Public endpoint ───────────────────────────────────────────────────────────

@router.post("/validate")
async def validate_coupon(body: CouponValidate):
    """Validate a coupon code. Returns discount info or error."""
    supabase = get_supabase()
    code = body.code.upper().strip()

    result = supabase.table("coupons").select("*").eq("code", code).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="クーポンコードが見つかりません")

    coupon = result.data[0]

    if not coupon["active"]:
        raise HTTPException(status_code=400, detail="このクーポンは無効です")

    if coupon["expires_at"]:
        expires = datetime.fromisoformat(coupon["expires_at"].replace("Z", "+00:00"))
        if datetime.now(expires.tzinfo) > expires:
            raise HTTPException(status_code=400, detail="このクーポンは有効期限切れです")

    if coupon["current_uses"] >= coupon["max_uses"]:
        raise HTTPException(status_code=400, detail="このクーポンは使用上限に達しました")

    return {
        "valid": True,
        "code": coupon["code"],
        "discount_percent": coupon["discount_percent"],
        "message": f"{coupon['discount_percent']}%割引が適用されます",
    }
