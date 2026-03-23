const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Contractor {
  id: string;
  company_name: string;
  address: string;
  prefecture: string;
  city: string;
  phone: string;
  email: string;
  construction_license: string;
  corporate_number?: string;
  work_types: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  photo_urls?: string[];
  created_at: string;
  ai_score?: number;
  subscription_plan?: string;
  main_work_type?: string;
  rating?: number;
  review_count?: number;
  rank?: string;
}

export function getContractorRank(scoreOrRank?: number | string): { rank: string; color: string; bg: string } {
  const r = typeof scoreOrRank === "string" ? scoreOrRank : undefined;
  const score = typeof scoreOrRank === "number" ? scoreOrRank : undefined;
  const rankKey = r || (score !== undefined
    ? score >= 70 ? "S" : score >= 60 ? "A" : score >= 50 ? "B" : score >= 40 ? "C" : "D"
    : "D");
  const MAP: Record<string, { color: string; bg: string }> = {
    S: { color: "#7c3aed", bg: "#ede9fe" },
    A: { color: "#1d4ed8", bg: "#dbeafe" },
    B: { color: "#065f46", bg: "#d1fae5" },
    C: { color: "#92400e", bg: "#fef3c7" },
    D: { color: "#6b7280", bg: "#f3f4f6" },
  };
  return { rank: rankKey, ...(MAP[rankKey] || MAP.D) };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function fetchContractors(params?: {
  prefecture?: string;
  work_type?: string;
  lat?: number;
  lng?: number;
}): Promise<Contractor[]> {
  const query = new URLSearchParams();
  if (params?.prefecture) query.set("prefecture", params.prefecture);
  if (params?.work_type) query.set("work_type", params.work_type);
  if (params?.lat) query.set("lat", String(params.lat));
  if (params?.lng) query.set("lng", String(params.lng));

  const res = await fetch(`${API_URL}/api/contractors?${query}`);
  if (!res.ok) throw new Error("業者データの取得に失敗しました");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.contractors ?? []);
}

export async function registerContractor(
  data: FormData
): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/api/contractors`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "登録に失敗しました");
  }
  return res.json();
}

export async function chatWithAI(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error("AIチャットへの接続に失敗しました");
  return res.body!;
}
