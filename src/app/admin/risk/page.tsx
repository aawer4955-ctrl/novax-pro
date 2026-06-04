"use client";

import { useEffect, useState } from "react";

type RiskUser = { id: string; uid: string; email: string; riskLevel: string; accountStatus: string; withdrawalRestricted: boolean };

export default function AdminRiskPage() {
  const [data, setData] = useState<{ frozenUsers?: RiskUser[]; restrictedUsers?: RiskUser[]; largeWithdrawals?: unknown[]; abnormalOrders?: unknown[] }>({});
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/risk", { cache: "no-store" });
    setData(await response.json());
  };
  useEffect(() => { void load(); }, []);

  async function setFrozen(userId: string, frozen: boolean) {
    const response = await fetch("/api/admin/users/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminId, reason, userId, accountStatus: frozen ? "FROZEN" : "ACTIVE" }) });
    const body = await response.json();
    setMessage(response.ok ? "Risk action audited." : body.error ?? "Risk action failed.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Risk Control</p><h1 className="mt-3 text-4xl font-black">Risk Control</h1><p className="mt-3 text-slate-400">Review frozen users, withdrawal restrictions, large withdrawals, and abnormal orders.</p></div></header>
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-3">
          <input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button onClick={load} className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Refresh</button>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <RiskPanel title="Frozen Users" users={data.frozenUsers ?? []} onFreeze={setFrozen} />
        <RiskPanel title="Withdrawal Restricted Users" users={data.restrictedUsers ?? []} onFreeze={setFrozen} />
        <CountPanel title="Large Withdrawals" count={(data.largeWithdrawals ?? []).length} />
        <CountPanel title="Abnormal Orders" count={(data.abnormalOrders ?? []).length} />
      </section>
    </main>
  );
}

function RiskPanel({ title, users, onFreeze }: { title: string; users: RiskUser[]; onFreeze: (userId: string, frozen: boolean) => void }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="font-bold">{user.email}</p><p className="mt-1 text-sm text-slate-400">{user.uid} · {user.riskLevel} · {user.accountStatus}</p>
            <div className="mt-3 flex gap-2"><button onClick={() => onFreeze(user.id, true)} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200">Freeze</button><button onClick={() => onFreeze(user.id, false)} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200">Unfreeze</button></div>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-slate-400">No records.</p>}
      </div>
    </section>
  );
}

function CountPanel({ title, count }: { title: string; count: number }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5"><h2 className="text-xl font-black">{title}</h2><p className="mt-3 text-3xl font-black text-cyan-200">{count}</p></section>;
}
