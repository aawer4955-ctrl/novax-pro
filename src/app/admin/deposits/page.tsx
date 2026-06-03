"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";

type DepositStatus = "Pending" | "Confirming" | "Manual Review" | "Approved" | "Rejected";
type Deposit = { id: string; email: string; coin: string; network: string; amount: string; txid: string; status: DepositStatus };

const initialDeposits: Deposit[] = [
  { id: "DEP-9021", email: "alex.chen@example.com", coin: "USDT", network: "TRC20", amount: "12,000.00", txid: "0x8a21...f093", status: "Pending" },
  { id: "DEP-9022", email: "mira.liu@example.com", coin: "ETH", network: "ERC20", amount: "4.2500", txid: "0x41cd...91ab", status: "Confirming" },
  { id: "DEP-9023", email: "tradingdesk@example.com", coin: "BTC", network: "Bitcoin", amount: "1.8420", txid: "bc1q...t9xp", status: "Manual Review" },
];

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
  const updateStatus = (id: string, status: DepositStatus) => setDeposits((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Deposit Review</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Review Queue</p><h2 className="mt-3 text-4xl font-black">充值审核</h2><p className="mt-3 text-slate-400">通过或拒绝充值申请。</p></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">申请 ID</th><th className="px-6 py-4">用户邮箱</th><th className="px-6 py-4">币种</th><th className="px-6 py-4">网络</th><th className="px-6 py-4">金额</th><th className="px-6 py-4">TxID</th><th className="px-6 py-4">状态</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody>{deposits.map((item) => (<tr key={item.id} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.id}</td><td className="px-6 py-5 text-slate-300">{item.email}</td><td className="px-6 py-5">{item.coin}</td><td className="px-6 py-5 text-slate-300">{item.network}</td><td className="px-6 py-5 font-bold text-emerald-300">{item.amount}</td><td className="px-6 py-5 font-mono text-xs text-cyan-200">{item.txid}</td><td className="px-6 py-5"><span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">{item.status}</span></td><td className="px-6 py-5"><div className="flex justify-end gap-2"><button onClick={() => updateStatus(item.id, "Approved")} className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">通过</button><button onClick={() => updateStatus(item.id, "Rejected")} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">拒绝</button></div></td></tr>))}</tbody></table></div></div></section>
    </main>
  );
}


