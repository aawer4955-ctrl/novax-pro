"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminComplianceStrip } from "@/components/admin/AdminComplianceStrip";

type AssetRow = {
  email: string;
  spot: number;
  futures: number;
  earn: number;
  frozen: number;
};

type LedgerRow = {
  time: string;
  email: string;
  type: string;
  asset: string;
  amount: string;
  note: string;
};

const initialAssets: AssetRow[] = [
  { email: "alex.chen@example.com", spot: 42380.1, futures: 28910.52, earn: 11119.6, frozen: 500 },
  { email: "mira.liu@example.com", spot: 8420, futures: 6900.75, earn: 3410.15, frozen: 0 },
  { email: "opsdesk@example.com", spot: 1200, futures: 2400, earn: 520, frozen: 4120 },
  { email: "tradingdesk@example.com", spot: 126880.45, futures: 94500, earn: 25600, frozen: 8000 },
];

const initialLedger: LedgerRow[] = [
  { time: "2026-05-18 09:20", email: "alex.chen@example.com", type: "Deposit", asset: "USDT", amount: "+12,000.00", note: "Mock chain confirmation" },
  { time: "2026-05-18 10:45", email: "mira.liu@example.com", type: "Transfer", asset: "BTC", amount: "-0.1800", note: "Spot to futures" },
  { time: "2026-05-18 12:10", email: "tradingdesk@example.com", type: "Manual Adjust", asset: "USDT", amount: "+5,000.00", note: "Admin simulation" },
];

const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminAssetsPage() {
  const [assetRows, setAssetRows] = useState<AssetRow[]>(initialAssets);
  const [ledger, setLedger] = useState<LedgerRow[]>(initialLedger);

  const adjustBalance = (email: string) => {
    setAssetRows((current) =>
      current.map((row) => (row.email === email ? { ...row, spot: row.spot + 1000 } : row))
    );
    setLedger((current) => [
      {
        time: "Now",
        email,
        type: "Manual Adjust",
        asset: "USDT",
        amount: "+1,000.00",
        note: "Frontend simulation",
      },
      ...current,
    ]);
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Asset Management</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <AdminComplianceStrip />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Back Office</p><h2 className="mt-3 text-4xl font-black">后台资产管理</h2><p className="mt-3 text-slate-400">点击每行按钮可给对应用户增加 1000 USDT 现货余额。</p></div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">用户邮箱</th><th className="px-6 py-4">现货账户余额</th><th className="px-6 py-4">合约账户余额</th><th className="px-6 py-4">理财账户余额</th><th className="px-6 py-4">冻结金额</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody>{assetRows.map((row) => (<tr key={row.email} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{row.email}</td><td className="px-6 py-5 text-emerald-300">{money(row.spot)}</td><td className="px-6 py-5 text-slate-300">{money(row.futures)}</td><td className="px-6 py-5 text-slate-300">{money(row.earn)}</td><td className="px-6 py-5 font-bold text-amber-200">{money(row.frozen)}</td><td className="px-6 py-5 text-right"><button onClick={() => adjustBalance(row.email)} className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-200">调整余额</button></td></tr>))}</tbody></table></div></div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="border-b border-white/10 px-6 py-5"><h3 className="text-2xl font-black">资金流水</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">时间</th><th className="px-6 py-4">用户邮箱</th><th className="px-6 py-4">类型</th><th className="px-6 py-4">币种</th><th className="px-6 py-4">金额</th><th className="px-6 py-4">备注</th></tr></thead><tbody>{ledger.map((row, index) => (<tr key={`${row.time}-${row.email}-${index}`} className="border-t border-white/5"><td className="px-6 py-5 text-slate-400">{row.time}</td><td className="px-6 py-5">{row.email}</td><td className="px-6 py-5 font-bold">{row.type}</td><td className="px-6 py-5">{row.asset}</td><td className={row.amount.startsWith("+") ? "px-6 py-5 font-bold text-emerald-300" : "px-6 py-5 font-bold text-rose-300"}>{row.amount}</td><td className="px-6 py-5 text-slate-400">{row.note}</td></tr>))}</tbody></table></div></div>
      </section>
    </main>
  );
}


