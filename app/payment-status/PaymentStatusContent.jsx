"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentStatusContent() {
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("order_id");
    if (!id) return;

    // ✅ Combine logic inside one async function to avoid multiple sync setState calls
    const fetchStatus = async () => {
      try {
        // Fetch data first, then update all states together
        const res = await axios.get(`/api/check-status?order_id=${id}`);
        setOrderId(id);
        setStatus(res.data.order_status || "unknown");
        setDetails(res.data);
      } catch (err) {
        console.error("Error fetching status:", err);
        setOrderId(id);
        setStatus("error");
      }
    };

    fetchStatus();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f",
        color: "white",
        fontFamily: "sans-serif",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>
        {status === "loading" && "⏳ Checking payment status..."}
        {status === "SUCCESS" && "✅ Payment Successful!"}
        {status === "FAILED" && "❌ Payment Failed!"}
        {status === "ACTIVE" && "💸 Payment Pending..."}
        {status === "error" && "⚠️ Error fetching payment status"}
        {status === "unknown" && "❓ Unknown payment status"}
      </h1>

      {orderId && (
        <p style={{ color: "#aaa", marginTop: 8 }}>Order ID: {orderId}</p>
      )}

      {details && (
        <pre
          style={{
            background: "#1a1a1a",
            padding: 16,
            borderRadius: 8,
            marginTop: 20,
            fontSize: "0.85rem",
            color: "#ccc",
            maxWidth: "90%",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      )}

      <a
        href="/payments"
        style={{
          marginTop: 32,
          background: "#00b67a",
          color: "white",
          padding: "10px 18px",
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        Back to Payment Page
      </a>
    </div>
  );
}
