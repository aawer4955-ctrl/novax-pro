"use client";

import Link from "next/link";
import { AuthGate } from "@/components/AuthGates";
import { useLanguage } from "@/components/LanguageProvider";

const accountCards = [
  {
    name: "Spot Account",
    label: "现货账户",
    value: "$86,420.18",
    change: "+2.41%",
    assets: "BTC, ETH, SOL, USDT",
  },
  {
    name: "Futures Account",
    label: "合约账户",
    value: "$42,780.55",
    change: "+5.12%",
    assets: "BTC-PERP, ETH-PERP",
  },
  {
    name: "Earn Account",
    label: "理财账户",
    value: "$18,905.33",
    change: "+0.82%",
    assets: "USDT Flexible, ETH Fixed",
  },
];

const ledgerRows = [
  {
    id: "NX20260518001",
    time: "2026-05-18 09:20",
    type: "Deposit",
    asset: "USDT",
    amount: "+12,000.00",
    account: "Spot Account",
    status: "Completed",
  },
  {
    id: "NX20260518002",
    time: "2026-05-18 10:45",
    type: "Transfer",
    asset: "BTC",
    amount: "-0.1800",
    account: "Futures Account",
    status: "Completed",
  },
  {
    id: "NX20260518003",
    time: "2026-05-18 12:10",
    type: "Earn Subscribe",
    asset: "ETH",
    amount: "-4.2500",
    account: "Earn Account",
    status: "Processing",
  },
  {
    id: "NX20260518004",
    time: "2026-05-18 15:32",
    type: "Withdrawal",
    asset: "USDT",
    amount: "-3,500.00",
    account: "Spot Account",
    status: "Reviewing",
  },
];

export default function AssetsPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-tight">NovaX Pro</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              {t("assetCenter")}
            </p>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/10"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>
      <AuthGate message={t("loginToContinue")}>

      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#050814_0%,#07152b_50%,#031017_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Portfolio Overview
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-6xl">{t("assetCenter")}</h2>
              <p className="mt-4 max-w-2xl leading-8 text-slate-300">
                这里展示资产估值、账户分布和{t("fundLedger")}，不接入真实{t("deposit")}、{t("withdraw")}或交易服务。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-2xl bg-cyan-300 px-8 py-4 font-black text-slate-950 hover:bg-cyan-200"
              >
                {t("deposit")}
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-black hover:bg-white/10"
              >
                {t("withdraw")}
              </button>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-8">
            <p className="text-sm text-cyan-100">{t("totalAssets")}</p>
            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-5xl font-black md:text-7xl">$148,106.06</p>
                <p className="mt-3 text-slate-300">≈ 2.1648 BTC · </p>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-emerald-200">
                24H PnL +$4,280.50
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 lg:grid-cols-3">
          {accountCards.map((account) => (
            <div
              key={account.name}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{account.label}</p>
                  <h3 className="mt-2 text-2xl font-black">{account.name}</h3>
                </div>
                <span className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
                  {account.change}
                </span>
              </div>
              <p className="mt-8 text-3xl font-black">{account.value}</p>
              <p className="mt-3 text-sm text-slate-400">{account.assets}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-6 py-5 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black">{t("fundLedger")}</h3>
              <p className="mt-1 text-sm text-slate-400">Recent asset ledger records</p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
            >
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Time</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Asset</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Account</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Record ID</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="px-6 py-5 text-slate-300">{row.time}</td>
                    <td className="px-6 py-5 font-bold">{row.type}</td>
                    <td className="px-6 py-5">{row.asset}</td>
                    <td
                      className={`px-6 py-5 font-bold ${
                        row.amount.startsWith("+") ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {row.amount}
                    </td>
                    <td className="px-6 py-5 text-slate-300">{row.account}</td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500">{row.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
          </AuthGate>
    </main>
  );
}




