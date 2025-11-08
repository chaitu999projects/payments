"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "1.00",
  });

  // update form state dynamically
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

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
        alert("Create order failed: " + JSON.stringify(json.error, null, 2));
        return;
      }

      const payload = json.data;

      // Redirect to hosted payment page
      if (payload.payment_link) {
        window.location.href = payload.payment_link;
        return;
      }

      // Or open popup if SDK is loaded
      if (payload.order_token) {
        if (window?.Cashfree?.openCheckout) {
          window.Cashfree.openCheckout({ order_token: payload.order_token });
        } else if (window?.cashfree) {
          window.cashfree.openCheckout({ order_token: payload.order_token });
        } else {
          alert(
            "Order token created but Cashfree SDK not loaded. Redirecting to payment link if exists."
          );
          if (payload.payment_link) window.location.href = payload.payment_link;
        }
        return;
      }

      alert("Order created — server response: " + JSON.stringify(payload));
    } catch (err) {
      setLoading(false);
      console.error(err);
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
      <p style={{ marginBottom: 24, color: "#aaa", maxWidth: 400, textAlign: "center" }}>
        Enter your details below. This will use your <b>live Cashfree keys</b> to
        create a real ₹{form.amount} payment order.
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
