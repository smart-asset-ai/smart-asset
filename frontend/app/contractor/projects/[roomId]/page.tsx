"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ElectronicSignModal from "@/components/ElectronicSignModal";
import {
  Send, Paperclip, ArrowLeft, Loader2, CheckCircle,
  FileText, User, Wrench, Upload, X, Camera
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
  estimate_uploaded:   { label: "見積書送付済み",    color: "#d97706", bg: "#fffbeb" },
  estimate_approved:   { label: "見積承認済み",      color: "#059669", bg: "#ecfdf5" },
  contract_signed:     { label: "契約締結",         color: "#7c3aed", bg: "#f5f3ff" },
  in_progress:         { label: "工事中",           color: "#0891b2", bg: "#ecfeff" },
  completed_requested: { label: "完了報告済み",      color: "#ea580c", bg: "#fff7ed" },
  completed:           { label: "完了確認済み",      color: "#16a34a", bg: "#f0fdf4" },
  invoiced:            { label: "請求書送付済み",    color: "#db2777", bg: "#fdf2f8" },
  invoice_approved:    { label: "支払い完了",        color: "#16a34a", bg: "#f0fdf4" },
  closed:              { label: "クローズ",          color: "#6b7280", bg: "#f9fafb" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://smart-asset.ai";

// ─── Component ─────────────────────────────────────────
export default function ContractorProjectPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<ProjectRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"estimate" | "photo" | "invoice" | "other">("other");
  const [photoType, setPhotoType] = useState<"before" | "progress" | "after">("progress");
  const [actionLoading, setActionLoading] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [existingContractId, setExistingContractId] = useState<string | undefined>(undefined);
  const [contractAmount, setContractAmount] = useState<number>(0);

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
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
    await fetchPhotos();
    setLoading(false);
  }, [roomId, fetchPhotos]);

  useEffect(() => {
    if (!userId || !roomId) return;
    fetchAll();

    // Supabase Real-time: 新着メッセージをリアルタイムで受信
    const channel = supabase
      .channel(`contractor-room-${roomId}`)
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
    const payload = { room_id: roomId, sender_id: userId, sender_role: "contractor", message_type: "text", content: text.trim() };
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
      fd.append("fileType", fileType === "invoice" ? "other" : fileType);
      const upRes = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
      if (!upRes.ok) { alert("アップロードに失敗しました"); return; }
      const { url, name } = await upRes.json();

      const msgType = fileType === "estimate" ? "estimate" : fileType === "photo" ? "photo" : "file";
      const msgContent = fileType === "invoice" ? `📄 請求書: ${name}` : name;

      const msgRes = await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "contractor", message_type: msgType, content: msgContent, file_url: url, file_name: name }),
      });
      if (msgRes.ok) { const msg = await msgRes.json(); setMessages(prev => [...prev, msg]); }

      if (fileType === "estimate") {
        await fetch(`${API}/api/project-rooms`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, status: "estimate_uploaded" }),
        });
        await fetchAll();
      } else if (fileType === "photo") {
        // Save photo metadata to project_photos
        await fetch("/api/project-photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, photoType, fileUrl: url, uploaderId: userId }),
        });
        await fetchPhotos();
      } else if (fileType === "invoice") {
        // Invoice uploaded → status = invoiced
        await fetch(`${API}/api/project-rooms`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, status: "invoiced" }),
        });
        await fetch(`${API}/api/messages`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "contractor", message_type: "system", content: "請求書を送付しました。オーナーの確認をお待ちください。" }),
        });
        await fetchAll();
      }
      setSelectedFile(null);
    } finally { setUploading(false); }
  };

  // ── Report work completion ──
  const reportCompletion = async () => {
    if (!userId || actionLoading) return;
    const hasAfterPhoto = photos.some(p => p.photo_type === "after");
    if (!hasAfterPhoto) {
      alert("完工写真（完工後）を1枚以上アップロードしてから完了報告してください。");
      return;
    }
    if (!confirm("工事完了をオーナーに報告しますか？")) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/api/project-rooms`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: "completed_requested" }),
      });
      await fetch(`${API}/api/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, sender_id: userId, sender_role: "contractor", message_type: "system", content: "施工会社から工事完了の報告が届きました。工事写真をご確認の上、完了承認をお願いします。" }),
      });
      await fetchAll();
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
    </div>
  );

  const statusInfo = STATUS_LABELS[room?.status ?? "chatting"] ?? STATUS_LABELS.chatting;
  const hasAfterPhoto = photos.some(p => p.photo_type === "after");
  const canReportCompletion = room?.status === "in_progress";
  const canUploadInvoice = room?.status === "completed";

  return (
    <>
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 100%)", padding: "1rem 1.25rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Link href="/contractor/mypage" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.15)", color: "white", textDecoration: "none" }}>
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>現場管理チャット</p>
              <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "white", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {room?.property_address || "物件の案件"}
              </h1>
            </div>
            <div style={{ flexShrink: 0, background: statusInfo.bg, color: statusInfo.color, borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${statusInfo.color}30` }}>
              {statusInfo.label}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            <button
              onClick={() => { setFileType("estimate"); setTimeout(() => fileRef.current?.click(), 50); }}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
              <Upload style={{ width: "0.75rem", height: "0.75rem" }} />見積書を送る
            </button>
            {room?.status === "in_progress" && (
              <button
                onClick={() => { setFileType("photo"); setTimeout(() => fileRef.current?.click(), 50); }}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                <Camera style={{ width: "0.75rem", height: "0.75rem" }} />工事写真
              </button>
            )}
            {canReportCompletion && (
              <button
                onClick={reportCompletion}
                disabled={actionLoading}
                title={!hasAfterPhoto ? "完工後の写真を1枚以上アップロードしてください" : ""}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: hasAfterPhoto ? "#16a34a" : "rgba(255,255,255,0.2)", color: "white", border: hasAfterPhoto ? "none" : "1px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: hasAfterPhoto ? "pointer" : "not-allowed", opacity: hasAfterPhoto ? 1 : 0.65 }}>
                <CheckCircle style={{ width: "0.75rem", height: "0.75rem" }} />
                {actionLoading ? "処理中..." : hasAfterPhoto ? "完了報告" : "完了報告（写真必要）"}
              </button>
            )}
            {canUploadInvoice && (
              <button
                onClick={() => { setFileType("invoice"); setTimeout(() => fileRef.current?.click(), 50); }}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#db2777", color: "white", border: "none", borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                <FileText style={{ width: "0.75rem", height: "0.75rem" }} />請求書送付
              </button>
            )}
            {room?.status === "estimate_approved" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%" }}>
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
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#7c3aed", color: "white", border: "none", borderRadius: "0.625rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                  ✍️ 電子署名して契約する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase B: Status banners */}
      {room?.status === "in_progress" && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>✅</span>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#713f12", fontWeight: 600, margin: 0 }}>契約が成立しました</p>
              <p style={{ fontSize: "0.75rem", color: "#92400e", margin: "0.125rem 0 0" }}>着手金の受け取り後、工事を開始してください。工事中は定期的に写真をアップロードしてください。</p>
            </div>
          </div>
        </div>
      )}
      {(room?.status === "invoice_approved" || room?.status === "closed") && (
        <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>💰</span>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#14532d", fontWeight: 600, margin: 0 }}>お支払いが完了しました</p>
              <p style={{ fontSize: "0.75rem", color: "#166534", margin: "0.125rem 0 0" }}>最終金のお受け取りをご確認ください。</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo count indicator when in_progress */}
      {room?.status === "in_progress" && photos.length > 0 && (
        <div style={{ background: "#ecfeff", borderBottom: "1px solid #a5f3fc" }}>
          <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.5rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.75rem", color: "#164e63" }}>
            <Camera style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>
              着工前 <strong>{photos.filter(p => p.photo_type === "before").length}</strong>枚 ／
              工事中 <strong>{photos.filter(p => p.photo_type === "progress").length}</strong>枚 ／
              完工後 <strong>{photos.filter(p => p.photo_type === "after").length}</strong>枚
              {!hasAfterPhoto && <span style={{ color: "#ea580c", marginLeft: "0.5rem" }}>（完了報告には完工後写真が必要）</span>}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: "52rem", width: "100%", margin: "0 auto", padding: "1rem 1.25rem", overflowY: "auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
            <Wrench style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <p style={{ fontSize: "0.875rem" }}>まだメッセージはありません。<br />まずご挨拶のメッセージを送りましょう。</p>
          </div>
        )}

        {messages.map(msg => {
          const isContractor = msg.sender_role === "contractor";
          const isSystem = msg.message_type === "system";

          if (isSystem) return (
            <div key={msg.id} style={{ textAlign: "center", margin: "0.875rem 0" }}>
              <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}>
                {msg.content}
              </span>
            </div>
          );

          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isContractor ? "flex-end" : "flex-start", marginBottom: "0.875rem" }}>
              {!isContractor && (
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "0.5rem", marginTop: "auto" }}>
                  <User style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                {!isContractor && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "0.25rem" }}>オーナー</p>}
                <div style={{
                  background: isContractor ? "linear-gradient(135deg, #1e3a8a, #1d4ed8)" : "white",
                  color: isContractor ? "white" : "#111827",
                  borderRadius: isContractor ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  padding: "0.75rem 1rem",
                  border: isContractor ? "none" : "1px solid #e5e7eb",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  wordBreak: "break-word",
                }}>
                  {msg.message_type === "photo" ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isContractor ? "white" : "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}>
                      <Camera style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                      <span style={{ textDecoration: "underline" }}>📸 {msg.file_name || "工事写真"}</span>
                    </a>
                  ) : (msg.message_type === "file" || msg.message_type === "estimate" || msg.message_type === "contract") ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isContractor ? "white" : "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}>
                      <FileText style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                      <span style={{ textDecoration: "underline" }}>{msg.file_name || msg.content || "ファイル"}</span>
                    </a>
                  ) : (
                    <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                  )}
                </div>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.25rem", textAlign: isContractor ? "right" : "left" }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
              {isContractor && (
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "0.5rem", marginTop: "auto" }}>
                  <Wrench style={{ width: "1rem", height: "1rem", color: "#2563eb" }} />
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
          {fileType === "photo" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>写真種別：</span>
              {(["before", "progress", "after"] as const).map(t => (
                <button key={t} onClick={() => setPhotoType(t)} style={{ borderRadius: "9999px", padding: "0.125rem 0.625rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "1px solid", background: photoType === t ? "#1d4ed8" : "white", color: photoType === t ? "white" : "#374151", borderColor: photoType === t ? "#1d4ed8" : "#e5e7eb" }}>
                  {t === "before" ? "着工前" : t === "progress" ? "工事中" : "完工後"}
                </button>
              ))}
            </div>
          )}
          {fileType === "invoice" && (
            <div style={{ marginBottom: "0.375rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#db2777", fontWeight: 600 }}>📄 請求書として送信します（オーナーに通知されます）</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileText style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280", flexShrink: 0 }} />
            <span style={{ fontSize: "0.875rem", color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X style={{ width: "1rem", height: "1rem" }} />
            </button>
            <button onClick={uploadFile} disabled={uploading} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
              {uploading ? "送信中..." : "送信"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
        accept={fileType === "photo" ? "image/*" : undefined}
      />

      {/* Input bar */}
      <div style={{ background: "white", borderTop: "1px solid #e5e7eb", position: "sticky", bottom: 0 }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <button onClick={() => { setFileType("other"); fileRef.current?.click(); }} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "0.625rem", padding: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Paperclip style={{ width: "1.125rem", height: "1.125rem", color: "#6b7280" }} />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="メッセージを入力..."
            style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "0.875rem", padding: "0.75rem 1rem", fontSize: "0.9375rem", outline: "none", background: "#f9fafb" }}
          />
          <button onClick={sendMessage} disabled={!text.trim() || sending} style={{ background: text.trim() ? "#1d4ed8" : "#dbeafe", border: "none", borderRadius: "50%", width: "2.75rem", height: "2.75rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0, transition: "background 0.2s" }}>
            {sending ? <Loader2 className="animate-spin" style={{ width: "1.125rem", height: "1.125rem", color: "white" }} /> : <Send style={{ width: "1.125rem", height: "1.125rem", color: "white" }} />}
          </button>
        </div>
      </div>

    </div>

    {/* Electronic Sign Modal */}
    {showSignModal && room && (
      <ElectronicSignModal
        role="contractor"
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
