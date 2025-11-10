"use client";

import { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "1.00",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ✅ Updated Cashfree PG v2 payment handler
  async function handlePay(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create an order through your backend API
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          amount: form.amount,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      });

      const json = await res.json();
      setLoading(false);

      if (!json.success) {
        alert("❌ Failed to create order: " + JSON.stringify(json.error, null, 2));
        return;
      }

      // Step 2: Extract session ID
      const sessionId = json.data.payment_session_id;

      if (!sessionId) {
        alert("❌ No payment_session_id returned from backend!");
        return;
      }

      // Step 3: Load the Cashfree SDK
      const cashfree = await load({
        mode: "production", // 🔄 change to "sandbox" for testing
      });

      // Step 4: Open payment popup
      cashfree.pay({
        paymentSessionId: sessionId,
        redirectTarget: "_self", // or "_blank" if you prefer a new tab
      });

      // Optional: Listen to events
      cashfree.on("payment.success", (data) => {
        console.log("✅ Payment successful:", data);
      });

      cashfree.on("payment.failed", (data) => {
        console.log("❌ Payment failed:", data);
      });
    } catch (err) {
      setLoading(false);
      console.error("Payment error:", err);
      alert("Error creating order: " + err.message);
    }
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "center",
        background: "#0f0f0f",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>💳 Real Payment (Cashfree)</h2>
      <p
        style={{
          marginBottom: 24,
          color: "#aaa",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        Enter your details below. This will use your{" "}
        <b>live Cashfree keys</b> to create a real ₹{form.amount} payment order.
      </p>

      <form
        onSubmit={handlePay}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "300px",
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          pattern="[0-9]{10}"
          style={inputStyle}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount (INR)"
          value={form.amount}
          onChange={handleChange}
          min="1"
          step="0.01"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#555" : "#00b67a",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : `Pay ₹${form.amount}`}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "white",
  fontSize: "14px",
};
