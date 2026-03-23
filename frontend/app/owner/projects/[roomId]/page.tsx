"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ElectronicSignModal from "@/components/ElectronicSignModal";
import {
  Send, Paperclip, ArrowLeft, Loader2, CheckCircle,
  FileText, User, Wrench, AlertTriangle, X, Camera
} from "lucide-react";

// ─── Types ────────────────────────────────────────────
interface Message {
  id: string;
  sender_id: string;
  sender_role: "owner" | "contractor";
  message_type: "text" | "file" | "estimate" | "contract" | "photo" | "system";
  content?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface ProjectRoom {
  id: string;
  status: string;
  property_address: string;
  contractor_company_name: string;
  property_id: string;
  owner_id: string;
  contractor_id: string;
  updated_at: string;
}

interface ProjectPhoto {
  id: string;
  photo_type: "before" | "progress" | "after" | "completion";
  file_url: string;
  caption?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  chatting:            { label: "チャット中",       color: "#1d4ed8", bg: "#eff6ff" },
  estimate_uploaded:   { label: "見積書届いた",      color: "#d97706", bg: "#fffbeb" },
  estimate_approved:   { label: "見積承認済み",      color: "#059669", bg: "#ecfdf5" },
  contract_signed:     { label: "契約締結",         color: "#7c3aed", bg: "#f5f3ff" },
  in_progress:         { label: "工事中",           color: "#0891b2", bg: "#ecfeff" },
  completed_requested: { label: "完了報告あり",      color: "#ea580c", bg: "#fff7ed" },
  completed:           { label: "完了確認済み",      color: "#16a34a", bg: "#f0fdf4" },
  invoiced:            { label: "請求書届いた",      color: "#db2777", bg: "#fdf2f8" },
  invoice_approved:    { label: "支払い完了",        color: "#16a34a", bg: "#f0fdf4" },
  closed:              { label: "クローズ",          color: "#6b7280", bg: "#f9fafb" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";

// ─── Component ─────────────────────────────────────────
export default function OwnerProjectPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<ProjectRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [photoTab, setPhotoTab] = useState<"before" | "progress" | "after">("after");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [approving, setApproving] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [existingContractId, setExistingContractId] = useState<string | undefined>(undefined);
  const [contractAmount, setContractAmount] = useState<number>(0);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      if (!uid) { router.push("/"); return; }
      setUserId(uid);
    });
  }, [router]);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    if (!roomId) return;
    const res = await fetch(`/api/project-photos?roomId=${roomId}`);
    if (res.ok) setPhotos(await res.json());
  }, [roomId]);

  // Fetch room + messages + photos
  const fetchAll = useCallback(async () => {
    if (!roomId) return;
    const [roomRes, msgRes] = await Promise.all([
      supabase.from("project_rooms").select("*").eq("id", roomId).single(),
      fetch(`${API}/api/messages?roomId=${roomId}`),
    ]);

    if (roomRes.data) setRoom(roomRes.data as ProjectRoom);

    if (msgRes.ok) {
      const msgs = await msgRes.json();
      const msgList = Array.isArray(msgs) ? msgs : [];
      setMessages(msgList);
      // Look for invoice file URL in messages
      const invoiceMsg = [...msgList].reverse().find(
        (m: Message) => m.message_type === "file" && m.content?.includes("請求書")
      );
      if (invoiceMsg?.file_url) setInvoiceUrl(invoiceMsg.file_url);
    }
    await fetchPhotos();
    setLoading(false);
  }, [roomId, fetchPhotos]);

  useEffect(() => {
    if (!userId || !roomId) return;
    fetchAll();

    // Supabase Real-time: 新着メッセージをリアルタイムで受信
    const channel = supabase
      .channel(`owner-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev =>
            prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "project_rooms", filter: `id=eq.${roomId}` },
        (payload) => { setRoom(payload.new as ProjectRoom); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, roomId, fetchAll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send text message ──
  const sendMessage = async () => {
    if (!text.trim() || !userId || sending) return;
    setSending(true);
    const payload = { room_id: roomId, sender_id: userId, sender_role: "owner", message_type: "text", content: text.trim() };
    setText("");
    try {
      const res = await fetch(`${API}/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { const msg = await res.json(); setMessages(prev => [...prev, msg]); }
    } finally { setSending(false); }
  };

  // ── Upload file ──
  const uploadFile = async () => {
    if (!selectedFile || !userId || uploading) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("roomId", roomId);
      fd.append("fileType", "other");
      const upRes = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
      if (!upRes.ok) { alert("アップロードに失敗しました"); return; }
      const { url, name } = await upRes.json();

      const msgRes = await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "owner", message_type: "file", content: name, file_url: url, file_name: name }),
      });
      if (msgRes.ok) { const msg = await msgRes.json(); setMessages(prev => [...prev, msg]); }
      setSelectedFile(null);
    } finally { setUploading(false); }
  };

  // ── Approve estimate ──
  const approveEstimate = async () => {
    if (!userId || approving) return;
    setApproving(true);
    try {
      await fetch(`${API}/api/project-rooms`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: "estimate_approved" }),
      });
      await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "owner", message_type: "system", content: "オーナーが見積書を承認しました。" }),
      });
      await fetchAll();
    } finally { setApproving(false); }
  };

  // ── Approve completion ──
  const approveCompletion = async () => {
    if (!userId || approving) return;
    if (!confirm("工事の完了を確認しましたか？")) return;
    setApproving(true);
    try {
      await fetch(`${API}/api/project-rooms`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: "completed" }),
      });
      await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "owner", message_type: "system", content: "オーナーが工事完了を確認しました。請求書をアップロードしてください。" }),
      });
      await fetchAll();
    } finally { setApproving(false); }
  };

  // ── Approve invoice → closed ──
  const approveInvoice = async () => {
    if (!userId || approving) return;
    if (!confirm("請求書を確認しました。支払い完了を記録しますか？")) return;
    setApproving(true);
    try {
      // First set invoice_approved, then closed
      await fetch(`${API}/api/project-rooms`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: "closed" }),
      });
      await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "owner", message_type: "system", content: "支払いが完了しました。案件がクローズされました。" }),
      });
      await fetchAll();
    } finally { setApproving(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#16a34a" }} />
    </div>
  );

  const statusInfo = STATUS_LABELS[room?.status ?? "chatting"] ?? STATUS_LABELS.chatting;
  const showPhotoGallery = ["completed_requested", "completed", "invoiced", "invoice_approved", "closed"].includes(room?.status ?? "") && photos.length > 0;

  return (
    <>
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d4f2e 0%, #15803d 60%, #16a34a 100%)", padding: "1rem 1.25rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Link href="/owner/mypage" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.15)", color: "white", textDecoration: "none" }}>
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>案件進行チャット</p>
              <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "white", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {room?.contractor_company_name || "施工会社"} との案件
              </h1>
              {room?.property_address && (
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.property_address}</p>
              )}
            </div>
            <div style={{ flexShrink: 0, background: statusInfo.bg, color: statusInfo.color, borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${statusInfo.color}30` }}>
              {statusInfo.label}
            </div>
          </div>

          {/* Action bar based on status */}
          {room?.status === "estimate_uploaded" && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={approveEstimate} disabled={approving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "#16a34a", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.625rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                <CheckCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                {approving ? "処理中..." : "見積書を承認する"}
              </button>
            </div>
          )}
          {room?.status === "estimate_approved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>契約金額：</span>
                <input
                  type="number"
                  value={contractAmount || ""}
                  onChange={e => setContractAmount(Number(e.target.value))}
                  placeholder="例: 500000"
                  style={{ flex: 1, minWidth: 0, borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white", padding: "0.3rem 0.625rem", fontSize: "0.75rem", outline: "none" }}
                />
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>円</span>
              </div>
              <button
                onClick={() => setShowSignModal(true)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "#7c3aed", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.625rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                ✍️ 電子署名して契約する
              </button>
            </div>
          )}
          {room?.status === "completed_requested" && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={approveCompletion} disabled={approving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "#16a34a", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.625rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                <CheckCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                {approving ? "処理中..." : "工事完了を確認する"}
              </button>
            </div>
          )}
          {room?.status === "invoiced" && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {invoiceUrl && (
                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.625rem 1rem", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.875rem", textDecoration: "none" }}>
                  <FileText style={{ width: "0.875rem", height: "0.875rem" }} />請求書を確認
                </a>
              )}
              <button onClick={approveInvoice} disabled={approving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "#db2777", color: "white", fontWeight: 700, borderRadius: "0.75rem", padding: "0.625rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                <CheckCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                {approving ? "処理中..." : "支払い完了を記録する"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase B: Status banners */}
      {room?.status === "in_progress" && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>✅</span>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#713f12", fontWeight: 600, margin: 0 }}>契約が成立しました。着手金のお支払いをお願いします。</p>
              <p style={{ fontSize: "0.75rem", color: "#92400e", margin: "0.125rem 0 0" }}>お支払い方法は施工会社とご相談ください。振込先を確認してから、お支払いをお願いします。</p>
            </div>
          </div>
        </div>
      )}
      {(room?.status === "closed") && (
        <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>🎉</span>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#14532d", fontWeight: 600, margin: 0 }}>工事が完了しました。最終金のお支払いをお願いします。</p>
              <p style={{ fontSize: "0.75rem", color: "#166534", margin: "0.125rem 0 0" }}>請求書をご確認の上、指定口座へお振込みください。</p>
            </div>
          </div>
        </div>
      )}
      {room?.status === "invoiced" && (
        <div style={{ background: "#fdf2f8", borderBottom: "1px solid #fbcfe8" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>📄</span>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#831843", fontWeight: 600, margin: 0 }}>請求書が届きました</p>
              <p style={{ fontSize: "0.75rem", color: "#9d174d", margin: "0.125rem 0 0" }}>内容を確認の上、施工会社へ最終金をお支払いください。</p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {!["in_progress", "completed_requested", "completed", "invoiced", "invoice_approved", "closed"].includes(room?.status ?? "") && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.625rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <AlertTriangle style={{ width: "0.875rem", height: "0.875rem", color: "#d97706", flexShrink: 0, marginTop: "0.125rem" }} />
            <p style={{ fontSize: "0.75rem", color: "#713f12", lineHeight: 1.6, margin: 0 }}>
              工事代金は<strong>着工金30%→中間金→完成払い</strong>の分割を推奨します。全額前払いは絶対に避けてください。
            </p>
          </div>
        </div>
      )}

      {/* Photo gallery when completed_requested and later */}
      {showPhotoGallery && (
        <div style={{ maxWidth: "52rem", width: "100%", margin: "0 auto", padding: "0.75rem 1.25rem 0" }}>
          <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "0.625rem 0.875rem", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "0.375rem", alignItems: "center" }}>
              <Camera style={{ width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", flex: 1 }}>工事写真</span>
              {(["before", "progress", "after"] as const).map(t => {
                const count = photos.filter(p => p.photo_type === t).length;
                return (
                  <button key={t} onClick={() => setPhotoTab(t)} style={{ borderRadius: "9999px", padding: "0.125rem 0.625rem", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", border: "1px solid", background: photoTab === t ? "#1d4ed8" : "white", color: photoTab === t ? "white" : "#374151", borderColor: photoTab === t ? "#1d4ed8" : "#e5e7eb" }}>
                    {t === "before" ? "着工前" : t === "progress" ? "工事中" : "完工後"} ({count})
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "0.625rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem", maxHeight: "180px", overflowY: "auto" }}>
              {photos.filter(p => p.photo_type === photoTab).map(photo => (
                <a key={photo.id} href={photo.file_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", aspectRatio: "1", background: "#f3f4f6", borderRadius: "0.375rem", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.file_url} alt="工事写真" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
              ))}
              {photos.filter(p => p.photo_type === photoTab).length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "1.25rem", color: "#9ca3af", fontSize: "0.75rem" }}>
                  {photoTab === "before" ? "着工前" : photoTab === "progress" ? "工事中" : "完工後"}の写真はまだありません
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: "52rem", width: "100%", margin: "0 auto", padding: "1rem 1.25rem", overflowY: "auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
            <Wrench style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <p style={{ fontSize: "0.875rem" }}>まだメッセージはありません。<br />最初のメッセージを送りましょう。</p>
          </div>
        )}

        {messages.map(msg => {
          const isOwner = msg.sender_role === "owner";
          const isSystem = msg.message_type === "system";

          if (isSystem) return (
            <div key={msg.id} style={{ textAlign: "center", margin: "0.875rem 0" }}>
              <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}>
                {msg.content}
              </span>
            </div>
          );

          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isOwner ? "flex-end" : "flex-start", marginBottom: "0.875rem" }}>
              {!isOwner && (
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "0.5rem", marginTop: "auto" }}>
                  <Wrench style={{ width: "1rem", height: "1rem", color: "#2563eb" }} />
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                {!isOwner && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.25rem" }}>施工会社</p>}
                <div style={{
                  background: isOwner ? "linear-gradient(135deg, #15803d, #16a34a)" : "white",
                  color: isOwner ? "white" : "#111827",
                  borderRadius: isOwner ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  padding: "0.75rem 1rem",
                  border: isOwner ? "none" : "1px solid #e5e7eb",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  wordBreak: "break-word",
                }}>
                  {msg.message_type === "photo" ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isOwner ? "white" : "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}>
                      <Camera style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                      <span style={{ textDecoration: "underline" }}>📸 {msg.file_name || "工事写真"}</span>
                    </a>
                  ) : (msg.message_type === "file" || msg.message_type === "estimate" || msg.message_type === "contract") ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isOwner ? "white" : "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}>
                      <FileText style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                      <span style={{ textDecoration: "underline" }}>{msg.file_name || msg.content || "ファイル"}</span>
                    </a>
                  ) : (
                    <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                  )}
                </div>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.25rem", textAlign: isOwner ? "right" : "left" }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
              {isOwner && (
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "0.5rem", marginTop: "auto" }}>
                  <User style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* File preview */}
      {selectedFile && (
        <div style={{ background: "white", borderTop: "1px solid #e5e7eb", maxWidth: "52rem", width: "100%", margin: "0 auto", padding: "0.75rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileText style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280", flexShrink: 0 }} />
            <span style={{ fontSize: "0.875rem", color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.25rem" }}>
              <X style={{ width: "1rem", height: "1rem" }} />
            </button>
            <button onClick={uploadFile} disabled={uploading} style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
              {uploading ? "送信中..." : "送信"}
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{ background: "white", borderTop: "1px solid #e5e7eb", position: "sticky", bottom: 0 }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <input type="file" ref={fileRef} style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
          <button onClick={() => fileRef.current?.click()} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "0.625rem", padding: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Paperclip style={{ width: "1.125rem", height: "1.125rem", color: "#6b7280" }} />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="メッセージを入力..."
            style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "0.875rem", padding: "0.75rem 1rem", fontSize: "0.9375rem", outline: "none", background: "#f9fafb" }}
          />
          <button onClick={sendMessage} disabled={!text.trim() || sending} style={{ background: text.trim() ? "#16a34a" : "#d1fae5", border: "none", borderRadius: "50%", width: "2.75rem", height: "2.75rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0, transition: "background 0.2s" }}>
            {sending ? <Loader2 className="animate-spin" style={{ width: "1.125rem", height: "1.125rem", color: "white" }} /> : <Send style={{ width: "1.125rem", height: "1.125rem", color: "white" }} />}
          </button>
        </div>
      </div>

    </div>

    {/* Electronic Sign Modal */}
    {showSignModal && room && (
      <ElectronicSignModal
        role="owner"
        contractData={{
          roomId,
          contractId: existingContractId,
          propertyAddress: room.property_address || "",
          contractorName: room.contractor_company_name || "",
          contractAmount: contractAmount,
          advanceAmount: Math.round(contractAmount * 0.3),
          finalAmount: contractAmount - Math.round(contractAmount * 0.3),
          terms: "見積書記載の条件に基づく",
        }}
        onClose={() => setShowSignModal(false)}
        onSigned={async (contractId, _pdfUrl) => {
          setExistingContractId(contractId);
          setShowSignModal(false);
          await fetchAll();
        }}
      />
    )}
    </>
  );
}
