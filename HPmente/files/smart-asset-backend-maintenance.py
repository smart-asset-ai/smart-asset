"""
Smart Asset AI - メンテナンスモード対応バックエンド
Supabase と同期し、メンテナンス中のリクエストを処理
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase設定
SUPABASE_URL = "https://xwzotyjutiwwgvfldre.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koZonk"

async def get_maintenance_mode():
    """Supabaseからメンテナンスモード状態を取得"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/settings?key=eq.maintenance",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json"
                }
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return data[0].get("value", False), data[0].get("message", "")
    except Exception as e:
        print(f"Supabase接続エラー: {e}")
    
    return False, ""

async def get_page_content():
    """Supabaseからページコンテンツを取得"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/pages?select=*&name=eq.home",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json"
                }
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return data[0].get("sections", [])
    except Exception as e:
        print(f"Supabase接続エラー: {e}")
    
    return []

# メンテナンスページHTML
MAINTENANCE_TEMPLATE = """
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>メンテナンス中 - Smart Asset AI</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        
        .container {{
            max-width: 600px;
            width: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 60px 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.6s ease-out;
        }}
        
        @keyframes slideUp {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .icon {{
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }}
        
        h1 {{
            color: #1e293b;
            font-size: 32px;
            margin-bottom: 15px;
            font-weight: 700;
        }}
        
        .message {{
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 40px;
            white-space: pre-wrap;
        }}
        
        .status {{
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        
        .status-label {{
            color: #64748b;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }}
        
        .status-time {{
            color: #1e293b;
            font-weight: 600;
            font-size: 14px;
        }}
        
        .loader {{
            display: inline-block;
            width: 40px;
            height: 40px;
            margin-bottom: 20px;
        }}
        
        .loader::after {{
            content: "";
            display: block;
            width: 32px;
            height: 32px;
            margin: 4px;
            border-radius: 50%;
            border: 4px solid #3b82f6;
            border-color: #3b82f6 transparent #3b82f6 transparent;
            animation: loader 1.2s linear infinite;
        }}
        
        @keyframes loader {{
            0% {{
                transform: rotate(0deg);
            }}
            100% {{
                transform: rotate(360deg);
            }}
        }}
        
        .contact {{
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
        }}
        
        .contact a {{
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s;
        }}
        
        .contact a:hover {{
            color: #1e40af;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>メンテナンス中です</h1>
        
        <div class="loader"></div>
        
        <div class="message">{message}</div>
        
        <div class="status">
            <div class="status-label">予定時刻</div>
            <div class="status-time">近日中に復旧予定</div>
        </div>
        
        <div class="contact">
            ご不便をおかけして申し訳ございません。<br>
            <a href="mailto:support@smart-asset.ai">お問い合わせ</a>
        </div>
    </div>
</body>
</html>
"""

# ミドルウェア: メンテナンスモード確認
@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    # 管理画面へのアクセスは許可
    if request.url.path.startswith("/admin"):
        return await call_next(request)
    
    # メンテナンスモードを確認
    is_maintenance, message = await get_maintenance_mode()
    
    if is_maintenance:
        if message == "":
            message = "ただいまメンテナンス中です。\nしばらくお待ちください。"
        return HTMLResponse(
            content=MAINTENANCE_TEMPLATE.format(message=message),
            status_code=503
        )
    
    return await call_next(request)

# API: メンテナンスモード確認
@app.get("/api/status")
async def get_status():
    """現在のステータスを取得"""
    is_maintenance, message = await get_maintenance_mode()
    return {
        "maintenance": is_maintenance,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }

# API: メンテナンスモード切り替え
@app.post("/api/maintenance/toggle")
async def toggle_maintenance(maintenance: bool):
    """メンテナンスモードを切り替え"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/settings?key=eq.maintenance",
                json={
                    "value": maintenance,
                    "updated_at": datetime.now().isoformat()
                },
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json"
                }
            )
            if response.status_code in [200, 204]:
                return {
                    "success": True,
                    "maintenance": maintenance,
                    "message": "メンテナンスモードを切り替えました"
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }, 500

# API: ページコンテンツ取得
@app.get("/api/pages")
async def get_pages():
    """ページコンテンツを取得"""
    sections = await get_page_content()
    return {
        "sections": sections,
        "timestamp": datetime.now().isoformat()
    }

# ルートエンドポイント
@app.get("/")
async def root():
    """ホームページ"""
    is_maintenance, _ = await get_maintenance_mode()
    
    if is_maintenance:
        message = "メンテナンス中です。管理画面から復旧できます。"
        return HTMLResponse(
            content=MAINTENANCE_TEMPLATE.format(message=message),
            status_code=503
        )
    
    # 通常時はホームページを返す
    return {
        "message": "Smart Asset AI API",
        "version": "1.0",
        "status": "running"
    }

# ヘルスチェック
@app.get("/health")
async def health():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
