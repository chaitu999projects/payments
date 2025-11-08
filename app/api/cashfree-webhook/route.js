import crypto from "crypto";

/**
 * Cashfree sends a signature header (commonly 'x-webhook-signature' or similar).
 * We compute HMAC SHA256 over the raw body with your SECRET and compare.
 */
export async function POST(req) {
  try {
    const rawBody = await req.text(); // keep exact raw body for signature
    const signatureHeader =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-cf-signature") ||
      req.headers.get("x-cf-webhook-signature");

    if (!signatureHeader) {
      console.warn("Missing signature header on webhook");
      return new Response("Missing signature", { status: 400 });
    }

    const SECRET = process.env.CASHFREE_SECRET_KEY;
    const computed = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");

    if (computed !== signatureHeader) {
      console.warn("Invalid webhook signature", { computed, signatureHeader });
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("✅ Verified Cashfree webhook event:", event);

    // TODO: Update your DB with event/order status.
    // Example: event.order.order_id, event.order.order_status, event.order.reference_id
    // Ensure idempotency: multiple webhooks may be sent by Cashfree.

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Error", { status: 500 });
  }
}
