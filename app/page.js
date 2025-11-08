import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Next.js Cashfree (Production) Demo</h1>
      <p>
        Use the <Link href="/payment">Payment Page</Link> to create a real order.
      </p>
    </main>
  );
}
