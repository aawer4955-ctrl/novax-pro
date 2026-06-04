"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";

type UserRow = {
  id: string;
  uid: string;
  email: string;
  role: string;
  kycStatus: string;
  accountStatus: string;
  withdrawalRestricted: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  balances: { asset: string; available: string; frozen: string }[];
};

const roles = ["SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER", "RISK_MANAGER", "SUPPORT", "AUDITOR", "USER"];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch(`/api/admin/users/search?query=${encodeURIComponent(query)}`, { cache: "no-store" });
    const data = await response.json();
    setUsers(data.users ?? []);
  };

  useEffect(() => { void load(); }, []);

  const adminPayload = useMemo(() => ({ adminId, reason }), [adminId, reason]);

  async function updateUser(userId: string, body: Record<string, unknown>) {
    if (!adminId || !reason) {
      setMessage("请先填写 adminId 和 reason。");
      return;
    }
    const response = await fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...adminPayload, ...body }),
    });
    const data = await response.json();
    setMessage(response.ok ? "操作已记录到审计日志。" : data.error ?? "操作失败。");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p>
          <h1 className="mt-3 text-4xl font-black">User Management</h1>
          <p className="mt-3 text-slate-400">Search users, review account state, update roles, freeze accounts, and restrict withdrawals.</p>
        </div>
      </header>
      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email or UID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={adminId} onChange={(event) => setAdminId(event.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason required for changes" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button onClick={load} className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Search</button>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  {["Email", "UID", "Role", "KYC", "Account", "Registered", "Last Login", "Assets", "Actions"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/5">
                    <td className="px-5 py-4 font-bold">{user.email}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{user.uid}</td>
                    <td className="px-5 py-4">
                      <select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value })} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none">
                        {roles.map((role) => <option key={role} className="bg-[#07111f]">{role}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-cyan-200">{user.kycStatus}</td>
                    <td className="px-5 py-4">{user.accountStatus}{user.withdrawalRestricted ? <span className="ml-2 text-amber-200">WITHDRAWAL RESTRICTED</span> : null}</td>
                    <td className="px-5 py-4 text-slate-400">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-400">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
                    <td className="px-5 py-4 text-slate-300">{user.balances.length ? user.balances.map((item) => `${item.asset}: ${item.available}/${item.frozen}`).join(" | ") : "-"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateUser(user.id, { accountStatus: "ACTIVE" })} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200">Enable</button>
                        <button onClick={() => updateUser(user.id, { accountStatus: "SUSPENDED" })} className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-bold text-amber-100">Disable</button>
                        <button onClick={() => updateUser(user.id, { accountStatus: "FROZEN" })} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200">Freeze</button>
                        <button onClick={() => updateUser(user.id, { withdrawalRestricted: !user.withdrawalRestricted })} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Withdraw</button>
                        <Link href={`/admin/users/${user.id}`} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Detail</Link>
                        <Link href={`/admin/orders?userId=${user.id}`} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Orders</Link>
                        <Link href={`/admin/ledger?userId=${user.id}`} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Assets</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
