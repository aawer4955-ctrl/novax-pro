import Link from "next/link";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";

const logs = [
  { admin: "admin@novax.pro", type: "Freeze User", object: "UID 10024020", ip: "104.28.12.90", time: "2026-05-18 09:15:22" },
  { admin: "risk@novax.pro", type: "Mark Withdrawal Risk", object: "WD-8129", ip: "18.167.44.12", time: "2026-05-18 10:40:09" },
  { admin: "ops@novax.pro", type: "Publish Announcement", object: "ANN-1201", ip: "35.201.88.31", time: "2026-05-18 11:02:48" },
  { admin: "finance@novax.pro", type: "Manual Balance Adjust", object: "alex.chen@example.com", ip: "52.74.19.210", time: "2026-05-18 12:16:33" },
];

export default function AdminLogsPage() {
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Operation Logs</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Audit Trail</p><h2 className="mt-3 text-4xl font-black">操作日志</h2><p className="mt-3 text-slate-400">记录管理员账号、操作类型、对象、IP 与时间。</p></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">管理员账号</th><th className="px-6 py-4">操作类型</th><th className="px-6 py-4">操作对象</th><th className="px-6 py-4">IP 地址</th><th className="px-6 py-4">操作时间</th></tr></thead><tbody>{logs.map((item) => (<tr key={`${item.admin}-${item.time}`} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.admin}</td><td className="px-6 py-5 text-cyan-200">{item.type}</td><td className="px-6 py-5 text-slate-300">{item.object}</td><td className="px-6 py-5 font-mono text-xs text-slate-400">{item.ip}</td><td className="px-6 py-5 text-slate-400">{item.time}</td></tr>))}</tbody></table></div></section>
    </main>
  );
}


