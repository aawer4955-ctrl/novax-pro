"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const metricItems = [
  { key: "userCount", value: "128,460", trend: "+1,248 this week" },
  { key: "todayDeposit", value: "$842,500", trend: "+18.6% vs yesterday" },
  { key: "todayWithdraw", value: "$316,900", trend: "72 orders" },
  { key: "pendingKyc", value: "238", trend: "High priority" },
  { key: "pendingWithdrawals", value: "46", trend: "$91,240 pending" },
] as const;

const entryCards = [
  { title: "User Management", desc: "User status, risk profile, and account overview.", href: "/admin/users" },
  { title: "Asset Management", desc: "Balances, frozen funds, ledgers, and account adjustments.", href: "/admin/assets" },
  { title: "Deposit Review", desc: "Deposit records and manual review status.", href: "/admin/deposits" },
  { title: "Withdrawal Review", desc: "Withdrawal applications, risk hits, and whitelist checks.", href: "/admin/withdrawals" },
  { title: "KYC Review", desc: "Identity level and manual approval workflow.", href: "/admin/kyc" },
  { title: "Announcements", desc: "Platform notices and maintenance messages.", href: "/admin/announcements" },
  { title: "Market Management", desc: "Edit trading pairs, latest prices, 24H change, high/low and volume.", href: "/admin/markets" },
  { title: "Order Management", desc: "Review orders and manually update order status.", href: "/admin/orders" },
  { title: "Send Deposit Address", desc: "Assign deposit addresses to selected users by asset and network.", href: "/admin/send-address" },
  { title: "Address Management", desc: "Deposit addresses, withdrawal addresses, and address status controls.", href: "/admin/addresses" },
  { title: "Operation Logs", desc: "Admin actions, IP addresses, and audit records.", href: "/admin/logs" },
];

const reviewQueue = [
  { id: "KYC-9042", user: "alex.chen@example.com", type: "KYC", risk: "Medium", status: "Pending" },
  { id: "WD-8128", user: "mira.liu@example.com", type: "Withdrawal", risk: "High", status: "Manual Review" },
  { id: "DEP-5520", user: "tradingdesk@example.com", type: "Deposit", risk: "Low", status: "Confirming" },
];

export default function AdminPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5"><Link href="/"><h1 className="text-2xl font-black tracking-tight">NovaX Pro</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{t("admin")}</p></Link><nav className="flex items-center gap-5 text-sm text-slate-300"><Link href="/" className="hover:text-white">{t("home")}</Link><Link href="/assets" className="hover:text-white">{t("assets")}</Link><Link href="/login" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/10">{t("login")}</Link></nav></div></header>
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#050814_0%,#07152b_50%,#031017_100%)]"><div className="mx-auto max-w-7xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">{t("platformAdminConsole")}</p><div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h2 className="text-4xl font-black md:text-6xl">{t("adminDashboard")}</h2><p className="mt-4 max-w-2xl leading-8 text-slate-300">Centralized management for users, assets, markets, orders, reviews, and operational records.</p></div></div></div></section>
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">{metricItems.map((metric) => <div key={metric.key} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"><p className="text-sm text-slate-400">{t(metric.key)}</p><p className="mt-4 text-3xl font-black">{metric.value}</p><p className="mt-3 text-sm text-cyan-200">{metric.trend}</p></div>)}</div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"><div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"><div className="mb-6"><h3 className="text-2xl font-black">{t("managementEntries")}</h3><p className="mt-2 text-sm text-slate-400">Admin operation modules</p></div><div className="grid gap-4 sm:grid-cols-2">{entryCards.map((item) => <Link key={item.title} href={item.href} className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"><h4 className="font-black">{item.title}</h4><p className="mt-3 text-sm leading-6 text-slate-400">{item.desc}</p></Link>)}</div></div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="border-b border-white/10 px-6 py-5"><h3 className="text-2xl font-black">{t("reviewQueue")}</h3><p className="mt-1 text-sm text-slate-400">KYC, deposit, and withdrawal review samples</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4 font-bold">ID</th><th className="px-6 py-4 font-bold">User</th><th className="px-6 py-4 font-bold">Type</th><th className="px-6 py-4 font-bold">Risk</th><th className="px-6 py-4 font-bold">Status</th></tr></thead><tbody>{reviewQueue.map((item) => <tr key={item.id} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.id}</td><td className="px-6 py-5 text-slate-300">{item.user}</td><td className="px-6 py-5">{item.type}</td><td className="px-6 py-5"><span className={item.risk === "High" ? "rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300" : item.risk === "Medium" ? "rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200" : "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300"}>{item.risk}</span></td><td className="px-6 py-5 text-cyan-200">{item.status}</td></tr>)}</tbody></table></div></div></div>
      </section>
    </main>
  );
}


