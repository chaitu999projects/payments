import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerEmail, customerPhone } =
      body;

    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET = process.env.CASHFREE_SECRET_KEY;
    const BASE = "https://api.cashfree.com"; // production base URL

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerPhone, // ✅ new field (can use phone or email)
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status?order_id={order_id}`,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "x-api-version": "2022-09-01", // ✅ REQUIRED
      "x-client-id": APP_ID,
      "x-client-secret": SECRET,
    };

    const resp = await axios.post(`${BASE}/pg/orders`, payload, { headers });

    return new Response(JSON.stringify({ success: true, data: resp.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-order error:", err?.response?.data || err.message);
    const message = err?.response?.data || err.message || "unknown";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
