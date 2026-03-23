'use client';
import { useEffect, useState, useRef, useCallback } from 'react';

interface AIMascotProps {
  size?: number;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  bg1?: string;
  bg2?: string;
  variant?: 'dark' | 'light';
}

// 感情フェーズ
type Phase =
  | 'ai'          // AIテキスト (5秒)
  | 'idle'        // 目だけ中央
  | 'look_l'      // 左を見る
  | 'look_r'      // 右を見る
  | 'look_ul'     // 左上
  | 'look_ur'     // 右上
  | 'blink'       // まばたき
  | 'smile'       // ニコッ
  | 'angry'       // 怒り
  | 'sleep'       // 眠そう
  | 'think'       // 考え中
  | 'cry'         // 泣き
  | 'surprised'   // びっくり
  | 'wink';       // ウィンク

// フェーズごとの目の移動量 (200x200座標系)
const EYE_MOVE: Record<Phase, [number, number]> = {
  ai:        [0,   0],
  idle:      [0,   0],
  look_l:    [-28, -8],
  look_r:    [28,  -8],
  look_ul:   [-22, -20],
  look_ur:   [22,  -20],
  blink:     [0,   0],
  smile:     [0,   0],
  angry:     [0,   0],
  sleep:     [0,   0],
  think:     [0,  -14],
  cry:       [0,   0],
  surprised: [0,  -6],
  wink:      [0,   0],
};

const MOVE_DUR: Record<Phase, string> = {
  ai: '0.25s', idle: '0.25s', blink: '0.1s',
  look_l: '0.85s', look_r: '0.85s', look_ul: '0.85s', look_ur: '0.85s',
  smile: '0.3s', angry: '0.25s', sleep: '0.4s',
  think: '0.7s', cry: '0.3s', surprised: '0.15s', wink: '0.25s',
};

// パターン定義 (シャッフルして順番に実行)
const LOOK_PATTERNS: Array<() => Array<{ phase: Phase; dur: number }>> = [
  // キョロキョロ 左右
  () => [
    { phase: 'look_l',  dur: 1200 },
    { phase: 'look_r',  dur: 1200 },
    { phase: 'idle',    dur: 500  },
  ],
  // 左上→右上
  () => [
    { phase: 'look_ul', dur: 1200 },
    { phase: 'look_ur', dur: 1200 },
    { phase: 'idle',    dur: 500  },
  ],
  // 笑顔
  () => [{ phase: 'smile',     dur: 3000 }],
  // 怒り
  () => [{ phase: 'angry',     dur: 2500 }],
  // 眠そう
  () => [{ phase: 'sleep',     dur: 3500 }],
  // 考え中
  () => [{ phase: 'think',     dur: 2500 }],
  // 泣き顔
  () => [{ phase: 'cry',       dur: 3000 }],
  // びっくり
  () => [{ phase: 'surprised', dur: 2500 }],
  // ウィンク
  () => [{ phase: 'wink',      dur: 2500 }],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AIMascot({
  size = 64, animated = true, className = '', style = {},
  bg1 = '#2563eb', bg2 = '#4f46e5', variant = 'dark',
}: AIMascotProps) {
  const isLight = variant === 'light';
  const fgColor    = isLight ? '#1e3a8a' : 'white';
  const bgFill     = 'transparent';
  const strokeColor = isLight ? '#1e3a8a' : 'white';

  const [phase, setPhase]   = useState<Phase>('ai');
  const [eyeRy, setEyeRy]   = useState(16);
  const [shake, setShake]   = useState(false);
  const aliveRef = useRef(true);

  const runLoop = useCallback(async () => {
    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    while (aliveRef.current) {
      // ── AI テキスト表示 (5秒) ──
      setPhase('ai'); setEyeRy(16); setShake(false);
      await delay(5000);
      if (!aliveRef.current) break;

      // ── まばたきで目が出現 ──
      setPhase('blink');
      setEyeRy(2);  await delay(120);
      setEyeRy(16); await delay(120);
      setEyeRy(2);  await delay(100);
      setEyeRy(16);
      if (!aliveRef.current) break;

      // ── ランダムパターンをシャッフルして順に実行 ──
      const queue = shuffle(LOOK_PATTERNS);
      for (const patFn of queue) {
        if (!aliveRef.current) break;
        const steps = patFn();
        for (const step of steps) {
          if (!aliveRef.current) break;
          if (step.phase === 'angry') {
            setPhase('angry'); setShake(true);
            await delay(step.dur);
            setShake(false);
          } else if (step.phase === 'blink') {
            setPhase('blink');
            setEyeRy(2);  await delay(130);
            setEyeRy(16); await delay(130);
            setEyeRy(2);  await delay(100);
            setEyeRy(16);
          } else {
            setPhase(step.phase);
            await delay(step.dur);
          }
        }
        // パターン間は idle に戻して少し待つ
        if (aliveRef.current) {
          setPhase('idle'); setShake(false);
          await delay(700 + Math.random() * 800);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!animated) return;
    aliveRef.current = true;
    const t = setTimeout(() => runLoop(), 400);
    return () => { aliveRef.current = false; clearTimeout(t); };
  }, [animated, runLoop]);

  // ── 表示フラグ ──
  const showAI        = phase === 'ai';
  const showEyes      = phase !== 'ai';
  const showSmile     = phase === 'smile';
  const showAngry     = phase === 'angry';
  const showSleep     = phase === 'sleep';
  const showThink     = phase === 'think';
  const showCry       = phase === 'cry';
  const showSurprised = phase === 'surprised';
  const showWink      = phase === 'wink';

  const [tx, ty] = EYE_MOVE[phase];
  const moveDur  = MOVE_DUR[phase];
  const eyeActualRy = showSleep ? 3 : (showSurprised ? 18 : eyeRy);

  return (
    <div
      className={className}
      style={{
        width: size, height: size, display: 'inline-block', flexShrink: 0,
        animation: shake ? `msk-shake-${size} 0.08s linear infinite` : 'none',
        ...style,
      }}
    >
      <style>{`
        @keyframes msk-shake-${size} {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-2px); }
          75%      { transform: translateX(2px); }
        }
      `}</style>

      <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="mascot-bg-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* 顔 */}
        <rect x="42" y="60" width="116" height="96" rx="26" ry="26"
          {...({ fill: bgFill, stroke: strokeColor, strokeWidth: 8 } as React.SVGProps<SVGRectElement>)} />

        {/* アンテナ */}
        <polygon points="132,60 162,30 160,60"
          {...({ fill: bgFill, stroke: strokeColor, strokeWidth: 6, strokeLinejoin: 'round' } as React.SVGProps<SVGPolygonElement>)} />

        {/* AI テキスト */}
        <text x="100" y="107" textAnchor="middle" dominantBaseline="middle"
          fill={fgColor} fontSize="52" fontWeight="900"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" letterSpacing="6"
          style={{ opacity: showAI ? 1 : 0, transition: 'opacity 0.3s' }}>AI</text>

        {/* ── 怒り眉 ── */}
        {showAngry && (
          <g style={{ opacity: 1, transition: 'opacity 0.2s' }}>
            <line x1="68" y1="78" x2="92" y2="87" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"/>
            <line x1="108" y1="87" x2="132" y2="78" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"/>
          </g>
        )}

        {/* ── 考え中「?」── */}
        {showThink && (
          <text x="148" y="78" textAnchor="middle" fill={fgColor} fontSize="22" fontWeight="900"
            style={{ opacity: 1, transition: 'opacity 0.3s' }}>?</text>
        )}

        {/* ── 眠そう「z」── */}
        {showSleep && (
          <text x="150" y="72" textAnchor="middle" fill={fgColor} fontSize="18" fontWeight="700" opacity={0.7}>z</text>
        )}

        {/* ── びっくり「!」── */}
        {showSurprised && (
          <text x="150" y="78" textAnchor="middle" fill={fgColor} fontSize="22" fontWeight="900"
            style={{ opacity: 1 }}>!</text>
        )}

        {/* ── 目のグループ（移動＋まばたき） ── */}
        <g style={{
          opacity: showEyes ? 1 : 0,
          transform: `translate(${tx}px, ${ty}px)`,
          transition: `transform ${moveDur} ease-in-out, opacity 0.3s`,
        }}>
          {/* ウィンク: 左目を閉じる */}
          {showWink ? (
            <>
              <path d="M 75 97 Q 84 88 93 97" stroke={fgColor} strokeWidth="6" fill="none" strokeLinecap="round"/>
              <ellipse cx="116" cy="97" rx="9" ry={eyeRy} fill={fgColor}
                style={{ transformOrigin: '116px 97px', transition: 'ry 0.08s' }}/>
            </>
          ) : (
            <>
              <ellipse cx="84" cy="97" rx="9" ry={eyeActualRy} fill={fgColor}
                style={{ transformOrigin: '84px 97px', transition: 'ry 0.09s ease' }}/>
              <ellipse cx="116" cy="97" rx="9" ry={eyeActualRy} fill={fgColor}
                style={{ transformOrigin: '116px 97px', transition: 'ry 0.09s ease' }}/>
            </>
          )}
        </g>

        {/* ── 涙（泣き顔） ── */}
        {showCry && (
          <>
            <ellipse cx="84" cy="118" rx="4" ry="9" fill={fgColor} opacity={0.7}/>
            <ellipse cx="116" cy="118" rx="4" ry="9" fill={fgColor} opacity={0.7}/>
            {/* 困り眉 */}
            <line x1="68" y1="84" x2="92" y2="78" stroke={strokeColor} strokeWidth="5" strokeLinecap="round"/>
            <line x1="108" y1="78" x2="132" y2="84" stroke={strokeColor} strokeWidth="5" strokeLinecap="round"/>
          </>
        )}

        {/* ── 口 ── */}
        {/* 通常の口（idle/look/think/sleep/blink時は非表示） */}
        <path d="M 79 128 Q 100 146 121 128"
          stroke={strokeColor} strokeWidth="7" fill="none" strokeLinecap="round"
          style={{
            opacity: showSmile ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out',
          }}/>

        {/* 怒り口（への字） */}
        <path d="M 79 138 Q 100 126 121 138"
          stroke={strokeColor} strokeWidth="7" fill="none" strokeLinecap="round"
          style={{ opacity: showAngry ? 1 : 0, transition: 'opacity 0.2s' }}/>

        {/* びっくり口（丸く開いた） */}
        <ellipse cx="100" cy="135" rx="10" ry="8"
          fill="none" stroke={strokeColor} strokeWidth="5"
          style={{ opacity: showSurprised ? 1 : 0, transition: 'opacity 0.15s' }}/>

        {/* 泣き口（への字） */}
        <path d="M 82 135 Q 100 126 118 135"
          stroke={strokeColor} strokeWidth="7" fill="none" strokeLinecap="round"
          style={{ opacity: showCry ? 1 : 0, transition: 'opacity 0.3s' }}/>
      </svg>
    </div>
  );
}
