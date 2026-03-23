#!/usr/bin/env python3
import os
import sys
import json
import time
import argparse
import logging
from pathlib import Path
from datetime import datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from tqdm import tqdm

BASE_DIR = Path(__file__).parent.parent
TOKEN_FILE = BASE_DIR / "token.json"
CLIENT_SECRET_FILE = BASE_DIR / "client_secret.json"
OUTPUT_DIR = BASE_DIR / "output"
UPLOADED_LOG = BASE_DIR / "uploaded.json"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]

DEFAULT_CATEGORY_ID = "22"
DEFAULT_PRIVACY = "private"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(BASE_DIR / "upload.log"),
    ],
)
logger = logging.getLogger(__name__)


def get_credentials():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            logger.info("トークンを更新中...")
            creds.refresh(Request())
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
            logger.info("トークン更新完了")
        else:
            raise RuntimeError("有効な認証情報がありません。ローカルPCで再認証してください。")
    return creds


def build_youtube_client():
    creds = get_credentials()
    return build("youtube", "v3", credentials=creds)


def load_uploaded_log():
    if UPLOADED_LOG.exists():
        with open(UPLOADED_LOG) as f:
            return json.load(f)
    return {}


def save_uploaded_log(log: dict):
    with open(UPLOADED_LOG, "w") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def upload_video(youtube, file_path: Path, title=None, description=None, tags=None, category_id=DEFAULT_CATEGORY_ID, privacy=DEFAULT_PRIVACY):
    if not file_path.exists():
        logger.error(f"ファイルが見つかりません: {file_path}")
        return None

    file_size = file_path.stat().st_size
    file_size_mb = file_size / (1024 * 1024)

    if title is None:
        title = file_path.stem
    if description is None:
        description = f"アップロード日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    if tags is None:
        tags = ["VTuber", "自動生成"]

    logger.info(f"アップロード開始: {file_path.name} ({file_size_mb:.1f} MB)")
    logger.info(f"  タイトル: {title}")
    logger.info(f"  公開設定: {privacy}")

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
            "defaultLanguage": "ja",
            "defaultAudioLanguage": "ja",
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(
        str(file_path),
        mimetype="video/mp4",
        resumable=True,
        chunksize=10 * 1024 * 1024,
    )

    request = youtube.videos().insert(
        part=",".join(body.keys()),
        body=body,
        media_body=media,
    )

    video_id = None
    retry_count = 0
    max_retries = 5

    with tqdm(total=file_size, unit="B", unit_scale=True, desc=file_path.name) as pbar:
        prev_progress = 0
        while True:
            try:
                status, response = request.next_chunk()
                if status:
                    current = int(status.resumable_progress)
                    pbar.update(current - prev_progress)
                    prev_progress = current
                if response:
                    pbar.update(file_size - prev_progress)
                    video_id = response["id"]
                    break
            except HttpError as e:
                if e.resp.status in [500, 502, 503, 504] and retry_count < max_retries:
                    retry_count += 1
                    wait = 2 ** retry_count
                    logger.warning(f"サーバーエラー。{wait}秒後にリトライ ({retry_count}/{max_retries})")
                    time.sleep(wait)
                else:
                    logger.error(f"アップロードエラー: {e}")
                    return None

    video_url = f"https://www.youtube.com/watch?v={video_id}"
    logger.info(f"アップロード成功!")
    logger.info(f"  動画ID: {video_id}")
    logger.info(f"  URL: {video_url}")
    return video_id


def auto_upload(youtube, privacy=DEFAULT_PRIVACY):
    uploaded_log = load_uploaded_log()
    mp4_files = sorted(OUTPUT_DIR.glob("*.mp4"))
    if not mp4_files:
        logger.info("output/ にMP4ファイルが見つかりません")
        return

    pending = [f for f in mp4_files if f.name not in uploaded_log]
    logger.info(f"未アップロード: {len(pending)}件 / 全{len(mp4_files)}件")

    for file_path in pending:
        video_id = upload_video(youtube, file_path, privacy=privacy)
        if video_id:
            uploaded_log[file_path.name] = {
                "video_id": video_id,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "uploaded_at": datetime.now().isoformat(),
            }
            save_uploaded_log(uploaded_log)
        else:
            logger.error(f"アップロード失敗: {file_path.name}")
        time.sleep(3)

    logger.info("=== 自動アップロード完了 ===")


def main():
    parser = argparse.ArgumentParser(description="YouTube動画アップロードツール")
    parser.add_argument("--file", type=Path, help="アップロードするMP4ファイルのパス")
    parser.add_argument("--title", help="動画タイトル")
    parser.add_argument("--description", help="動画説明文")
    parser.add_argument("--tags", nargs="+", help="タグ（スペース区切り）")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default=DEFAULT_PRIVACY)
    parser.add_argument("--auto", action="store_true", help="output/内の未アップロード動画を全て自動処理")
    parser.add_argument("--list-uploaded", action="store_true", help="アップロード済み一覧を表示")
    args = parser.parse_args()

    if args.list_uploaded:
        log = load_uploaded_log()
        if not log:
            print("アップロード済み動画はありません")
        else:
            print(f"\n=== アップロード済み動画 ({len(log)}件) ===")
            for name, info in log.items():
                print(f"  {name}\n    URL: {info['url']}\n    日時: {info['uploaded_at']}")
        return

    try:
        youtube = build_youtube_client()
        logger.info("YouTube API 認証成功")
    except RuntimeError as e:
        logger.error(str(e))
        sys.exit(1)

    if args.auto:
        auto_upload(youtube, privacy=args.privacy)
        return

    if args.file:
        video_id = upload_video(youtube, args.file, title=args.title, description=args.description, tags=args.tags, privacy=args.privacy)
        if not video_id:
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
