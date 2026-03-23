"use client";
import { useState } from "react";

interface ContractData {
  roomId: string;
  contractId?: string;
  propertyAddress: string;
  contractorName: string;
  contractAmount: number;
  advanceAmount: number;
  finalAmount: number;
  terms: string;
  workDescription?: string;
}

interface ElectronicSignModalProps {
  role: "owner" | "contractor";
  contractData: ContractData;
  onClose: () => void;
  onSigned: (contractId: string, pdfUrl: string) => void;
}

export default function ElectronicSignModal({
  role,
  contractData,
  onClose,
  onSigned,
}: ElectronicSignModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setScrolledToBottom(true);
    }
  };

  const formatAmount = (n: number) =>
    n.toLocaleString("ja-JP", { style: "currency", currency: "JPY" });

  const handleSign = async () => {
    if (!agreed) return;
    setLoading(true);
    setError("");
    try {
      // Generate document hash client-side
      const contractContent = JSON.stringify(contractData);
      const encoder = new TextEncoder();
      const data = encoder.encode(contractContent);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const documentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const res = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: contractData.roomId,
          contractId: contractData.contractId,
          role,
          documentHash,
          contractAmount: contractData.contractAmount,
          advanceAmount: contractData.advanceAmount,
          finalAmount: contractData.finalAmount,
          terms: contractData.terms,
          propertyAddress: contractData.propertyAddress,
          contractorName: contractData.contractorName,
          workDescription: contractData.workDescription,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "署名に失敗しました");
      onSigned(json.contractId, json.pdfUrl || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "1.1rem" }}>
              工事請負契約書
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              電子署名 — {role === "owner" ? "発注者（オーナー）" : "受注者（施工会社）"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "white",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Contract content (scrollable) */}
        <div
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            fontSize: "0.875rem",
            lineHeight: 1.8,
            color: "#1e293b",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            工事請負契約書
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>■ 工事物件</div>
            <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
              {contractData.propertyAddress}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>■ 受注者（施工会社）</div>
            <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
              {contractData.contractorName}
            </div>
          </div>

          {contractData.workDescription && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>■ 工事内容</div>
              <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
                {contractData.workDescription}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>■ 契約金額</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>契約金額（税込）</td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 600 }}>
                    {formatAmount(contractData.contractAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>着手金</td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>
                    {formatAmount(contractData.advanceAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>最終金</td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>
                    {formatAmount(contractData.finalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {contractData.terms && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>■ 特約事項・工事条件</div>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {contractData.terms}
              </div>
            </div>
          )}

          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fbbf24",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>■ Smart Asset AI 利用規約への同意</div>
            <div style={{ color: "#78350f", fontSize: "0.8rem" }}>
              本契約はSmart Asset AIプラットフォームを通じて締結されます。
              電子署名により、双方が契約内容に合意したものとみなします。
              署名日時およびIPアドレスが記録され、契約書PDFに記載されます。
              <br />
              <a
                href="/terms"
                target="_blank"
                style={{ color: "#b45309", textDecoration: "underline" }}
              >
                利用規約全文はこちら
              </a>
            </div>
          </div>

          {/* Bottom spacer to encourage scrolling */}
          <div style={{ height: "2rem" }} />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          {!scrolledToBottom && (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.8rem",
                marginBottom: "0.75rem",
              }}
            >
              ↓ 契約書を最後までスクロールしてください
            </div>
          )}

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              cursor: scrolledToBottom ? "pointer" : "not-allowed",
              opacity: scrolledToBottom ? 1 : 0.4,
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              disabled={!scrolledToBottom}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: "1rem", height: "1rem" }}
            />
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>
              上記の契約内容および利用規約に同意します
            </span>
          </label>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={!agreed || loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              background:
                agreed && !loading
                  ? "linear-gradient(135deg, #1d4ed8, #1e40af)"
                  : "#94a3b8",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: agreed && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {loading ? "署名処理中..." : "✍️ 電子署名して契約を締結する"}
          </button>
          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
            署名日時とIPアドレスが記録されます
          </div>
        </div>
      </div>
    </div>
  );
}
