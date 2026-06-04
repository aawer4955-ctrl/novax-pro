"use client";

import { useEffect, useState } from "react";

type Deposit = { id: string; userId: string; asset: string; network: string; amount: string; txHash: string | null; address: string | null; status: string; adminNote: string | null; createdAt: string; user?: { email: string; uid: string } };

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [form, setForm] = useState({ userId: "", asset: "USDT", network: "TRC20", amount: "", txHash: "", address: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/deposits", { cache: "no-store" });
    const data = await response.json();
    setDeposits(data.deposits ?? []);
  };

  useEffect(() => { void load(); }, []);

  async function createDeposit() {
    const response = await fetch("/api/admin/deposits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, adminId, reason }) });
    const data = await response.json();
    setMessage(response.ok ? "Manual deposit created and audited." : data.error ?? "Create failed.");
    await load();
  }

  async function review(depositId: string, action: "APPROVE" | "REJECT") {
    const response = await fetch("/api/admin/deposits/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ depositId, action, adminId, reason }) });
    const data = await response.json();
    setMessage(response.ok ? "Deposit review recorded." : data.error ?? "Review failed.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Finance Operations</p><h1 className="mt-3 text-4xl font-black">Deposits</h1><p className="mt-3 text-slate-400">Create, review, and confirm deposit records with ledger and audit logging.</p></div></header>
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-2">
          <input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason / admin note" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          {(["userId", "asset", "network", "amount", "txHash", "address"] as const).map((key) => (
            <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: key === "asset" || key === "network" ? e.target.value.toUpperCase() : e.target.value })} placeholder={key} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          ))}
          <button onClick={createDeposit} className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950 md:col-span-2">Create Deposit Record</button>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-black/25 text-slate-400"><tr>{["ID", "User", "Asset", "Network", "Amount", "TxHash", "Address", "Status", "Note", "Action"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {deposits.map((item) => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.id.slice(0, 10)}</td>
                  <td className="px-5 py-4"><p className="font-bold">{item.user?.email ?? item.userId}</p><p className="text-xs text-slate-500">{item.user?.uid}</p></td>
                  <td className="px-5 py-4 text-cyan-200">{item.asset}</td><td className="px-5 py-4">{item.network}</td><td className="px-5 py-4 text-emerald-300">{item.amount}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.txHash ?? "-"}</td><td className="px-5 py-4 font-mono text-xs text-slate-400">{item.address ?? "-"}</td><td className="px-5 py-4">{item.status}</td><td className="px-5 py-4 text-slate-400">{item.adminNote ?? "-"}</td>
                  <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => review(item.id, "APPROVE")} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200">Approve</button><button onClick={() => review(item.id, "REJECT")} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200">Reject</button></div></td>
                </tr>
              ))}
              {deposits.length === 0 && <tr><td colSpan={10} className="px-5 py-8 text-center text-slate-400">No deposit records.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
