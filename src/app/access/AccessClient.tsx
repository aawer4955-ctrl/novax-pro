"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitCode() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok || !(data.ok === true || data.success === true)) {
        setError(data.message ?? "Invalid access code");
        return;
      }

      const next = searchParams.get("next") || "/exchange-demo";
      const target = next.startsWith("/") ? next : "/exchange-demo";
      router.push(target);
      router.refresh();
      window.location.assign(target);
    } catch {
      setError("Invalid access code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Access Verification</p>
            <LanguageSwitcher />
          </div>
          <h1 className="mt-4 text-4xl font-black">Access Verification</h1>
          <p className="mt-3 leading-7 text-slate-400">Enter your access code to continue to the market platform.</p>

          <div className="mt-8">
            <label htmlFor="access-code" className="text-sm font-bold text-slate-300">Enter access code</label>
            <input
              id="access-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void submitCode(); }}
              placeholder="Enter access code"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
            />
            {error && <p className="mt-3 text-sm font-bold text-rose-300">{error}</p>}
          </div>

          <button disabled={loading} onClick={submitCode} className="mt-6 w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-60">
            {loading ? "Checking..." : "Continue"}
          </button>
        </div>
      </section>
    </main>
  );
}
