"use client";

import Link from "next/link";
import { useState } from "react";

type KycStatus = "Pending" | "Manual Review" | "Approved" | "Rejected";
type KycRow = { id: string; email: string; level: string; submitted: string; status: KycStatus };

const initialKycRows: KycRow[] = [
  { id: "KYC-9042", email: "alex.chen@example.com", level: "Level 2", submitted: "2026-05-18 08:42", status: "Pending" },
  { id: "KYC-9043", email: "mira.liu@example.com", level: "Level 1", submitted: "2026-05-18 11:06", status: "Manual Review" },
  { id: "KYC-9044", email: "opsdesk@example.com", level: "Level 3", submitted: "2026-05-17 20:18", status: "Pending" },
];

export default function AdminKycPage() {
  const [kycRows, setKycRows] = useState<KycRow[]>(initialKycRows);
  const updateStatus = (id: string, status: KycStatus) => setKycRows((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">KYC Review</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Identity Operations</p><h2 className="mt-3 text-4xl font-black">KYC 审核</h2><p className="mt-3 text-slate-400">认证资料与审核管理。</p></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">审核 ID</th><th className="px-6 py-4">用户邮箱</th><th className="px-6 py-4">认证等级</th><th className="px-6 py-4">提交时间</th><th className="px-6 py-4">审核状态</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody>{kycRows.map((item) => (<tr key={item.id} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.id}</td><td className="px-6 py-5 text-slate-300">{item.email}</td><td className="px-6 py-5 text-cyan-200">{item.level}</td><td className="px-6 py-5 text-slate-400">{item.submitted}</td><td className="px-6 py-5"><span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">{item.status}</span></td><td className="px-6 py-5"><div className="flex justify-end gap-2"><button onClick={() => updateStatus(item.id, "Approved")} className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">通过</button><button onClick={() => updateStatus(item.id, "Rejected")} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">拒绝</button></div></td></tr>))}</tbody></table></div></section>
    </main>
  );
}
