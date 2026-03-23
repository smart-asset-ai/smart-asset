"use client";
import { useEffect, useState } from "react";
import { Smartphone, Download } from "lucide-react";

const DISMISSED_KEY = "pwa-banner-dismissed";

function IOSShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function PWAInstallButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSHint(true); return; }
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    }
  };

  if (isInstalled) return null;
  // Only show if iOS or prompt available
  if (!isIOS && !prompt) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleInstall} style={{
        display: "inline-flex", alignItems: "center", gap: "0.5rem",
        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)",
        color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.875rem",
        fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer",
      }}>
        <Smartphone style={{ width: "1.125rem", height: "1.125rem" }} />
        ホーム画面に追加（無料）
      </button>
      {showIOSHint && (
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8125rem", marginTop: "0.625rem", lineHeight: 1.6 }}>
          ブラウザの <IOSShareIcon /> 共有ボタン →「ホーム画面に追加」をタップ
        </p>
      )}
    </div>
  );
}
