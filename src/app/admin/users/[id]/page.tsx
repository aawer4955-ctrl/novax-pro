import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      balances: { orderBy: { asset: "asc" } },
      depositAddresses: { orderBy: { createdAt: "desc" } },
      withdrawalAddresses: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      withdrawalRequests: { orderBy: { createdAt: "desc" }, take: 20 },
      adminAuditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      ledgerEntries: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin/users" className="text-sm font-bold text-cyan-200">Back to Users</Link>
          <h1 className="mt-3 text-4xl font-black">{user.email}</h1>
          <p className="mt-3 text-slate-400">UID {user.uid} · {user.role} · {user.accountStatus}</p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["KYC Status", user.kycStatus],
            ["Account Status", user.accountStatus],
            ["Registered", user.createdAt.toLocaleString()],
            ["Last Login", user.lastLoginAt?.toLocaleString() ?? "-"],
            ["Withdrawal Restriction", user.withdrawalRestricted ? "Restricted" : "Normal"],
            ["Password Reset", user.passwordResetRequired ? "Required" : "Not required"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
          Balance adjustments are recorded permanently.
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Assets">
            {user.balances.map((item) => <Row key={item.id} label={item.asset} value={`Available ${item.available} · Frozen ${item.frozen}`} />)}
            {user.balances.length === 0 && <Empty />}
          </Panel>
          <Panel title="Deposit Addresses">
            {user.depositAddresses.map((item) => <Row key={item.id} label={`${item.asset} ${item.network}`} value={`${item.address} · ${item.status}`} />)}
            {user.depositAddresses.length === 0 && <Empty />}
          </Panel>
          <Panel title="Withdrawal Addresses">
            {user.withdrawalAddresses.map((item) => <Row key={item.id} label={`${item.asset} ${item.network}`} value={`${item.address} · ${item.isWhitelisted ? "Whitelisted" : "Not whitelisted"}`} />)}
            {user.withdrawalAddresses.length === 0 && <Empty />}
          </Panel>
          <Panel title="Orders">
            {user.orders.map((item) => <Row key={item.id} label={`${item.pair} ${item.side}`} value={`${item.status} · Amount ${item.amount} · Price ${item.price ?? "-"}`} />)}
            {user.orders.length === 0 && <Empty />}
          </Panel>
          <Panel title="Withdrawal Records">
            {user.withdrawalRequests.map((item) => <Row key={item.id} label={`${item.asset} ${item.network}`} value={`${item.status} · ${item.amount} · ${item.destinationAddress}`} />)}
            {user.withdrawalRequests.length === 0 && <Empty />}
          </Panel>
          <Panel title="Audit Records">
            {user.adminAuditLogs.map((item) => <Row key={item.id} label={item.action} value={`${item.targetType}:${item.targetId.slice(0, 8)} · ${item.createdAt.toLocaleString()}`} />)}
            {user.adminAuditLogs.length === 0 && <Empty />}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="font-bold text-cyan-100">{label}</p>
      <p className="mt-1 break-all text-sm text-slate-400">{value}</p>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-slate-400">No records.</p>;
}
