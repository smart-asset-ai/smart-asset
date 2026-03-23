#!/usr/bin/env python3
"""
VTuber動画自動生成パイプライン v1.1
台本JSON → VOICEVOX音声（並列生成） → FFmpegテロップ付きMP4
"""

import json
import requests
import subprocess
import os
import sys
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# === 設定 ===
VOICEVOX_URL = "http://localhost:50021"
PROJECT_DIR = Path.home() / "vtuber-factory"
OUTPUT_DIR = PROJECT_DIR / "output"
FONT_PATH = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

# スピーカーID
SPEAKERS = {
    "shikoku_normal": 2,    # 四国めたん（ノーマル）→ 投資系
    "zundamon_normal": 3,   # ずんだもん（ノーマル）→ 雑学系
    "shikoku_happy": 4,     # 四国めたん（あまあま）
    "zundamon_happy": 1,    # ずんだもん（あまあま）
}

# 動画設定
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
VIDEO_FPS = 30
BG_COLOR = "0x1a1a2e"  # ダークブルー背景

# 並列数（VOICEVOXはCPU処理なので4が上限目安）
MAX_WORKERS = 4


def generate_audio(text: str, speaker_id: int, output_path: str) -> float:
    """VOICEVOXで音声生成。再生時間(秒)を返す"""
    print(f"  [音声] 生成中: {text[:30]}...")

    # Step 1: audio_query
    resp = requests.post(
        f"{VOICEVOX_URL}/audio_query",
        params={"text": text, "speaker": speaker_id}
    )
    resp.raise_for_status()
    query = resp.json()

    # スピード調整（少しゆっくり）
    query["speedScale"] = 0.95
    query["pitchScale"] = 0.0
    query["volumeScale"] = 1.0

    # Step 2: synthesis
    resp = requests.post(
        f"{VOICEVOX_URL}/synthesis",
        params={"speaker": speaker_id},
        headers={"Content-Type": "application/json"},
        data=json.dumps(query)
    )
    resp.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(resp.content)

    # 再生時間取得
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", output_path],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())
    print(f"  [音声] 完了: {duration:.2f}秒 → {os.path.basename(output_path)}")
    return duration


def generate_audio_worker(args):
    """ThreadPoolExecutor用ワーカー関数"""
    index, text, speaker_id, output_path = args
    try:
        duration = generate_audio(text, speaker_id, output_path)
        return index, output_path, duration, None
    except Exception as e:
        return index, output_path, 0.0, str(e)


def escape_ffmpeg_text(text: str) -> str:
    """FFmpegのdrawtextフィルタ用にテキストをエスケープ"""
    text = text.replace("\\", "\\\\")
    text = text.replace("'", "'\\''")
    text = text.replace(":", "\\:")
    text = text.replace("%", "%%")
    return text


def generate_video(script: dict, output_filename: str = None):
    """
    台本JSONから動画を生成する

    script形式:
    {
        "title": "動画タイトル",
        "channel": "investment" or "trivia",
        "speaker": "shikoku_normal",
        "scenes": [
            {
                "text": "セリフテキスト",
                "telop": "テロップ（短め）",
                "emotion": "normal"
            },
            ...
        ]
    }
    """
    print(f"\n{'='*60}")
    print(f"動画生成開始: {script['title']}")
    print(f"{'='*60}")

    # 出力ファイル名
    if output_filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{script['channel']}_{timestamp}.mp4"

    output_path = OUTPUT_DIR / output_filename
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 一時ディレクトリ
    tmpdir = tempfile.mkdtemp(prefix="vtuber_")
    print(f"[作業Dir] {tmpdir}")

    try:
        speaker_id = SPEAKERS.get(script["speaker"], 2)
        scenes = script["scenes"]

        # === Phase 1: 全シーンの音声を並列生成 ===
        print(f"\n--- Phase 1: 音声生成 ({len(scenes)}シーン / 並列数{MAX_WORKERS}) ---")

        # ワーカー引数リスト作成
        worker_args = []
        audio_paths = []
        for i, scene in enumerate(scenes):
            audio_path = os.path.join(tmpdir, f"scene_{i:03d}.wav")
            audio_paths.append(audio_path)
            worker_args.append((i, scene["text"], speaker_id, audio_path))

        # 並列実行
        results = {}
        errors = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(generate_audio_worker, args): args[0]
                       for args in worker_args}
            for future in as_completed(futures):
                index, path, duration, error = future.result()
                if error:
                    print(f"  [ERROR] シーン{index}: {error}")
                    errors.append(index)
                else:
                    results[index] = duration

        if errors:
            print(f"[ERROR] {len(errors)}シーンの音声生成に失敗しました: {errors}")
            return None

        # インデックス順に並び替え
        durations = [results[i] for i in range(len(scenes))]
        print(f"[音声] 全{len(scenes)}シーン完了")

        # === Phase 2: 音声結合 ===
        print(f"\n--- Phase 2: 音声結合 ---")
        # シーン間に0.5秒の無音を挿入
        silence_path = os.path.join(tmpdir, "silence.wav")
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i",
            "anullsrc=r=24000:cl=mono", "-t", "0.5",
            "-acodec", "pcm_s16le", silence_path
        ], capture_output=True)

        # 結合リスト作成
        concat_list = os.path.join(tmpdir, "concat.txt")
        with open(concat_list, "w") as f:
            for i, audio_path in enumerate(audio_paths):
                f.write(f"file '{audio_path}'\n")
                if i < len(audio_paths) - 1:
                    f.write(f"file '{silence_path}'\n")

        merged_audio = os.path.join(tmpdir, "merged.wav")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list, "-acodec", "pcm_s16le", merged_audio
        ], capture_output=True)

        # 全体の再生時間
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "csv=p=0", merged_audio],
            capture_output=True, text=True
        )
        total_duration = float(result.stdout.strip())
        print(f"[音声] 合計再生時間: {total_duration:.2f}秒")

        # === Phase 3: テロップ付き動画生成 ===
        print(f"\n--- Phase 3: FFmpegで動画生成 ---")

        # タイムライン計算（各シーンの開始・終了時刻）
        timeline = []
        current_time = 0.0
        for i, dur in enumerate(durations):
            timeline.append({
                "start": current_time,
                "end": current_time + dur,
                "telop": scenes[i].get("telop", scenes[i]["text"][:20]),
                "text": scenes[i]["text"]
            })
            current_time += dur + 0.5  # 0.5秒の無音分

        # タイトル表示（最初の3秒）
        title_text = escape_ffmpeg_text(script["title"])
        filter_parts = []

        # タイトルテロップ（中央上部、最初の3秒）
        filter_parts.append(
            f"drawtext=fontfile={FONT_PATH}:fontsize=56:"
            f"fontcolor=white:borderw=3:bordercolor=black:"
            f"x=(w-text_w)/2:y=80:"
            f"text='{title_text}':"
            f"enable='between(t,0,3)'"
        )

        # 各シーンのテロップ（画面下部）
        for seg in timeline:
            telop = escape_ffmpeg_text(seg["telop"])
            start = seg["start"]
            end = seg["end"]
            filter_parts.append(
                f"drawtext=fontfile={FONT_PATH}:fontsize=42:"
                f"fontcolor=white:borderw=2:bordercolor=black:"
                f"x=(w-text_w)/2:y=h-120:"
                f"text='{telop}':"
                f"enable='between(t,{start:.2f},{end:.2f})'"
            )

        # チャンネル名ウォーターマーク（右上、常時表示）
        ch_name = "Investment Ch." if script["channel"] == "investment" else "Trivia Ch."
        ch_name_escaped = escape_ffmpeg_text(ch_name)
        filter_parts.append(
            f"drawtext=fontfile={FONT_PATH}:fontsize=24:"
            f"fontcolor=white@0.6:borderw=1:bordercolor=black@0.4:"
            f"x=w-text_w-30:y=30:"
            f"text='{ch_name_escaped}'"
        )

        # フィルタ結合
        video_filter = ",".join(filter_parts)

        # FFmpeg実行
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            # 背景色動画生成
            "-f", "lavfi", "-i",
            f"color=c={BG_COLOR}:s={VIDEO_WIDTH}x{VIDEO_HEIGHT}:d={total_duration}:r={VIDEO_FPS}",
            # 音声
            "-i", merged_audio,
            # フィルタ
            "-vf", video_filter,
            # エンコード設定
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
            "-shortest",
            "-movflags", "+faststart",
            str(output_path)
        ]

        print(f"[FFmpeg] エンコード中...")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"[ERROR] FFmpeg失敗:\n{result.stderr[-500:]}")
            return None

        # === 完了 ===
        file_size = output_path.stat().st_size / (1024 * 1024)
        print(f"\n{'='*60}")
        print(f"動画生成完了!")
        print(f"  ファイル: {output_path}")
        print(f"  サイズ:   {file_size:.1f} MB")
        print(f"  再生時間: {total_duration:.1f}秒")
        print(f"  シーン数: {len(scenes)}")
        print(f"{'='*60}\n")

        return str(output_path)

    finally:
        # 一時ファイル削除
        shutil.rmtree(tmpdir, ignore_errors=True)


# === サンプル台本 ===
SAMPLE_INVESTMENT = {
    "title": "2026年2月 注目の高配当銘柄3選",
    "channel": "investment",
    "speaker": "shikoku_normal",
    "scenes": [
        {
            "text": "こんにちは、投資チャンネルへようこそ。今日は2026年2月に注目の高配当銘柄を3つご紹介します。",
            "telop": "2026年2月 注目の高配当銘柄3選"
        },
        {
            "text": "まず1つ目は、安定した業績と高い配当利回りが魅力の銘柄です。",
            "telop": "注目銘柄①：安定業績×高配当"
        },
        {
            "text": "2つ目は、業績回復に伴い増配が期待される銘柄です。",
            "telop": "注目銘柄②：増配期待"
        },
        {
            "text": "3つ目は、株主還元に積極的で自社株買いも実施している銘柄です。",
            "telop": "注目銘柄③：株主還元に積極的"
        },
        {
            "text": "以上、今月の注目高配当銘柄3選でした。投資は自己責任でお願いします。チャンネル登録もよろしくお願いします。",
            "telop": "ご視聴ありがとうございました"
        }
    ]
}

SAMPLE_TRIVIA = {
    "title": "知らないと損する雑学3選",
    "channel": "trivia",
    "speaker": "zundamon_normal",
    "scenes": [
        {
            "text": "やあ、みんな！今日は知って得する雑学を3つ紹介するのだ！",
            "telop": "知って得する雑学3選！"
        },
        {
            "text": "1つ目！バナナは実はベリーの仲間なのだ！逆にイチゴはベリーじゃないのだ！",
            "telop": "バナナはベリー、イチゴはベリーじゃない!?"
        },
        {
            "text": "2つ目！人間の脳は起きている間に約7万回も思考しているのだ！すごいのだ！",
            "telop": "脳は1日7万回思考している！"
        },
        {
            "text": "3つ目！ハチミツは何千年経っても腐らないのだ！エジプトのピラミッドから出てきたハチミツもまだ食べられたのだ！",
            "telop": "ハチミツは何千年も腐らない！"
        },
        {
            "text": "以上、知って得する雑学3選だったのだ！面白かったらチャンネル登録よろしくなのだ！",
            "telop": "チャンネル登録よろしくなのだ！"
        }
    ]
}


if __name__ == "__main__":
    # コマンドライン引数でサンプル選択
    if len(sys.argv) > 1:
        if sys.argv[1] == "investment":
            script = SAMPLE_INVESTMENT
        elif sys.argv[1] == "trivia":
            script = SAMPLE_TRIVIA
        elif sys.argv[1].endswith(".json"):
            with open(sys.argv[1]) as f:
                script = json.load(f)
        else:
            print("Usage: python generate_video.py [investment|trivia|script.json]")
            sys.exit(1)
    else:
        script = SAMPLE_INVESTMENT

    result = generate_video(script)
    if result:
        print(f"SUCCESS: {result}")
    else:
        print("FAILED")
        sys.exit(1)
