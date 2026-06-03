"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";
import { DemoUser } from "@/lib/auth-types";
import { listUsers, updateUserAccountStatus } from "@/lib/mock-auth";

function statusClass(status: DemoUser["accountStatus"]) {
  if (status === "active") return "text-emerald-300";
  if (status === "inactive") return "text-amber-200";
  return "text-rose-300";
}

function kycLabel(value: DemoUser["kycStatus"]) {
  return value.toUpperCase();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const refresh = () => {
    const rows = listUsers().filter((user) => user.role !== "admin");
    setUsers(rows);
    setSelectedUser((current) => current ? rows.find((user) => user.id === current.id) ?? null : null);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("novax-auth-change", refresh);
    return () => window.removeEventListener("novax-auth-change", refresh);
  }, []);

  const updateStatus = (userId: string, status: DemoUser["accountStatus"]) => {
    updateUserAccountStatus(userId, status);
    refresh();
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <Link href="/admin">
            <h1 className="text-2xl font-black">NovaX Admin</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">User Management</p>
          </Link>
          <nav className="flex gap-5 text-sm text-slate-300">
            <Link href="/admin" className="hover:text-white">Dashboard</Link>
            <Link href="/exchange-demo/assets" className="hover:text-white">Asset Center</Link>
          </nav>
        </div>
      </header>

      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p>
            <h2 className="mt-3 text-4xl font-black">用户管理</h2>
            <p className="mt-3 text-slate-400">新注册用户默认为待启用，管理员启用后才能使用资产、充值、提现和下单功能。</p>
          </div>
          <button onClick={refresh} className="rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200">Refresh Users</button>
        </div>

        {selectedUser && (
          <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">User Detail</p>
                <h3 className="mt-3 text-2xl font-black">{selectedUser.email}</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                  <span>UID: {selectedUser.uid}</span>
                  <span>KYC: {kycLabel(selectedUser.kycStatus)}</span>
                  <span>Status: {selectedUser.accountStatus.toUpperCase()}</span>
                  <span>Joined: {new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">Close</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  <th className="px-6 py-4">UID</th>
                  <th className="px-6 py-4">邮箱</th>
                  <th className="px-6 py-4">注册时间</th>
                  <th className="px-6 py-4">KYC 状态</th>
                  <th className="px-6 py-4">账户状态</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/5">
                    <td className="px-6 py-5 font-bold">{user.uid}</td>
                    <td className="px-6 py-5 text-slate-300">{user.email}</td>
                    <td className="px-6 py-5 text-slate-400">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-5"><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">{kycLabel(user.kycStatus)}</span></td>
                    <td className="px-6 py-5"><span className={statusClass(user.accountStatus)}>{user.accountStatus.toUpperCase()}</span></td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(user.id, "active")} className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">启用</button>
                        <button onClick={() => updateStatus(user.id, "inactive")} className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-300/10">停用</button>
                        <button onClick={() => updateStatus(user.id, "frozen")} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">冻结</button>
                        <button onClick={() => setSelectedUser(user)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10">查看详情</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">暂无注册用户。</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
