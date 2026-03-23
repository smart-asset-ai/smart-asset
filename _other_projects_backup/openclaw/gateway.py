#!/usr/bin/env python3
import json
import logging
import asyncio
from pathlib import Path
import discord
from anthropic import Anthropic

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Path.home() / '.openclaw' / 'logs' / 'gateway.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

CONFIG_PATH = Path.home() / '.openclaw' / 'openclaw.json'
HISTORY_PATH = Path.home() / '.openclaw' / 'history.json'

with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    config = json.load(f)

anthropic_client = Anthropic(api_key=config['anthropic_api_key'])
ALTAIR_CHANNEL_ID = int(config['discord']['altair_channel_id'])
ALTAIR_CFG = config['agents']['altair']

def clean_messages(messages):
    """空メッセージ除去 + user/assistant交互を保証"""
    filtered = [m for m in messages if m.get('content', '').strip()]
    result = []
    for m in filtered:
        if result and result[-1]['role'] == m['role']:
            result[-1]['content'] += '\n' + m['content']
        else:
            result.append({'role': m['role'], 'content': m['content']})
    while result and result[0]['role'] != 'user':
        result.pop(0)
    return result

def load_history():
    if HISTORY_PATH.exists():
        with open(HISTORY_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_history(history):
    with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

conversation_history = load_history()

intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)

@bot.event
async def on_ready():
    logger.info(f'✓ {bot.user} (Altair) 起動完了')
    # 起動時にDiscordチャンネルから過去メッセージを取得して履歴を復元
    channel = bot.get_channel(ALTAIR_CHANNEL_ID)
    if channel is None:
        logger.warning('チャンネルが見つかりません')
        return

    try:
        restored = 0
        # 直近100件のメッセージを古い順に取得
        messages = []
        async for msg in channel.history(limit=100, oldest_first=False):
            messages.append(msg)
        messages.reverse()  # 古い順に並べ直す

        for msg in messages:
            if not msg.content.strip():
                continue
            uid = 'channel'
            if uid not in conversation_history:
                conversation_history[uid] = []
            if msg.author.bot and str(msg.author.id) == str(config['agents']['altair']['discord_bot_id']):
                if not any(m['role'] == 'assistant' and m['content'] == msg.content
                           for m in conversation_history[uid][-5:]):
                    conversation_history[uid].append({"role": "assistant", "content": msg.content})
                    restored += 1
            elif not msg.author.bot:
                if not any(m['role'] == 'user' and m['content'] == msg.content
                           for m in conversation_history[uid][-5:]):
                    conversation_history[uid].append({"role": "user", "content": msg.content})
                    restored += 1

        # 最新50件に絞る
        if 'channel' in conversation_history:
            conversation_history['channel'] = conversation_history['channel'][-50:]

        save_history(conversation_history)
        logger.info(f'✓ チャンネル履歴を復元: {restored}件')
    except Exception as e:
        logger.error(f'✗ 履歴復元エラー: {e}')

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    if message.channel.id != ALTAIR_CHANNEL_ID:
        return
    if not message.content.strip():
        return

    # チャンネル共有履歴を使用
    uid = 'channel'
    if uid not in conversation_history:
        conversation_history[uid] = []

    conversation_history[uid].append({"role": "user", "content": message.content})
    if len(conversation_history[uid]) > 50:
        conversation_history[uid] = conversation_history[uid][-50:]

    async with message.channel.typing():
        try:
            clean = clean_messages(conversation_history[uid])
            if not clean:
                await message.channel.send('履歴が空です。もう一度話しかけてください。')
                return
            response = anthropic_client.messages.create(
                model=ALTAIR_CFG['model'],
                max_tokens=2048,
                system=f"あなたは {ALTAIR_CFG['name']} です。役割: {ALTAIR_CFG['role']}",
                messages=clean
            )
            reply = response.content[0].text
            conversation_history[uid].append({"role": "assistant", "content": reply})
            save_history(conversation_history)
            logger.info(f'✓ Altair → {message.author}: {reply[:50]}...')

            for i in range(0, len(reply), 2000):
                await message.channel.send(reply[i:i+2000])

        except Exception as e:
            logger.error(f'✗ エラー: {e}')
            await message.channel.send(f'エラーが発生しました: {str(e)}')

token = config['discord'].get('bot_token', '')
if not token:
    logger.error('✗ bot_token が設定されていません')
    exit(1)

bot.run(token)
