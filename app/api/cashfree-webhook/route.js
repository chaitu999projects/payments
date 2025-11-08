import crypto from "crypto";

export async function POST(req) {
  try {
    const rawBody = await req.text();

    // Cashfree test webhook does not send signature
    const signatureHeader =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-cf-signature") ||
      req.headers.get("x-cf-webhook-signature");

    // If no signature (for test webhook), skip verification
    if (!signatureHeader) {
      console.log("⚠️ No signature header (Cashfree test webhook)");
      const testEvent = JSON.parse(rawBody);
      console.log("✅ Test webhook received:", testEvent);
      return new Response("OK (Test webhook received)", { status: 200 });
    }

    // Verify signature for real webhook
    const SECRET = process.env.CASHFREE_SECRET_KEY;
    const computed = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");

    if (computed !== signatureHeader) {
      console.warn("❌ Invalid Cashfree signature");
      return new Response("Invalid signature", { status: 401 });
    }

    // Process verified real event
    const event = JSON.parse(rawBody);
    console.log("✅ Verified real Cashfree webhook:", event);

    const orderId = event?.order?.order_id;
    const status = event?.order?.order_status;

    console.log(`Order ${orderId} status: ${status}`);

    // TODO: update your database here

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
}
