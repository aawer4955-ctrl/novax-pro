"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { DemoShell } from "../components/DemoLayout";

const coins = ["USDT","BTC","ETH","SOL","BNB","XRP","DOGE","ADA","AVAX","TRX","TON","LINK","DOT","MATIC","LTC","BCH","SHIB","PEPE","UNI","AAVE","NEAR","ARB","OP","INJ","RNDR","FET","WLD","FIL","ATOM","ETC"];

export default function CoinsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => coins.filter((coin) => coin.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <DemoShell titleKey="coins" active="coins">
      <section className="px-5 py-5">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCoin")} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300" />
      </section>
      <section className="space-y-3 px-5">
        {filtered.map((coin, index) => (
          <article key={coin} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{coin}</h3><p className="mt-1 text-sm text-slate-400">{coin} Asset</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">{t("demoBalance")}</p><p className="mt-1 font-black">{(1000 / (index + 1)).toFixed(4)}</p></div><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">{t("estimatedValue")}</p><p className="mt-1 font-black">${(2400 / (index + 1)).toFixed(2)}</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><Link href="/demo-placeholder" className="rounded-2xl bg-cyan-300 py-3 text-center text-sm font-black text-slate-950">{t("deposit")}</Link><Link href="/demo-placeholder" className="rounded-2xl border border-white/15 py-3 text-center text-sm font-bold">{t("withdraw")}</Link></div>
          </article>
        ))}
      </section>
    </DemoShell>
  );
}
