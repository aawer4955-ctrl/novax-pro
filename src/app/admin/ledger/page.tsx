import { LedgerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLedgerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const asset = typeof params.asset === "string" ? params.asset.toUpperCase() : undefined;
  const type = typeof params.type === "string" && Object.values(LedgerType).includes(params.type as LedgerType) ? params.type as LedgerType : undefined;
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { userId, asset, type },
    include: { user: { select: { email: true, uid: true } }, createdByAdmin: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Finance Ledger</p>
          <h1 className="mt-3 text-4xl font-black">Ledger</h1>
          <p className="mt-3 text-slate-400">Read-only capital flow records with user, asset, type, reason, and administrator source.</p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <form className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-5">
          <input name="userId" defaultValue={userId} placeholder="User ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input name="asset" defaultValue={asset} placeholder="Asset" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <select name="type" defaultValue={type} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none">
            <option value="" className="bg-[#07111f]">All Types</option>
            {Object.values(LedgerType).map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
          </select>
          <input name="from" placeholder="From date" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Filter</button>
        </form>
        <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-bold text-slate-300">Export CSV</button>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-black/25 text-slate-400"><tr>{["Time", "User", "Asset", "Type", "Amount", "Before", "After", "Reference", "Reason", "Admin"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-white/5">
                  <td className="px-5 py-4 text-slate-400">{entry.createdAt.toLocaleString()}</td>
                  <td className="px-5 py-4"><p className="font-bold">{entry.user.email}</p><p className="text-xs text-slate-500">{entry.user.uid}</p></td>
                  <td className="px-5 py-4 text-cyan-200">{entry.asset}</td>
                  <td className="px-5 py-4">{entry.type}</td>
                  <td className={Number(entry.amount) >= 0 ? "px-5 py-4 font-bold text-emerald-300" : "px-5 py-4 font-bold text-rose-300"}>{entry.amount.toString()}</td>
                  <td className="px-5 py-4 text-slate-300">{entry.beforeBalance.toString()}</td>
                  <td className="px-5 py-4 text-slate-300">{entry.afterBalance.toString()}</td>
                  <td className="px-5 py-4 text-slate-400">{entry.referenceType ?? "-"} {entry.referenceId?.slice(0, 8) ?? ""}</td>
                  <td className="px-5 py-4 text-slate-400">{entry.reason ?? "-"}</td>
                  <td className="px-5 py-4 text-slate-400">{entry.createdByAdmin?.email ?? "-"}</td>
                </tr>
              ))}
              {ledgerEntries.length === 0 && <tr><td colSpan={10} className="px-5 py-8 text-center text-slate-400">No ledger entries.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
