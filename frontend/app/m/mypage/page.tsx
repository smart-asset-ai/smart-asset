"use client";
import { Home, HardHat, ChevronRight, User, LogIn, UserPlus } from "lucide-react";
import { MobileHeader, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MMypagePage() {
  return (
    <MobilePage active="mypage">
      <MobileHeader title="マイページ" />
      <div style={{ padding: "16px" }}>

        {/* オーナー向け */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
          🏠 オーナー様
        </p>
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ width: "48px", height: "48px", background: "#f0fdf4", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Home style={{ width: "24px", height: "24px", color: "#16a34a" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#111827" }}>オーナー向けマイページ</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>物件・案件・AI診断結果の管理</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <TapButton href="/owner/mypage" color="#16a34a" icon={LogIn} fullWidth>
              ログイン・マイページへ
            </TapButton>
            <TapButton href="/owner/register" color="#f0fdf4" textColor="#16a34a" icon={UserPlus} fullWidth>
              新規登録（無料）
            </TapButton>
          </div>
        </Card>

        {/* 施工会社向け */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
          🔨 施工会社様
        </p>
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ width: "48px", height: "48px", background: "#eff6ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HardHat style={{ width: "24px", height: "24px", color: "#2563eb" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#111827" }}>業者向けマイページ</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>プロフィール・案件・評価の管理</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <TapButton href="/contractor/mypage" color="#2563eb" icon={LogIn} fullWidth>
              ログイン・マイページへ
            </TapButton>
            <TapButton href="/contractors/register" color="#eff6ff" textColor="#2563eb" icon={UserPlus} fullWidth>
              無料で会社登録
            </TapButton>
          </div>
        </Card>

        {/* 共通ゲストカード */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User style={{ width: "20px", height: "20px", color: "#9ca3af" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>登録・ログインで全機能無料</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>AI診断・案件掲載・業者検索すべて使えます</div>
            </div>
            <ChevronRight style={{ width: "16px", height: "16px", color: "#d1d5db" }} />
          </div>
        </Card>

      </div>
    </MobilePage>
  );
}
