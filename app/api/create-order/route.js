import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerEmail, customerPhone } = body;

    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET = process.env.CASHFREE_SECRET_KEY;
    const ENV =
      process.env.CASHFREE_ENV === "prod"
        ? "https://api.cashfree.com"
        : "https://sandbox.cashfree.com";

    console.log("🚀 Environment:", ENV);
    console.log("📦 Request Payload:", body);

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerPhone,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status?order_id={order_id}`,
      },
    };

    const response = await fetch(`${ENV}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET,
        "x-api-version": "2022-09-01",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 Response Status:", response.status);

    // Some Cashfree 401/500 errors send empty bodies -> must check before parsing
    let data = {};
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn("⚠️ Response body could not be parsed:", parseErr.message);
      data = { message: "Empty or invalid JSON from Cashfree" };
    }

    console.log("🧾 Response Body:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (err) {
    console.error("❌ create-order runtime error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
