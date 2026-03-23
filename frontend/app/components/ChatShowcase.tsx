"use client";

import { useState, useEffect } from "react";

// ── Flow steps ────────────────────────────────
const FLOW_STEPS = ["相談", "見積", "承認", "署名", "締結"];

const STEP_LABEL: Record<number, string> = {
  0: "相談中",
  1: "見積提出",
  2: "承認済み",
  3: "署名中",
  4: "締結完了",
};

// ── Chat script ───────────────────────────────
type MsgEntry    = { kind: "msg";    sender: "owner"|"contractor"; name: string; avatar: string; message: string; time: string; isFile?: boolean; step: number };
type SystemEntry = { kind: "system"; message: string; step: number };
type SignedEntry = { kind: "signed"; step: number };
type ChatEntry = MsgEntry | SystemEntry | SignedEntry;

const SCRIPT: ChatEntry[] = [
  { kind: "msg",    sender: "owner",      name: "田中オーナー", avatar: "🏠", message: "外壁塗装の見積もりをお願いします。3階建てRC造です。",  time: "14:30", step: 0 },
  { kind: "msg",    sender: "contractor", name: "山田塗装",     avatar: "🔨", message: "承知しました！面積はどのくらいでしょうか？",           time: "14:32", step: 0 },
  { kind: "msg",    sender: "owner",      name: "田中オーナー", avatar: "🏠", message: "延床250㎡ほどです。外壁の剥離が気になっています。",    time: "14:35", step: 0 },
  { kind: "msg",    sender: "contractor", name: "山田塗装",     avatar: "🔨", message: "📎 見積書.pdf を送りました",                          time: "15:47", isFile: true, step: 1 },
  { kind: "system", message: "📄 見積書が届きました", step: 1 },
  { kind: "msg",    sender: "owner",      name: "田中オーナー", avatar: "🏠", message: "¥580,000ですね。承認します！",                         time: "16:02", step: 2 },
  { kind: "system", message: "✅ 見積書が承認されました — 電子契約へ進みます", step: 2 },
  { kind: "msg",    sender: "contractor", name: "山田塗装",     avatar: "🔨", message: "ありがとうございます。電子署名で契約しましょう ✍️",     time: "16:05", step: 3 },
  { kind: "signed", step: 4 },
];

// ── Component ─────────────────────────────────
export default function ChatShowcase() {
  const [visible, setVisible]       = useState(0);
  const [pausing, setPausing]       = useState(false);

  const currentStep = SCRIPT[Math.min(visible, SCRIPT.length - 1)]?.step ?? 0;
  const allShown    = visible >= SCRIPT.length;

  useEffect(() => {
    if (pausing) return;

    if (allShown) {
      // hold for 3s then restart
      const t = setTimeout(() => {
        setPausing(true);
        setTimeout(() => { setVisible(0); setPausing(false); }, 400);
      }, 3000);
      return () => clearTimeout(t);
    }

    const delay = visible === 0 ? 400 : 1050;
    const t = setTimeout(() => setVisible(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visible, allShown, pausing]);

  return (
    <section style={{ padding: "5rem 0", background: "#0f172a" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "3rem",
          alignItems: "center",
        }}>

          {/* ── Left copy ── */}
          <div>
            <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              CHAT &amp; CONTRACT
            </p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2rem)", color: "#fff", lineHeight: 1.35, marginBottom: "1.25rem" }}>
              チャットで相談して<br />そのまま電子契約
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.75rem" }}>
              {[
                { icon: "💬", text: "LINEのようなリアルタイムチャット",      sub: "既読・ファイル共有・写真送信がアプリ内で完結" },
                { icon: "📋", text: "見積もりから電子署名まで一気通貫",       sub: "別システムへの移動不要。チャット内で契約締結" },
                { icon: "📄", text: "印紙税¥0・PDF自動発行",                  sub: "法的に有効な電子契約書がその場でクラウド保管" },
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

            {/* Flow progress */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1rem 1.25rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.625rem", marginBottom: "0.875rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ワークフロー
              </p>
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                {FLOW_STEPS.map((label, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: i < FLOW_STEPS.length - 1 ? 1 : "none" }}>
                    {/* node + label */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                      <div style={{
                        width: "1.625rem", height: "1.625rem", borderRadius: "50%", flexShrink: 0,
                        background: i < currentStep
                          ? "rgba(37,99,235,0.5)"
                          : i === currentStep
                            ? "#2563eb"
                            : "rgba(255,255,255,0.07)",
                        border: i === currentStep
                          ? "2px solid #60a5fa"
                          : "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.5rem", fontWeight: 900,
                        color: i <= currentStep ? "white" : "rgba(255,255,255,0.2)",
                        transition: "all 0.5s ease",
                      }}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <span style={{
                        fontSize: "0.5rem",
                        color: i <= currentStep ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
                        whiteSpace: "nowrap",
                        transition: "color 0.5s",
                      }}>
                        {label}
                      </span>
                    </div>
                    {/* connector */}
                    {i < FLOW_STEPS.length - 1 && (
                      <div style={{
                        flex: 1, height: "1px",
                        background: i < currentStep ? "#2563eb" : "rgba(255,255,255,0.1)",
                        margin: "0.8rem 0.2rem 0",
                        transition: "background 0.5s ease",
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: chat window ── */}
          <div style={{
            background: "#1e293b",
            borderRadius: "1.5rem",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}>
            {/* Title bar */}
            <div style={{
              background: "#0f172a",
              padding: "0.875rem 1.25rem",
              display: "flex", alignItems: "center", gap: "0.625rem",
            }}>
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "#94a3b8", fontSize: "0.8125rem", marginLeft: "0.375rem" }}>Smart Asset チャット</span>
              {/* Status badge */}
              <span style={{
                marginLeft: "auto",
                background: currentStep === 4 ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${currentStep === 4 ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "9999px",
                padding: "0.125rem 0.625rem",
                color: currentStep === 4 ? "#4ade80" : "rgba(255,255,255,0.6)",
                fontSize: "0.6875rem", fontWeight: 700,
                transition: "all 0.4s",
              }}>
                {STEP_LABEL[currentStep]}
              </span>
            </div>

            {/* Messages */}
            <div style={{
              padding: "1.25rem",
              minHeight: "360px",
              display: "flex", flexDirection: "column", gap: "0.875rem",
            }}>
              {SCRIPT.slice(0, visible).map((entry, i) => {
                /* system message */
                if (entry.kind === "system") {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "9999px",
                        padding: "0.3rem 0.875rem",
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "0.6875rem", fontWeight: 600,
                      }}>
                        {entry.message}
                      </div>
                    </div>
                  );
                }

                /* signed completion card */
                if (entry.kind === "signed") {
                  return (
                    <div key={i} style={{
                      background: "linear-gradient(135deg, rgba(22,163,74,0.18), rgba(5,150,105,0.12))",
                      border: "1px solid rgba(74,222,128,0.3)",
                      borderRadius: "1rem",
                      padding: "1rem 1.25rem",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>🎉</div>
                      <div style={{ color: "#4ade80", fontWeight: 900, fontSize: "1rem", marginBottom: "0.25rem" }}>
                        契約締結完了
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6875rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                        印紙代 ¥0 · PDF自動発行 · クラウド保管済み
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <span style={{
                          background: "rgba(74,222,128,0.12)",
                          border: "1px solid rgba(74,222,128,0.3)",
                          borderRadius: "9999px",
                          color: "#4ade80", fontSize: "0.625rem", fontWeight: 700,
                          padding: "0.2rem 0.625rem",
                        }}>
                          ✓ オーナー署名
                        </span>
                        <span style={{
                          background: "rgba(74,222,128,0.12)",
                          border: "1px solid rgba(74,222,128,0.3)",
                          borderRadius: "9999px",
                          color: "#4ade80", fontSize: "0.625rem", fontWeight: 700,
                          padding: "0.2rem 0.625rem",
                        }}>
                          ✓ 業者署名
                        </span>
                      </div>
                    </div>
                  );
                }

                /* normal chat bubble */
                const isOwner = entry.sender === "owner";
                return (
                  <div key={i} style={{
                    display: "flex",
                    flexDirection: isOwner ? "row-reverse" : "row",
                    gap: "0.625rem",
                    alignItems: "flex-end",
                  }}>
                    <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{entry.avatar}</span>
                    <div style={{ maxWidth: "72%" }}>
                      <p style={{
                        fontSize: "0.6875rem", color: "#64748b", marginBottom: "0.25rem",
                        textAlign: isOwner ? "right" : "left",
                      }}>
                        {entry.name}
                      </p>
                      <div style={{
                        background: isOwner ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#334155",
                        color: "#fff",
                        padding: "0.625rem 0.875rem",
                        borderRadius: isOwner ? "1rem 0.25rem 1rem 1rem" : "0.25rem 1rem 1rem 1rem",
                        fontSize: "0.8125rem",
                        lineHeight: 1.55,
                        whiteSpace: "pre-line",
                      }}>
                        {entry.isFile ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span>📄</span>
                            <span style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                              {entry.message.replace("📎 ", "")}
                            </span>
                          </span>
                        ) : entry.message}
                      </div>
                      <p style={{
                        fontSize: "0.6rem", color: "#475569", marginTop: "0.25rem",
                        textAlign: isOwner ? "right" : "left",
                      }}>
                        {entry.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {!allShown && visible > 0 && !pausing && (
                <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                  <span style={{ fontSize: "1.375rem" }}>🔨</span>
                  <div style={{
                    background: "#334155",
                    borderRadius: "0.25rem 1rem 1rem 1rem",
                    padding: "0.5rem 0.75rem",
                    display: "flex", gap: "0.25rem", alignItems: "center",
                  }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "#64748b",
                        opacity: (j * 333 % 1000) / 1000 + 0.3,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div style={{
              background: "#0f172a",
              padding: "0.875rem 1.25rem",
              display: "flex", gap: "0.625rem", alignItems: "center",
            }}>
              <div style={{
                flex: 1, background: "#1e293b", borderRadius: "9999px",
                padding: "0.5rem 1rem", color: "#475569", fontSize: "0.8125rem",
              }}>
                メッセージを入力…
              </div>
              <div style={{
                width: "2rem", height: "2rem",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.875rem",
              }}>
                ➤
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
