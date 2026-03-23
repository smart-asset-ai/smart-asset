"use client";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { MobileHeader, TapButton, Card, MobilePage } from "@/components/MobileLayout";

export default function MCasesPage() {
  return (
    <MobilePage active="cases">
      <MobileHeader title="修繕案件" sub="案件掲載・管理" />
      <div style={{ padding: "16px" }}>

        <Card style={{ background: "linear-gradient(135deg, #14532d, #16a34a)", marginBottom: "16px", textAlign: "center" }}>
          <FileText style={{ width: "36px", height: "36px", color: "white", margin: "0 auto 12px" }} />
          <h1 style={{ color: "white", fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}>修繕案件を掲載</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
            住所・修繕内容・希望時期を入力するだけ。地元施工会社に自動通知されます。
          </p>
          <TapButton href="/properties/new" color="white" textColor="#16a34a" icon={Plus} fullWidth>
            新しい案件を掲載する
          </TapButton>
        </Card>

        <Card>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "12px" }}>掲載中の案件を確認</p>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>ログインして掲載済み案件を管理できます。</p>
          <TapButton href="/owner/mypage" color="#16a34a" icon={ArrowRight} fullWidth>
            マイページで確認する
          </TapButton>
        </Card>
      </div>
    </MobilePage>
  );
}
