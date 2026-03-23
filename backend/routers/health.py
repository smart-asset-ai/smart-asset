"""
ヘルスチェックエンドポイント
"""
from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()

@router.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

@router.get("/health/ping")
async def ping():
    """シンプルなPing"""
    return {"status": "pong"}
