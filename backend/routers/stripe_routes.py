import stripe
import os
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from database import get_supabase

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

PRICE_IDS = {
    "A": os.getenv("STRIPE_PRICE_A", ""),
    "B": os.getenv("STRIPE_PRICE_B", ""),
}

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://smart-asset.ai")


@router.post("/checkout-session")
async def create_checkout_session(data: dict):
    """Create a Stripe Checkout session for plan upgrade."""
    plan = data.get("plan", "").upper()
    contractor_id = data.get("contractor_id", "")

    if plan not in PRICE_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {plan}")

    price_id = PRICE_IDS[plan]
    if not price_id:
        raise HTTPException(
            status_code=500,
            detail=f"Stripe price ID for plan {plan} is not configured",
        )

    if not contractor_id:
        raise HTTPException(status_code=400, detail="contractor_id is required")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={
                "contractor_id": contractor_id,
                "plan": plan.lower(),
            },
            success_url=(
                f"{FRONTEND_URL}/contractor/mypage"
                f"?payment=success&plan={plan.lower()}"
            ),
            cancel_url=f"{FRONTEND_URL}/contractor/mypage?payment=cancel",
            allow_promotion_codes=True,
        )
        return {"url": session.url, "session_id": session.id}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except stripe.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event["type"]

    # Subscription activated / payment succeeded
    if event_type == "checkout.session.completed":
        session_obj = event["data"]["object"]
        meta = session_obj.get("metadata", {})
        contractor_id = meta.get("contractor_id")
        plan = meta.get("plan")  # "a" or "b"

        if contractor_id and plan:
            plan_map = {"a": "plan_a", "b": "plan_b"}
            subscription_plan = plan_map.get(plan)
            if subscription_plan:
                supabase = get_supabase()
                supabase.table("contractors").update(
                    {
                        "subscription_plan": subscription_plan,
                        "subscription_status": "active",
                    }
                ).eq("id", contractor_id).execute()

    # Subscription cancelled / payment failed
    elif event_type in (
        "customer.subscription.deleted",
        "invoice.payment_failed",
    ):
        sub_obj = event["data"]["object"]
        # For subscription deleted, look up contractor by stripe customer id
        customer_id = sub_obj.get("customer")
        if customer_id:
            supabase = get_supabase()
            supabase.table("contractors").update(
                {"subscription_status": "inactive"}
            ).eq("stripe_customer_id", customer_id).execute()

    return JSONResponse(content={"received": True})


@router.get("/plans")
async def get_plans():
    """Return available plan info."""
    return {
        "plans": [
            {
                "id": "plan_a",
                "name": "Aプラン",
                "price": 3000,
                "currency": "jpy",
                "interval": "month",
                "features": ["応募10件/月", "施工事例3枚"],
            },
            {
                "id": "plan_b",
                "name": "Bプラン",
                "price": 6000,
                "currency": "jpy",
                "interval": "month",
                "features": [
                    "応募20件/月",
                    "優先表示",
                    "写真4枚+会社写真1枚",
                    "AIスコア分析レポート",
                    "専用バッジ",
                ],
                "popular": True,
            },
        ]
    }
