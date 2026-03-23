"use client";
import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

const DISMISSED_KEY = "pwa-banner-dismissed";
const DISMISS_DAYS = 7;

// iOS Share Icon (SVG inline)
function IOSShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const daysAgo = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysAgo < DISMISS_DAYS) return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShow(false);
  };

  if (!show || isInstalled) return null;

  return (
    <div style={{
      position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 2rem)", maxWidth: "420px",
      background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
      borderRadius: "1rem", padding: "1rem 1.25rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.15)",
      display: "flex", alignItems: "center", gap: "0.875rem",
    }}>
      <div style={{ width: "2.75rem", height: "2.75rem", background: "rgba(255,255,255,0.12)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Smartphone style={{ width: "1.375rem", height: "1.375rem", color: "#93c5fd" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "white", fontWeight: 800, fontSize: "0.875rem", marginBottom: "0.125rem" }}>
          アプリとして追加
        </p>
        {isIOS ? (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", lineHeight: 1.6 }}>
            ブラウザの <IOSShareIcon /> <strong style={{ color: "#93c5fd" }}>共有</strong> ボタン →「ホーム画面に追加」
          </p>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
            ホーム画面に追加してアプリとして利用
          </p>
        )}
      </div>

      {!isIOS && (
        <button onClick={handleInstall} style={{
          display: "flex", alignItems: "center", gap: "0.375rem",
          background: "white", color: "#1e3a8a", border: "none",
          padding: "0.5rem 0.875rem", borderRadius: "0.625rem",
          fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
          <Download style={{ width: "0.875rem", height: "0.875rem" }} />
          追加
        </button>
      )}

      <button onClick={handleDismiss} style={{
        background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "0.5rem",
        padding: "0.375rem", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center",
      }}>
        <X style={{ width: "1rem", height: "1rem", color: "rgba(255,255,255,0.6)" }} />
      </button>
    </div>
  );
}
