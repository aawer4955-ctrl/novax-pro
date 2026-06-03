"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";

type WithdrawalStatus = "Pending" | "Risk Review" | "Approved" | "Rejected" | "Risk";
type Withdrawal = { id: string; email: string; coin: string; network: string; address: string; amount: string; fee: string; status: WithdrawalStatus };

const initialWithdrawals: Withdrawal[] = [
  { id: "WD-8128", email: "mira.liu@example.com", coin: "USDT", network: "TRC20", address: "TQ9x...7Lpa", amount: "3,500.00", fee: "2.00", status: "Pending" },
  { id: "WD-8129", email: "opsdesk@example.com", coin: "ETH", network: "ERC20", address: "0x71ad...930e", amount: "2.4000", fee: "0.0040", status: "Risk Review" },
  { id: "WD-8130", email: "tradingdesk@example.com", coin: "BTC", network: "Bitcoin", address: "bc1q...p42m", amount: "0.6200", fee: "0.0004", status: "Pending" },
];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const updateStatus = (id: string, status: WithdrawalStatus) => setWithdrawals((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Withdrawal Review</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Risk Operations</p><h2 className="mt-3 text-4xl font-black">提现审核</h2><p className="mt-3 text-slate-400">审核动作仅更新状态。</p></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">申请 ID</th><th className="px-6 py-4">用户邮箱</th><th className="px-6 py-4">币种</th><th className="px-6 py-4">网络</th><th className="px-6 py-4">提现地址</th><th className="px-6 py-4">金额</th><th className="px-6 py-4">手续费</th><th className="px-6 py-4">状态</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody>{withdrawals.map((item) => (<tr key={item.id} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.id}</td><td className="px-6 py-5 text-slate-300">{item.email}</td><td className="px-6 py-5">{item.coin}</td><td className="px-6 py-5 text-slate-300">{item.network}</td><td className="px-6 py-5 font-mono text-xs text-cyan-200">{item.address}</td><td className="px-6 py-5 font-bold text-rose-300">{item.amount}</td><td className="px-6 py-5 text-slate-300">{item.fee}</td><td className="px-6 py-5"><span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">{item.status}</span></td><td className="px-6 py-5"><div className="flex justify-end gap-2"><button onClick={() => updateStatus(item.id, "Approved")} className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">通过</button><button onClick={() => updateStatus(item.id, "Rejected")} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">拒绝</button><button onClick={() => updateStatus(item.id, "Risk")} className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-300/10">标记风险</button></div></td></tr>))}</tbody></table></div></div></section>
    </main>
  );
}


