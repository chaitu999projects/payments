"use client";

import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "1.00",
  });

  // ✅ Load Cashfree SDK once when page loads
  useEffect(() => {
    if (typeof window !== "undefined" && !window.cashfree) {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/ui/2.0.0/cashfree.js";
      script.async = true;
      script.onload = () => console.log("✅ Cashfree SDK loaded");
      document.body.appendChild(script);
    }
  }, []);

  // ✅ Update form input
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ✅ Handle payment
  async function handlePay(e) {
    e.preventDefault();
    setLoading(true);

    try {
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
        alert("❌ Create order failed: " + JSON.stringify(json.error, null, 2));
        return;
      }

      const payload = json.data;

      // ✅ Trigger Cashfree popup after SDK is loaded
      if (window.cashfree && payload.payment_session_id) {
        window.cashfree.pay({
          paymentSessionId: payload.payment_session_id,
          redirectTarget: "_self",
        });
      } else {
        alert("⚠️ Cashfree SDK not loaded or invalid order response");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Error creating order: " + err.message);
    }
  }

  // ✅ UI
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
      <h2>💳 Real Payment (Cashfree)</h2>
      <p style={{ color: "#aaa", maxWidth: 400, textAlign: "center" }}>
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
          placeholder="Email"
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
          placeholder="Amount"
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
