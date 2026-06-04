"use client";

import { useEffect, useState } from "react";

type Withdrawal = { id: string; userId: string; asset: string; network: string; amount: string; fee: string; destinationAddress: string; status: string; amlStatus: string; adminNote: string | null; createdAt: string; user?: { email: string; uid: string; riskLevel: string; withdrawalRestricted: boolean } };

const actions = ["APPROVE", "REJECT", "PROCESSING", "COMPLETED"] as const;

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
    const data = await response.json();
    setWithdrawals(data.withdrawals ?? []);
  };

  useEffect(() => { void load(); }, []);

  async function review(withdrawalId: string, action: typeof actions[number]) {
    const response = await fetch("/api/admin/withdrawals/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalId, action, adminId, reason }) });
    const data = await response.json();
    setMessage(response.ok ? "Withdrawal action recorded." : data.error ?? "Review failed.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Finance Operations</p><h1 className="mt-3 text-4xl font-black">Withdrawals</h1><p className="mt-3 text-slate-400">Review withdrawal applications, risk signals, and internal processing status.</p></div></header>
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-[1fr_2fr_auto]">
          <input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Review note / reason" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button onClick={load} className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Refresh</button>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-black/25 text-slate-400"><tr>{["ID", "User", "Risk", "Asset", "Network", "Amount", "Fee", "Address", "Status", "AML", "Note", "Actions"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {withdrawals.map((item) => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.id.slice(0, 10)}</td>
                  <td className="px-5 py-4"><p className="font-bold">{item.user?.email ?? item.userId}</p><p className="text-xs text-slate-500">{item.user?.uid}</p></td>
                  <td className="px-5 py-4">{item.user?.riskLevel}{item.user?.withdrawalRestricted ? <span className="ml-2 text-amber-200">Restricted</span> : null}</td>
                  <td className="px-5 py-4 text-cyan-200">{item.asset}</td><td className="px-5 py-4">{item.network}</td><td className="px-5 py-4 text-rose-300">{item.amount}</td><td className="px-5 py-4">{item.fee}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.destinationAddress}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4">{item.amlStatus}</td><td className="px-5 py-4 text-slate-400">{item.adminNote ?? "-"}</td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{actions.map((action) => <button key={action} onClick={() => review(item.id, action)} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">{action}</button>)}</div></td>
                </tr>
              ))}
              {withdrawals.length === 0 && <tr><td colSpan={12} className="px-5 py-8 text-center text-slate-400">No withdrawal records.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
