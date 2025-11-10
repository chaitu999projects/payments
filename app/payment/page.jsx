"use client";

import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "1.00",
  });

  // ✅ Load Cashfree SDK (Production v3)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadSdk = async () => {
      if (!window.Cashfree) {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"; // ✅ Correct SDK path
        script.async = true;
        script.onload = () => {
          console.log("✅ Cashfree SDK loaded successfully");
          setSdkLoaded(true);
        };
        script.onerror = () => {
          console.error("❌ Failed to load Cashfree SDK");
          alert("Failed to load Cashfree payment system. Please refresh.");
        };
        document.body.appendChild(script);
      } else {
        console.log("⚡ Cashfree SDK already available");
        await Promise.resolve();
        setSdkLoaded(true);
      }
    };

    loadSdk();
  }, []);

  // ✅ Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ✅ Handle Payment
  async function handlePay(e) {
    e.preventDefault();

    if (!sdkLoaded) {
      alert("Cashfree SDK is still loading. Please wait a moment.");
      return;
    }

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
        console.error("❌ Order creation failed:", json.error);
        alert("Order creation failed. Check console for details.");
        return;
      }

      const payload = json.data;
      console.log("✅ Order created successfully:", payload);

      // ✅ Use Cashfree v3 SDK
      if (window.Cashfree && payload.payment_session_id) {
        console.log("🚀 Opening Cashfree checkout...");
        const cashfree = new window.Cashfree({
          mode: "production", // ✅ Use "sandbox" only if testing
        });

        cashfree.checkout({
          paymentSessionId: payload.payment_session_id,
          redirectTarget: "_self", // Opens in same tab
        });
      } else {
        console.error("❌ SDK not loaded or invalid order response:", {
          sdk: window.Cashfree,
          payload,
        });
        alert("Cashfree SDK not loaded or invalid order response.");
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Payment error:", err);
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
      <h2 style={{ marginBottom: 16 }}>💳 Cashfree Payment (Production)</h2>
      <p
        style={{
          marginBottom: 24,
          color: "#aaa",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        This page uses your <b>Live Cashfree keys</b> to create a real payment of ₹
        {form.amount}.
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

// ✅ Common input styles
const inputStyle = {
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "white",
  fontSize: "14px",
};
