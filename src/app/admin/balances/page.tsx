"use client";

import { useEffect, useState } from "react";

type BalanceRow = {
  id: string;
  userId: string;
  asset: string;
  available: string;
  frozen: string;
  updatedAt: string;
  user: { id: string; uid: string; email: string; accountStatus: string; withdrawalRestricted: boolean };
};

export default function AdminBalancesPage() {
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [query, setQuery] = useState("");
  const [adminId, setAdminId] = useState("");
  const [userId, setUserId] = useState("");
  const [asset, setAsset] = useState("USDT");
  const [adjustmentType, setAdjustmentType] = useState("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch(`/api/admin/balances?query=${encodeURIComponent(query)}`, { cache: "no-store" });
    const data = await response.json();
    setBalances(data.balances ?? []);
  };

  useEffect(() => { void load(); }, []);

  async function adjust() {
    const response = await fetch("/api/admin/balances/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, userId, asset, adjustmentType, amount, reason }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Balance adjustment recorded permanently." : data.error ?? "Adjustment failed.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Finance Control</p>
          <h1 className="mt-3 text-4xl font-black">Balances</h1>
          <p className="mt-3 text-slate-400">View balances and perform audited credit, debit, freeze, and unfreeze operations.</p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">Balance adjustments are recorded permanently.</div>
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-4">
          <input value={adminId} onChange={(event) => setAdminId(event.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={asset} onChange={(event) => setAsset(event.target.value.toUpperCase())} placeholder="Asset" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none">
            {["CREDIT", "DEBIT", "FREEZE", "UNFREEZE"].map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
          </select>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none md:col-span-2" />
          <button onClick={adjust} className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Adjust Balance</button>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <div className="flex gap-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by email, UID, or asset" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button onClick={load} className="rounded-lg border border-white/15 px-5 py-3 font-bold">Filter</button>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-black/25 text-slate-400"><tr>{["User", "UID", "Asset", "Available", "Frozen", "Status", "Updated"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {balances.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-5 py-4 font-bold">{row.user.email}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{row.user.uid}</td>
                  <td className="px-5 py-4 text-cyan-200">{row.asset}</td>
                  <td className="px-5 py-4 text-emerald-300">{row.available}</td>
                  <td className="px-5 py-4 text-amber-200">{row.frozen}</td>
                  <td className="px-5 py-4">{row.user.accountStatus}{row.user.withdrawalRestricted ? " · Restricted" : ""}</td>
                  <td className="px-5 py-4 text-slate-400">{new Date(row.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
              {balances.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No balances found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
