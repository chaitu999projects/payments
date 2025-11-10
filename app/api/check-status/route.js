import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return new NextResponse(
      JSON.stringify({ error: "Missing order_id" }),
      { status: 400 }
    );
  }

  try {
    const BASE =
      process.env.CASHFREE_ENV === "prod"
        ? "https://api.cashfree.com"
        : "https://sandbox.cashfree.com";

    const headers = {
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "x-api-version": "2022-09-01",
    };

    const res = await axios.get(`${BASE}/pg/orders/${orderId}`, { headers });

    return new NextResponse(JSON.stringify(res.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-status error:", err.NextResponse?.data || err.message);
    return new NextResponse(
      JSON.stringify({ error: err.NextResponse?.data || err.message }),
      { status: 500 }
    );
  }
}
