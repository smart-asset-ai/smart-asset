"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Minimize2, Maximize2, RefreshCw } from "lucide-react";
import AIMascot from "@/components/AIMascot";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "こんにちは！✨ Smart Asset AIです。\n\n建物の修繕・管理について何でもお聞きください！\n\n例えば：\n・「外壁のひび割れが気になる」\n・「屋根修繕の相場を教えて」\n・「信頼できる業者の選び方は？」",
};

const QUICK_QUESTIONS = [
  "🎨 外壁塗装の費用は？",
  "🔍 業者の選び方",
  "🤖 AI診断の使い方",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);



  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;
    setInput("");
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error("APIエラー");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => { const updated = [...prev]; updated[updated.length - 1] = { role: "assistant", content: accumulated }; return updated; });
        if (!isOpen) setUnreadCount((c) => c + 1);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => { const updated = [...prev]; updated[updated.length - 1] = { role: "assistant", content: "申し訳ありません。エラーが発生しました。もう一度お試しください。" }; return updated; });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => { abortRef.current?.abort(); setMessages([WELCOME_MESSAGE]); setInput(""); setIsLoading(false); };

  const panelH = isExpanded ? "600px" : "460px";
  const panelW = isExpanded ? "min(440px,calc(100vw - 2rem))" : "min(370px,calc(100vw - 2rem))";

  return (
    <div style={{ position: "fixed", bottom: "3.6rem", right: "1.25rem", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>

      {/* ===== CHAT PANEL ===== */}
      {isOpen && (
        <div style={{ width: panelW, height: panelH, background: "white", borderRadius: "1.25rem", boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AIMascot size={40} animated={true} style={{ borderRadius: "0.875rem", overflow: "hidden" }} />
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>AI修繕アシスタント</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", background: "#4ade80", display: "inline-block" }} className="animate-pulse" />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem" }}>いつでもお気軽に</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {[
                { onClick: resetChat, icon: <RefreshCw style={{ width: "0.875rem", height: "0.875rem" }} />, title: "リセット" },
                { onClick: () => setIsExpanded(!isExpanded), icon: isExpanded ? <Minimize2 style={{ width: "0.875rem", height: "0.875rem" }} /> : <Maximize2 style={{ width: "0.875rem", height: "0.875rem" }} />, title: isExpanded ? "縮小" : "拡大" },
                { onClick: () => setIsOpen(false), icon: <X style={{ width: "0.875rem", height: "0.875rem" }} />, title: "閉じる" },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} title={btn.title} style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.15)", border: "none", color: "rgba(255,255,255,0.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem", background: "#f8fafc" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "0.5rem" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #1e40af, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <AIMascot size={28} animated={false} />
                  </div>
                )}
                <div style={{
                  maxWidth: "80%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white" }
                    : { background: "white", color: "#1f2937", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6" }
                  ),
                }}>
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                  ))}
                  {msg.role === "assistant" && i === messages.length - 1 && isLoading && (
                    <span style={{ display: "inline-flex", gap: "0.25rem", marginLeft: "0.375rem", verticalAlign: "middle" }}>
                      {[0, 150, 300].map((delay, k) => (
                        <span key={k} className="animate-bounce" style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", background: "#93c5fd", display: "inline-block", animationDelay: `${delay}ms` }} />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length === 1 && (
            <div style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", background: "white" }}>
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} style={{ fontSize: "0.75rem", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#1d4ed8", padding: "0.375rem 0.75rem", borderRadius: "9999px", border: "1px solid #bfdbfe", cursor: "pointer", fontWeight: 500 }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "0.75rem", background: "white", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="修繕について質問する..."
                rows={1}
                disabled={isLoading}
                style={{ flex: 1, resize: "none", borderRadius: "0.875rem", border: "1px solid #e5e7eb", padding: "0.625rem 0.875rem", fontSize: "0.875rem", outline: "none", minHeight: "2.5rem", maxHeight: "6rem", overflowY: "auto", color: "#111827", background: isLoading ? "#f9fafb" : "white" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.875rem", background: input.trim() && !isLoading ? "linear-gradient(135deg, #2563eb, #4f46e5)" : "#e5e7eb", border: "none", color: input.trim() && !isLoading ? "white" : "#9ca3af", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: input.trim() && !isLoading ? "0 2px 8px rgba(37,99,235,0.3)" : "none" }}
              >
                <Send style={{ width: "1rem", height: "1rem" }} />
              </button>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.375rem", textAlign: "center" }}>
              Powered by AI · Enterで送信
            </p>
          </div>
        </div>
      )}

      {/* ===== TOGGLE BUTTON ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="チャットを開く"
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "9999px",
          background: isOpen ? "#374151" : "linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.625rem",
          boxShadow: "0 4px 24px rgba(37,99,235,0.6), 0 2px 8px rgba(0,0,0,0.25), 0 0 0 3px white, 0 0 0 5px rgba(37,99,235,0.3)",
          transition: "all 0.2s",
          position: "relative",
        }}
      >
        {isOpen ? <X style={{ width: "1.5rem", height: "1.5rem" }} /> : <AIMascot size={37} animated={true} />}
        {!isOpen && unreadCount > 0 && (
          <span style={{ position: "absolute", top: "-0.25rem", right: "-0.25rem", minWidth: "1.25rem", height: "1.25rem", background: "#ef4444", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", padding: "0 0.25rem" }}>
            <span style={{ color: "white", fontSize: "0.65rem", fontWeight: 700 }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>
    </div>
  );
}
