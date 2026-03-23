"""
認証API - Magic Link認証
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from datetime import datetime, timedelta
import secrets

router = APIRouter()

# Supabaseクライアント
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

class EmailRequest(BaseModel):
    email: EmailStr
    marketing_consent: bool = True

class MagicLinkVerify(BaseModel):
    token: str

@router.post("/magic-link")
async def send_magic_link(request: EmailRequest, supabase: Client = Depends(get_supabase)):
    """Magic Link送信"""
    try:
        # トークン生成
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(minutes=10)
        
        # オーナー検索または作成
        result = supabase.table("owners").select("*").eq("email", request.email).execute()
        
        if result.data:
            # 既存ユーザー
            owner_id = result.data[0]["id"]
            supabase.table("owners").update({
                "magic_link_token": token,
                "magic_link_expires_at": expires_at.isoformat(),
                "marketing_consent": request.marketing_consent
            }).eq("id", owner_id).execute()
        else:
            # 新規ユーザー
            new_owner = supabase.table("owners").insert({
                "email": request.email,
                "marketing_consent": request.marketing_consent,
                "magic_link_token": token,
                "magic_link_expires_at": expires_at.isoformat()
            }).execute()
            owner_id = new_owner.data[0]["id"]
        
        # メール送信（TODO: 実際のメール送信実装）
        magic_link = f"https://smart-asset.ai/auth/verify?token={token}"
        
        # 開発用：トークンを返す
        return {
            "message": "Magic Linkを送信しました",
            "email": request.email,
            "dev_token": token if os.getenv("ENVIRONMENT") == "development" else None,
            "dev_link": magic_link if os.getenv("ENVIRONMENT") == "development" else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_magic_link(verify: MagicLinkVerify, supabase: Client = Depends(get_supabase)):
    """Magic Link検証"""
    try:
        result = supabase.table("owners").select("*").eq("magic_link_token", verify.token).execute()
        
        if not result.data:
            raise HTTPException(status_code=401, detail="無効なトークンです")
        
        owner = result.data[0]
        
        # トークン有効期限チェック
        expires_at = datetime.fromisoformat(owner["magic_link_expires_at"].replace("Z", "+00:00"))
        if datetime.now() > expires_at:
            raise HTTPException(status_code=401, detail="トークンの有効期限が切れています")
        
        # ログイン日時更新
        supabase.table("owners").update({
            "last_login_at": datetime.now().isoformat(),
            "magic_link_token": None  # トークンクリア
        }).eq("id", owner["id"]).execute()
        
        return {
            "message": "認証成功",
            "owner_id": owner["id"],
            "email": owner["email"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
