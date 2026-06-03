"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGates";
import { useLanguage } from "@/components/LanguageProvider";
import { getCurrentUser } from "@/lib/mock-auth";
import { DemoShell } from "../components/DemoLayout";

type Balance = { asset: string; available: string; frozen: string };
type Market = { baseAsset: string; latestPrice: string };

function fmt(value: string | number, digits = 6) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function ExchangeAssetsPage() {
  const { t } = useLanguage();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      const params = new URLSearchParams();
      if (user?.id) params.set("userId", user.id);
      if (user?.email) params.set("email", user.email);
      try {
        const [balanceResponse, marketResponse] = await Promise.all([
          fetch(`/api/assets/balances?${params.toString()}`, { cache: "no-store" }),
          fetch("/api/markets/list", { cache: "no-store" }),
        ]);
        const balanceData = await balanceResponse.json();
        const marketData = await marketResponse.json();
        setBalances(balanceData.balances ?? []);
        setMarkets(marketData.markets ?? []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    map.set("USDT", 1);
    markets.forEach((item) => map.set(item.baseAsset, Number(item.latestPrice)));
    return map;
  }, [markets]);

  const totalValue = balances.reduce((sum, item) => sum + (Number(item.available) + Number(item.frozen)) * (priceMap.get(item.asset) ?? 0), 0);

  return (
    <DemoShell titleKey="assets" active="assets">
      <AuthGate message={t("loginToContinue")}>
        <section className="px-5 py-5">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5"><p className="text-sm text-cyan-100">{t("totalEstimatedValue")}</p><h2 className="mt-2 text-4xl font-black">${fmt(totalValue, 2)}</h2><p className="mt-2 text-xs font-bold text-cyan-200">Account assets</p></div>
          <div className="mt-4 grid grid-cols-3 gap-3"><Link href="/exchange-demo/deposit" className="rounded-2xl bg-cyan-300 py-4 text-center text-sm font-black text-slate-950">{t("deposit")}</Link><Link href="/exchange-demo/withdraw" className="rounded-2xl border border-white/15 py-4 text-center text-sm font-bold">{t("withdraw")}</Link><Link href="/exchange-demo/transactions" className="rounded-2xl border border-white/15 py-4 text-center text-sm font-bold">Records</Link></div>
        </section>
        <section className="space-y-3 px-5">
          {loading ? <p className="p-4 text-sm text-slate-400">Loading...</p> : balances.length === 0 ? <p className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm text-slate-400">No balances yet.</p> : balances.map((item) => {
            const value = (Number(item.available) + Number(item.frozen)) * (priceMap.get(item.asset) ?? 0);
            return <article key={item.asset} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"><div className="flex justify-between"><h3 className="text-lg font-black">{item.asset}</h3><span className="text-sm font-bold text-cyan-200">${fmt(value, 2)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">{t("available")}</p><p className="mt-1 font-black">{fmt(item.available, 8)}</p></div><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">{t("frozen")}</p><p className="mt-1 font-black text-amber-200">{fmt(item.frozen, 8)}</p></div></div><p className="mt-3 text-xs text-slate-500">{t("estimatedValue")}: ${fmt(value, 2)}</p></article>;
          })}
        </section>
      </AuthGate>
    </DemoShell>
  );
}

