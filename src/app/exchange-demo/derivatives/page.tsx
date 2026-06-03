"use client";

import { useState } from "react";
import { DemoShell } from "../components/DemoLayout";
import { useLanguage } from "@/components/LanguageProvider";
import { AuthGate } from "@/components/AuthGates";

const contracts = ["BTCUSDT Perpetual","ETHUSDT Perpetual","SOLUSDT Perpetual","BNBUSDT Perpetual","XRPUSDT Perpetual","DOGEUSDT Perpetual","AVAXUSDT Perpetual","LINKUSDT Perpetual"];
const leverages = ["1x", "5x", "10x", "20x", "50x", "100x"];
type Position = { contract: string; direction: "Long" | "Short"; leverage: string; margin: string };

export default function DerivativesPage() {
  const { t } = useLanguage();
  const [contract, setContract] = useState(contracts[0]);
  const [direction, setDirection] = useState<"Long" | "Short">("Long");
  const [leverage, setLeverage] = useState("10x");
  const [positions, setPositions] = useState<Position[]>([
    { contract: "BTCUSDT Perpetual", direction: "Long", leverage: "20x", margin: "250.00 USDT" },
  ]);
  const margin = `${(1000 / Number.parseInt(leverage)).toFixed(2)} USDT`;

  return (
    <DemoShell titleKey="derivativesDemo" active="derivatives">
      <AuthGate message="Please log in to use this platform feature.">
      <section className="px-5 py-5"><div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">{t("simulationOnly")} · {t("noRealFunds")}</div></section>
      <section className="space-y-4 px-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <label className="text-sm font-bold text-slate-300">Contract</label>
          <select value={contract} onChange={(event) => setContract(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none">{contracts.map((item) => <option key={item}>{item}</option>)}</select>
          <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setDirection("Long")} className={direction === "Long" ? "rounded-2xl bg-emerald-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>{t("long")}</button><button onClick={() => setDirection("Short")} className={direction === "Short" ? "rounded-2xl bg-rose-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>{t("short")}</button></div>
          <div className="mt-4 grid grid-cols-3 gap-2">{leverages.map((item) => <button key={item} onClick={() => setLeverage(item)} className={leverage === item ? "rounded-xl bg-cyan-300 py-2 text-sm font-black text-slate-950" : "rounded-xl border border-white/10 py-2 text-sm font-bold"}>{item}</button>)}</div>
          <div className="mt-4 rounded-2xl bg-black/25 p-4"><p className="text-sm text-slate-500">{t("margin")}</p><p className="mt-1 text-2xl font-black">{margin}</p></div>
          <button onClick={() => setPositions((current) => [{ contract, direction, leverage, margin }, ...current])} className="mt-4 w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950">{t("demoPositions")}</button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><h2 className="text-xl font-black">{t("demoPositions")}</h2><div className="mt-4 space-y-3">{positions.map((item, index) => <div key={`${item.contract}-${index}`} className="rounded-2xl bg-black/25 p-4 text-sm"><div className="flex justify-between"><span className="font-bold">{item.contract}</span><span className={item.direction === "Long" ? "text-emerald-300" : "text-rose-300"}>{item.direction}</span></div><p className="mt-2 text-slate-400">Leverage {item.leverage} · Margin {item.margin}</p></div>)}</div></div>
      </section>      </AuthGate>
    </DemoShell>
  );
}



