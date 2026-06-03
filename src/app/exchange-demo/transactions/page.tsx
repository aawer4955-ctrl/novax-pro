"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "../components/DemoLayout";
import { AuthGate } from "@/components/AuthGates";
import { getCurrentUser } from "@/lib/mock-auth";

type Row = { id: string; asset: string; network: string; amount: string; status: string; createdAt: string; txHash?: string; destinationAddress?: string };

export default function TransactionsPage() {
  const [tab, setTab] = useState<"deposits" | "withdrawals">("deposits");
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      const params = new URLSearchParams();
      if (user?.id) params.set("userId", user.id);
      const response = await fetch(`/api/${tab}/list?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      setRows(data[tab] ?? []);
    };
    void load();
  }, [tab]);
  return <DemoShell titleKey="demoAssets" active="assets"><AuthGate><section className="px-5 py-5"><div className="grid grid-cols-2 gap-3"><button onClick={() => setTab("deposits")} className={tab === "deposits" ? "rounded-2xl bg-cyan-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Deposits</button><button onClick={() => setTab("withdrawals")} className={tab === "withdrawals" ? "rounded-2xl bg-cyan-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Withdrawals</button></div><div className="mt-5 space-y-3">{rows.length === 0 ? <p className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm text-slate-400">No records.</p> : rows.map((row) => <div key={row.id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm"><div className="flex justify-between"><b>{row.asset}</b><span className="text-cyan-200">{row.status}</span></div><p className="mt-2 text-slate-400">{row.amount} · {row.network}</p><p className="mt-1 text-xs text-slate-500">{new Date(row.createdAt).toLocaleString()}</p></div>)}</div></section></AuthGate></DemoShell>;
}
