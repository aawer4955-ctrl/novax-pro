import Link from "next/link";
import { AccountStatus, DepositStatus, OrderStatus, WithdrawalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function decimalSum(rows: { available: unknown; frozen: unknown }[]) {
  return rows.reduce((sum, row) => sum + Number(row.available ?? 0) + Number(row.frozen ?? 0), 0);
}

function fmt(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default async function AdminPage() {
  const [
    totalUsers,
    activeUsers,
    pendingKyc,
    totalDeposits,
    totalWithdrawals,
    pendingWithdrawals,
    openOrders,
    balances,
    riskAlerts,
    latestActions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { accountStatus: AccountStatus.ACTIVE } }),
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.depositRequest.count({ where: { status: DepositStatus.APPROVED } }),
    prisma.withdrawalRequest.count(),
    prisma.withdrawalRequest.count({ where: { status: WithdrawalStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.OPEN } }),
    prisma.assetBalance.findMany({ select: { available: true, frozen: true } }),
    prisma.riskEvent.count({ where: { severity: { in: ["MEDIUM", "HIGH"] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const metrics = [
    ["Total Users", fmt(totalUsers), "Registered accounts"],
    ["Active Users", fmt(activeUsers), "Enabled accounts"],
    ["Pending KYC", fmt(pendingKyc), "Waiting for review"],
    ["Total Deposits", fmt(totalDeposits), "Approved records"],
    ["Total Withdrawals", fmt(totalWithdrawals), "All requests"],
    ["Pending Withdrawals", fmt(pendingWithdrawals), "Need finance review"],
    ["Open Orders", fmt(openOrders), "Active order book items"],
    ["Total Estimated Platform Assets", fmt(decimalSum(balances)), "Available plus frozen"],
    ["Risk Alerts", fmt(riskAlerts), "Medium and high severity"],
  ];

  const entries = [
    ["Users", "/admin/users"],
    ["Balances", "/admin/balances"],
    ["Ledger", "/admin/ledger"],
    ["Deposits", "/admin/deposits"],
    ["Withdrawals", "/admin/withdrawals"],
    ["Orders", "/admin/orders"],
    ["Markets", "/admin/markets"],
    ["Audit Logs", "/admin/audit-logs"],
    ["Risk Control", "/admin/risk"],
    ["Settings", "/admin/settings"],
  ];

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#050814_0%,#07152b_55%,#031017_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Platform Administration</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">Admin Dashboard</h1>
          <p className="mt-4 max-w-2xl leading-8 text-slate-300">Central control for users, balances, deposits, withdrawals, orders, markets, risk, and audit records.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map(([label, value, note]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-black">{value}</p>
              <p className="mt-2 text-sm text-cyan-200">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <h2 className="text-xl font-black">Quick Entries</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {entries.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/10">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-xl font-black">Latest Admin Actions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-black/25 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Admin</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {latestActions.map((item) => (
                    <tr key={item.id} className="border-t border-white/5">
                      <td className="px-5 py-4 font-bold">{item.adminEmail}</td>
                      <td className="px-5 py-4 text-cyan-200">{item.action}</td>
                      <td className="px-5 py-4 text-slate-300">{item.targetType}:{item.targetId.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-slate-400">{item.reason ?? "-"}</td>
                      <td className="px-5 py-4 text-slate-400">{item.createdAt.toLocaleString()}</td>
                    </tr>
                  ))}
                  {latestActions.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No admin actions yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
