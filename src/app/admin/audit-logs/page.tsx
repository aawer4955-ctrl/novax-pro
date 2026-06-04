import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const adminId = typeof params.adminId === "string" ? params.adminId : undefined;
  const action = typeof params.action === "string" ? params.action : undefined;
  const auditLogs = await prisma.auditLog.findMany({
    where: { adminId, action: action ? { contains: action, mode: "insensitive" } : undefined },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Audit Trail</p>
          <h1 className="mt-3 text-4xl font-black">Audit Logs</h1>
          <p className="mt-3 text-slate-400">Read-only administrator action records. Audit logs cannot be deleted from the admin interface.</p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <form className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-3">
          <input name="adminId" defaultValue={adminId} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input name="action" defaultValue={action} placeholder="Action type" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <button className="rounded-lg bg-cyan-300 px-5 py-3 font-black text-slate-950">Filter</button>
        </form>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-black/25 text-slate-400"><tr>{["Time", "Admin", "Action", "Target", "Reason", "IP", "User Agent", "Before / After"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {auditLogs.map((item) => (
                <tr key={item.id} className="border-t border-white/5 align-top">
                  <td className="px-5 py-4 text-slate-400">{item.createdAt.toLocaleString()}</td>
                  <td className="px-5 py-4"><p className="font-bold">{item.adminEmail}</p><p className="font-mono text-xs text-slate-500">{item.adminId.slice(0, 10)}</p></td>
                  <td className="px-5 py-4 text-cyan-200">{item.action}</td>
                  <td className="px-5 py-4 text-slate-300">{item.targetType}:{item.targetId.slice(0, 10)}</td>
                  <td className="px-5 py-4 text-slate-400">{item.reason ?? "-"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.ipAddress ?? "-"}</td>
                  <td className="px-5 py-4 max-w-[220px] truncate text-slate-400">{item.userAgent ?? "-"}</td>
                  <td className="px-5 py-4 max-w-[360px]">
                    <details>
                      <summary className="cursor-pointer text-cyan-200">View detail</summary>
                      <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">{JSON.stringify({ beforeData: item.beforeData, afterData: item.afterData }, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">No audit logs.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
