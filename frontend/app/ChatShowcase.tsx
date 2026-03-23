"use client";

import { useState, useEffect } from "react";

const chatDemo = [
  { sender: "owner",      avatar: "🏠", name: "田中オーナー",   message: "外壁塗装の見積もりをお願いします。3階建て RC造です。", time: "14:30" },
  { sender: "contractor", avatar: "🔨", name: "山田塗装",       message: "承知しました！詳細をお聞かせください。面積はどのくらいですか？", time: "14:32" },
  { sender: "owner",      avatar: "🏠", name: "田中オーナー",   message: "延床250㎡ほどです。外壁の剥離が気になっています。", time: "14:35" },
  { sender: "contractor", avatar: "🔨", name: "山田塗装",       message: "📎 現地調査レポートをアップロードしました", time: "15:45", isFile: true },
  { sender: "contractor", avatar: "🔨", name: "山田塗装",       message: "見積もり金額：¥580,000（税込）\n工期：5〜7日間\n保証：10年", time: "15:47" },
  { sender: "owner",      avatar: "🏠", name: "田中オーナー",   message: "ありがとうございます！電子契約で進めましょう。", time: "15:50" },
];

export default function ChatShowcase() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => (v < chatDemo.length ? v + 1 : v));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ padding: "5rem 0", background: "#0f172a" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>

          {/* Left: copy */}
          <div>
            <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              REAL-TIME CHAT
            </p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2rem)", color: "#fff", lineHeight: 1.35, marginBottom: "1.25rem" }}>
              LINEのように<br />チャットで即対応
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { icon: "💬", text: "リアルタイムメッセージ",     sub: "既読・未読も一目でわかる" },
                { icon: "📎", text: "ファイル・写真を即共有",      sub: "現地調査報告もアプリ内で完結" },
                { icon: "📋", text: "見積もりから契約まで一本化",  sub: "チャット内で電子契約を締結" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.125rem" }}>{f.text}</p>
                    <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: chat demo */}
          <div style={{ background: "#1e293b", borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
            {/* Top bar */}
            <div style={{ background: "#0f172a", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ marginLeft: "0.5rem", color: "#94a3b8", fontSize: "0.8125rem" }}>Smart Asset チャット</span>
            </div>

            {/* Messages */}
            <div style={{ padding: "1.25rem", minHeight: "320px", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {chatDemo.slice(0, visible).map((msg, i) => {
                const isOwner = msg.sender === "owner";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: isOwner ? "row-reverse" : "row", gap: "0.625rem", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{msg.avatar}</span>
                    <div style={{ maxWidth: "72%" }}>
                      <p style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: "0.25rem", textAlign: isOwner ? "right" : "left" }}>{msg.name}</p>
                      <div style={{
                        background: isOwner ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#334155",
                        color: "#fff",
                        padding: "0.625rem 0.875rem",
                        borderRadius: isOwner ? "1rem 0.25rem 1rem 1rem" : "0.25rem 1rem 1rem 1rem",
                        fontSize: "0.8125rem",
                        lineHeight: 1.55,
                        whiteSpace: "pre-line",
                      }}>
                        {msg.isFile ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span>📄</span><span style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>{msg.message.replace("📎 ", "")}</span>
                          </span>
                        ) : msg.message}
                      </div>
                      <p style={{ fontSize: "0.6rem", color: "#475569", marginTop: "0.25rem", textAlign: isOwner ? "right" : "left" }}>{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input bar */}
            <div style={{ background: "#0f172a", padding: "0.875rem 1.25rem", display: "flex", gap: "0.625rem", alignItems: "center" }}>
              <div style={{ flex: 1, background: "#1e293b", borderRadius: "9999px", padding: "0.5rem 1rem", color: "#475569", fontSize: "0.8125rem" }}>
                メッセージを入力…
              </div>
              <div style={{ width: "2rem", height: "2rem", background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem" }}>➤</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
