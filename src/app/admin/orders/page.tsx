"use client";

import { useEffect, useState } from "react";

type OrderRow = {
  id: string;
  pair: string;
  side: string;
  type: string;
  amount: string;
  price: string | null;
  total?: string;
  fee: string;
  filledAmount?: string;
  status: string;
  createdAt: string;
  user?: { email: string; uid: string };
};

const statuses = ["OPEN", "FILLED", "CANCELED", "REJECTED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load orders");
      setOrders(data.orders ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const response = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, adminId, reason }),
    });
    const data = await response.json();
    if (!response.ok) return alert(data.error ?? "Update failed");
    await load();
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 px-6 py-6 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p>
          <h1 className="mt-3 text-4xl font-black">Order Management</h1>
          <p className="mt-3 text-slate-400">View user orders, filter operationally, and cancel abnormal orders with audit records.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-3">
          <input value={adminId} onChange={(event) => setAdminId(event.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for status changes" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button onClick={load} className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950">Refresh</button>
        </div>
        {error && <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm font-bold text-rose-200">{error}</div>}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-xl font-black">Orders</h2>
            <button onClick={load} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  {['Order ID','User','Pair','Side','Type','Price','Amount','Filled','Fee','Status','Created','Action'].map((h) => <th key={h} className="px-5 py-4 font-bold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td className="px-5 py-6 text-slate-400" colSpan={12}>Loading...</td></tr> : orders.length === 0 ? <tr><td className="px-5 py-6 text-slate-400" colSpan={12}>No orders yet.</td></tr> : orders.map((order) => (
                  <tr key={order.id} className="border-t border-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{order.id.slice(0, 10)}...</td>
                    <td className="px-5 py-4"><p className="font-bold">{order.user?.email ?? '-'}</p><p className="text-xs text-slate-500">{order.user?.uid}</p></td>
                    <td className="px-5 py-4 font-black">{order.pair}</td>
                    <td className={order.side === 'BUY' ? 'px-5 py-4 font-bold text-emerald-300' : 'px-5 py-4 font-bold text-rose-300'}>{order.side}</td>
                    <td className="px-5 py-4">{order.type}</td>
                    <td className="px-5 py-4">{order.price ?? '-'}</td>
                    <td className="px-5 py-4">{order.amount}</td>
                    <td className="px-5 py-4">{order.filledAmount ?? order.amount}</td>
                    <td className="px-5 py-4">{order.fee}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">{order.status}</span></td>
                    <td className="px-5 py-4 text-slate-400">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none">
                        {statuses.map((status) => <option key={status} className="bg-[#07111f]">{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
