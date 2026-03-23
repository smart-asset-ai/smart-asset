#!/usr/bin/env python3
"""
VTuber Factory Webhook Server v1.1
- タイムアウト10分に延長
- /download/{filename} 追加
- /upload 追加
"""

import json
import os
import sys
import asyncio
import subprocess
import traceback
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional
import requests as http_requests

# === 設定 ===
PROJECT_DIR = Path.home() / "vtuber-factory"
SCRIPTS_DIR = PROJECT_DIR / "scripts"
OUTPUT_DIR = PROJECT_DIR / "output"
LOG_FILE = PROJECT_DIR / "webhook.log"

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")
PYTHON = str(PROJECT_DIR / "venv" / "bin" / "python3")

app = FastAPI(title="VTuber Factory API", version="1.1")


def log(message: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def notify_discord(message: str):
    if not DISCORD_WEBHOOK_URL:
        log("[WARN] DISCORD_WEBHOOK_URL未設定")
        return
    try:
        http_requests.post(DISCORD_WEBHOOK_URL, json={"content": message}, timeout=10)
    except Exception as e:
        log(f"[Discord] 通知失敗: {e}")


class VideoRequest(BaseModel):
    title: str
    channel: str = "investment"
    speaker: str = "shikoku_normal"
    scenes: list
    auto_upload: bool = False
    privacy: str = "private"
    notify: bool = True


class SimpleRequest(BaseModel):
    command: str
    auto_upload: bool = False
    privacy: str = "private"


class UploadRequest(BaseModel):
    filename: str
    privacy: str = "private"


def run_video_generation(script_data: dict, auto_upload: bool, privacy: str, notify: bool):
    try:
        log(f"[開始] 動画生成: {script_data['title']}")
        if notify:
            notify_discord(f"🎬 動画生成開始: **{script_data['title']}**")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        script_path = PROJECT_DIR / f"tmp_script_{timestamp}.json"
        with open(script_path, "w") as f:
            json.dump(script_data, f, ensure_ascii=False, indent=2)

        # タイムアウト10分に延長
        result = subprocess.run(
            [PYTHON, str(SCRIPTS_DIR / "generate_video.py"), str(script_path)],
            capture_output=True, text=True, timeout=600
        )

        script_path.unlink(missing_ok=True)

        if result.returncode != 0:
            log(f"[ERROR] 動画生成失敗:\n{result.stderr[-500:]}")
            if notify:
                notify_discord(f"❌ 動画生成失敗: {script_data['title']}\n```{result.stderr[-200:]}```")
            return

        output_line = [l for l in result.stdout.split("\n") if l.startswith("SUCCESS:")]
        if not output_line:
            log("[ERROR] 出力ファイル不明")
            if notify:
                notify_discord(f"❌ 出力ファイルが見つかりません")
            return

        video_path = output_line[0].replace("SUCCESS: ", "").strip()
        video_filename = Path(video_path).name
        file_size = Path(video_path).stat().st_size / (1024 * 1024)
        log(f"[完了] 動画生成: {video_path} ({file_size:.1f}MB)")

        # プレビューURL付きで通知
        preview_url = f"http://141.253.121.51:8080/download/{video_filename}"

        if auto_upload:
            log(f"[開始] YouTubeアップロード: {video_path}")
            if notify:
                notify_discord(f"📤 YouTubeアップロード中...")

            upload_result = subprocess.run(
                [PYTHON, str(SCRIPTS_DIR / "upload_youtube.py"),
                 "--file", video_path, "--privacy", privacy],
                capture_output=True, text=True, timeout=600
            )

            if upload_result.returncode == 0:
                url_line = [l for l in upload_result.stdout.split("\n") if "youtube.com" in l or "youtu.be" in l]
                url = url_line[0].strip() if url_line else "URL取得できず"
                log(f"[完了] YouTubeアップロード: {url}")
                if notify:
                    notify_discord(
                        f"✅ 動画完成＆アップロード済！\n"
                        f"📹 **{script_data['title']}**\n"
                        f"📊 サイズ: {file_size:.1f}MB\n"
                        f"🔗 YouTube: {url}\n"
                        f"🔒 公開設定: {privacy}"
                    )
            else:
                log(f"[ERROR] アップロード失敗:\n{upload_result.stderr[-300:]}")
                if notify:
                    notify_discord(f"❌ アップロード失敗\n```{upload_result.stderr[-200:]}```")
        else:
            if notify:
                notify_discord(
                    f"✅ 動画生成完了！\n"
                    f"📹 **{script_data['title']}**\n"
                    f"📊 サイズ: {file_size:.1f}MB\n"
                    f"🎥 プレビュー: {preview_url}\n"
                    f"📁 ファイル: {video_filename}\n"
                    f"👉 確認後「アップして」と言ってください"
                )

    except subprocess.TimeoutExpired:
        log("[ERROR] タイムアウト（10分超過）")
        if notify:
            notify_discord(f"❌ タイムアウト: 動画生成に10分以上かかりました")
    except Exception as e:
        log(f"[ERROR] {traceback.format_exc()}")
        if notify:
            notify_discord(f"❌ エラー: {str(e)[:200]}")


# === エンドポイント ===

@app.get("/")
def root():
    return {"status": "ok", "service": "VTuber Factory", "version": "1.1"}


@app.get("/health")
def health():
    voicevox_ok = False
    try:
        r = http_requests.get("http://localhost:50021/version", timeout=3)
        voicevox_ok = r.status_code == 200
    except:
        pass

    output_files = list(OUTPUT_DIR.glob("*.mp4")) if OUTPUT_DIR.exists() else []

    return {
        "status": "healthy",
        "voicevox": "running" if voicevox_ok else "down",
        "videos_count": len(output_files),
        "disk_free": subprocess.run(
            ["df", "-h", "--output=avail", "/home"],
            capture_output=True, text=True
        ).stdout.strip().split("\n")[-1].strip()
    }


@app.post("/generate")
def generate_video(req: VideoRequest, background_tasks: BackgroundTasks):
    script_data = {
        "title": req.title,
        "channel": req.channel,
        "speaker": req.speaker,
        "scenes": req.scenes
    }
    background_tasks.add_task(
        run_video_generation, script_data, req.auto_upload, req.privacy, req.notify
    )
    return {"status": "accepted", "message": f"動画生成開始: {req.title}"}


@app.post("/generate/quick")
def generate_quick(req: SimpleRequest, background_tasks: BackgroundTasks):
    sys.path.insert(0, str(SCRIPTS_DIR))
    from generate_video import SAMPLE_INVESTMENT, SAMPLE_TRIVIA

    if req.command == "investment":
        script_data = SAMPLE_INVESTMENT
    elif req.command == "trivia":
        script_data = SAMPLE_TRIVIA
    else:
        raise HTTPException(status_code=400, detail="command: investment or trivia")

    background_tasks.add_task(
        run_video_generation, script_data, req.auto_upload, req.privacy, True
    )
    return {"status": "accepted", "message": f"サンプル動画生成開始: {req.command}"}


@app.get("/videos")
def list_videos():
    if not OUTPUT_DIR.exists():
        return {"videos": []}

    videos = []
    for f in sorted(OUTPUT_DIR.glob("*.mp4"), reverse=True):
        stat = f.stat()
        videos.append({
            "filename": f.name,
            "size_mb": round(stat.st_size / (1024 * 1024), 1),
            "created": datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d %H:%M:%S"),
            "preview_url": f"http://141.253.121.51:8080/download/{f.name}"
        })
    return {"count": len(videos), "videos": videos}


@app.get("/download/{filename}")
def download_video(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"ファイルが見つかりません: {filename}")
    if not file_path.suffix == ".mp4":
        raise HTTPException(status_code=400, detail="MP4ファイルのみ対応")
    return FileResponse(str(file_path), media_type="video/mp4", filename=filename)


@app.post("/upload")
def upload_to_youtube(req: UploadRequest, background_tasks: BackgroundTasks):
    file_path = OUTPUT_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"ファイルが見つかりません: {req.filename}")

    def run_upload():
        try:
            log(f"[開始] YouTubeアップロード: {req.filename}")
            notify_discord(f"📤 YouTubeアップロード中: **{req.filename}**")

            result = subprocess.run(
                [PYTHON, str(SCRIPTS_DIR / "upload_youtube.py"),
                 "--file", str(file_path), "--privacy", req.privacy],
                capture_output=True, text=True, timeout=600
            )

            if result.returncode == 0:
                url_line = [l for l in result.stdout.split("\n") if "youtube.com" in l or "youtu.be" in l]
                url = url_line[0].strip() if url_line else "URL取得できず"
                log(f"[完了] YouTubeアップロード: {url}")
                notify_discord(f"✅ アップロード完了！\n🎬 **{req.filename}**\n🔗 {url}\n🔒 {req.privacy}")
            else:
                log(f"[ERROR] アップロード失敗: {result.stderr[-300:]}")
                notify_discord(f"❌ アップロード失敗\n```{result.stderr[-200:]}```")
        except Exception as e:
            log(f"[ERROR] {e}")
            notify_discord(f"❌ アップロードエラー: {str(e)[:200]}")

    background_tasks.add_task(run_upload)
    return {"status": "accepted", "message": f"アップロード開始: {req.filename}"}


if __name__ == "__main__":
    import uvicorn
    log("=== VTuber Factory Webhook Server v1.1 起動 ===")
    uvicorn.run(app, host="0.0.0.0", port=8080)
