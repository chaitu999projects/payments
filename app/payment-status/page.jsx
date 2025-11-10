"use client";

import { Suspense } from "react";
import PaymentStatusContent from "./PaymentStatusContent";
// import PaymentStatusContent from "./PaymentStatusContent";

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#0f0f0f",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <p>⏳ Loading payment status...</p>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
