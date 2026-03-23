"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Sender = "owner" | "contractor" | "system";

interface Msg {
  id: number;
  sender: Sender;
  text: string;
  time: string;
  isFile?: boolean;
  isEstimate?: boolean;
  estimateAmount?: number;
  approved?: boolean;
}

const NOW = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const INITIAL: Msg[] = [
  { id: 1,  sender: "system",     text: "田中オーナーさんが案件を掲載しました",            time: "14:00" },
  { id: 2,  sender: "owner",      text: "外壁塗装の見積もりをお願いします。3階建てRC造、延床250㎡ほどです。外壁の剥離が気になっています。", time: "14:30" },
  { id: 3,  sender: "contractor", text: "承知しました！詳細をありがとうございます。来週火曜10時に現地調査に伺えますでしょうか？", time: "14:32" },
  { id: 4,  sender: "owner",      text: "火曜10時で大丈夫です。よろしくお願いします。",     time: "14:35" },
  { id: 5,  sender: "system",     text: "山田塗装が現地調査を完了しました",                 time: "15:40" },
  { id: 6,  sender: "contractor", text: "現地調査ありがとうございました。外壁の剥離箇所は約15㎡で、早めの対応が推奨されます。",  time: "15:45" },
  { id: 7,  sender: "contractor", text: "📎 現地調査レポート.pdf",                         time: "15:46", isFile: true },
  { id: 8,  sender: "contractor", text: "見積書をお送りします。",                           time: "15:47", isEstimate: true, estimateAmount: 580000 },
];

const AUTO_REPLIES = [
  "ご連絡ありがとうございます！すぐに確認いたします。",
  "承知しました。対応可能です！",
  "詳細はチャットでいつでもお聞きください。",
  "工期・保証内容など、ご不明点があればお気軽にどうぞ。",
  "ありがとうございます。引き続きよろしくお願いします！",
];

let autoIdx = 0;

export default function DemoChat() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [role, setRole] = useState<"owner" | "contractor">("owner");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const mine: Msg = { id: Date.now(), sender: role, text: content, time: NOW() };
    setMessages(prev => [...prev, mine]);
    setInput("");

    // auto-reply from the other side
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Msg = {
        id: Date.now() + 1,
        sender: role === "owner" ? "contractor" : "owner",
        text: AUTO_REPLIES[autoIdx % AUTO_REPLIES.length],
        time: NOW(),
      };
      autoIdx++;
      setMessages(prev => [...prev, reply]);
    }, 1200 + Math.random() * 800);
  }

  function approveEstimate(id: number, amount: number) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m));
    const sys: Msg = { id: Date.now(), sender: "system", text: `見積書（¥${amount.toLocaleString()}）が承認されました ✅`, time: NOW() };
    setMessages(prev => [...prev, sys]);
  }

  function sendFile() {
    const file: Msg = { id: Date.now(), sender: role, text: "📎 見積書_サンプル.pdf", time: NOW(), isFile: true };
    setMessages(prev => [...prev, file]);
  }

  const isOwner = role === "owner";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column" }}>

      {/* Top banner */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
        padding: "0.75rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "0.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem" }}>← ホーム</Link>
          <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.75rem", padding: "0.2rem 0.75rem", borderRadius: "9999px", fontWeight: 700 }}>
            🎮 デモモード — データは保存されません
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem" }}>視点切替：</span>
          {(["owner","contractor"] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "0.3rem 0.875rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.8125rem",
              background: role === r ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
              border: role === r ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer",
            }}>
              {r === "owner" ? "🏠 オーナー" : "🔨 施工会社"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "720px", width: "100%", margin: "0 auto", padding: "0" }}>

        {/* Chat header */}
        <div style={{
          background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem",
        }}>
          <div style={{
            width: "2.5rem", height: "2.5rem", borderRadius: "50%",
            background: isOwner ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "linear-gradient(135deg,#065f46,#16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem",
          }}>
            {isOwner ? "🔨" : "🏠"}
          </div>
          <div>
            <p style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "0.9375rem" }}>
              {isOwner ? "山田塗装工業" : "田中オーナー"}
            </p>
            <p style={{ color: "#22c55e", fontSize: "0.75rem", fontWeight: 600 }}>
              ● オンライン
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <span style={{
              background: "rgba(37,99,235,0.2)", color: "#60a5fa",
              fontSize: "0.6875rem", padding: "0.25rem 0.75rem",
              borderRadius: "9999px", fontWeight: 700,
            }}>外壁塗装工事</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "1.25rem",
          display: "flex", flexDirection: "column", gap: "1rem",
          minHeight: "400px", maxHeight: "calc(100vh - 280px)",
          background: "#0f172a",
        }}>
          {messages.map(msg => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)", fontSize: "0.6875rem",
                    padding: "0.3rem 1rem", borderRadius: "9999px", fontWeight: 600,
                  }}>
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMine = msg.sender === role;
            return (
              <div key={msg.id} style={{
                display: "flex", flexDirection: isMine ? "row-reverse" : "row",
                gap: "0.625rem", alignItems: "flex-end",
              }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "50%", flexShrink: 0,
                  background: msg.sender === "owner"
                    ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                    : "linear-gradient(135deg,#065f46,#16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.875rem",
                }}>
                  {msg.sender === "owner" ? "🏠" : "🔨"}
                </div>

                <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {/* Estimate card */}
                  {msg.isEstimate && msg.estimateAmount && (
                    <div style={{
                      background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "1rem", padding: "1rem", minWidth: "220px",
                    }}>
                      <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.6875rem", marginBottom: "0.5rem" }}>
                        📋 見積書
                      </p>
                      <p style={{ color: "#fff", fontWeight: 900, fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                        ¥{msg.estimateAmount.toLocaleString()}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.6875rem", marginBottom: "0.75rem" }}>
                        税込 / 工期5〜7日 / 10年保証
                      </p>
                      {!msg.approved ? (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => approveEstimate(msg.id, msg.estimateAmount!)}
                            style={{
                              flex: 1, background: "linear-gradient(135deg,#16a34a,#15803d)",
                              color: "#fff", border: "none", borderRadius: "0.625rem",
                              padding: "0.5rem", fontWeight: 700, fontSize: "0.75rem",
                              cursor: "pointer",
                            }}>
                            ✅ 承認する
                          </button>
                          <button style={{
                            flex: 1, background: "rgba(255,255,255,0.08)",
                            color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "0.625rem", padding: "0.5rem",
                            fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                          }}>
                            💬 交渉する
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                          borderRadius: "0.625rem", padding: "0.5rem",
                          color: "#4ade80", fontWeight: 700, fontSize: "0.75rem", textAlign: "center",
                        }}>
                          ✅ 承認済み — 電子契約へ進む <a href="/demo/sign" style={{ color: "#60a5fa", marginLeft: "0.25rem" }}>→</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* File card */}
                  {msg.isFile && !msg.isEstimate && (
                    <div style={{
                      background: isMine ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#1e293b",
                      borderRadius: "0.875rem",
                      padding: "0.75rem 1rem",
                      display: "flex", alignItems: "center", gap: "0.625rem",
                      border: isMine ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                      <span style={{ fontSize: "1.25rem" }}>📄</span>
                      <span style={{
                        color: "#fff", fontSize: "0.8125rem", fontWeight: 600,
                        borderBottom: "1px solid rgba(255,255,255,0.4)",
                      }}>
                        {msg.text.replace("📎 ", "")}
                      </span>
                    </div>
                  )}

                  {/* Normal text */}
                  {!msg.isFile && !msg.isEstimate && (
                    <div style={{
                      background: isMine
                        ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                        : "#1e293b",
                      color: "#fff",
                      padding: "0.75rem 1rem",
                      borderRadius: isMine ? "1.125rem 0.25rem 1.125rem 1.125rem" : "0.25rem 1.125rem 1.125rem 1.125rem",
                      fontSize: "0.9rem", lineHeight: 1.6,
                      border: isMine ? "none" : "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {msg.text}
                    </div>
                  )}

                  <span style={{
                    fontSize: "0.6rem", color: "#475569",
                    textAlign: isMine ? "right" : "left",
                  }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
              <div style={{
                width: "2rem", height: "2rem", borderRadius: "50%",
                background: isOwner
                  ? "linear-gradient(135deg,#065f46,#16a34a)"
                  : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem",
              }}>
                {isOwner ? "🔨" : "🏠"}
              </div>
              <div style={{
                background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.25rem 1rem 1rem 1rem",
                padding: "0.75rem 1rem", display: "flex", gap: "4px", alignItems: "center",
              }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#475569",
                    animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        <div style={{
          background: "#1e293b", borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "0.625rem 1.25rem",
          display: "flex", gap: "0.5rem", overflowX: "auto",
        }}>
          {[
            { label: "📋 見積もりをお願いします", msg: "見積もりをよろしくお願いします。" },
            { label: "📅 現地調査の日程確認", msg: "現地調査の日程を確認させてください。" },
            { label: "💰 価格交渉", msg: "少し価格の相談をさせていただけますか？" },
            { label: "✅ 承認します", msg: "見積もり内容を承認します。電子契約に進めましょう。" },
          ].map((q, i) => (
            <button key={i} onClick={() => send(q.msg)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", borderRadius: "9999px",
              padding: "0.375rem 0.875rem", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{
          background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "0.875rem 1.25rem",
          display: "flex", gap: "0.625rem", alignItems: "center",
        }}>
          {/* File button */}
          <button onClick={sendFile} style={{
            width: "2.5rem", height: "2.5rem", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8", fontSize: "1.1rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            📎
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="メッセージを入力…"
            style={{
              flex: 1, background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.5rem", padding: "0.625rem 1.125rem",
              color: "#e2e8f0", fontSize: "0.9375rem", outline: "none",
            }}
          />

          <button
            onClick={() => send()}
            disabled={!input.trim()}
            style={{
              width: "2.5rem", height: "2.5rem", borderRadius: "50%",
              background: input.trim()
                ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                : "rgba(255,255,255,0.07)",
              border: "none", color: "#fff",
              fontSize: "1rem", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}>
            ➤
          </button>
        </div>

        {/* CTA footer */}
        <div style={{
          background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
          padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap",
        }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: "0.9375rem" }}>
              実際の業者とやり取りを始めよう
            </p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem" }}>
              登録無料・AI診断無料・オーナーは永久無料
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="/demo/sign" style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              padding: "0.625rem 1.25rem", borderRadius: "0.75rem",
              textDecoration: "none", fontWeight: 700, fontSize: "0.875rem",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "inline-block",
            }}>
              ✍️ 電子署名デモ
            </a>
            <a href="/auth" style={{
              background: "linear-gradient(135deg,#fff,#e0e7ff)", color: "#1d4ed8",
              padding: "0.625rem 1.5rem", borderRadius: "0.75rem",
              textDecoration: "none", fontWeight: 800, fontSize: "0.875rem",
              display: "inline-block",
            }}>
              無料で登録する →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
