import { Suspense } from "react";
import TradingClient from "./TradingClient";

export default function TradingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050816] p-6 text-white">Loading trading...</main>}>
      <TradingClient />
    </Suspense>
  );
}
