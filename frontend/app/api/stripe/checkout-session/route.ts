import { NextRequest, NextResponse } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

const PLAN_PRICES: Record<string, { priceId: string; name: string }> = {
  A: {
    priceId: process.env.STRIPE_PRICE_PLAN_A || "",
    name: "Smart Asset AI - Plan A (¥1,000/月)",
  },
  B: {
    priceId: process.env.STRIPE_PRICE_PLAN_B || "",
    name: "Smart Asset AI - Plan B (¥5,000/月)",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, contractor_id } = await req.json();

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create Stripe checkout session via API
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "success_url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://smart-asset.ai"}/contractor/mypage?payment=success`,
        "cancel_url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://smart-asset.ai"}/contractors`,
        "client_reference_id": contractor_id || "",
        "line_items[0][price]": planConfig.priceId,
        "line_items[0][quantity]": "1",
        "metadata[contractor_id]": contractor_id || "",
        "metadata[plan]": plan,
        "locale": "ja",
        "payment_method_types[0]": "card",
      }).toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", session);
      return NextResponse.json({ error: session.error?.message || "Stripe error" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
