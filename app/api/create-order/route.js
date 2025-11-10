import axios from "axios";

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

    const resp = await fetch(`${ENV}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Cashfree API error:", data);
      return Response.json({ success: false, error: data }, { status: resp.status });
    }

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("create-order error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

