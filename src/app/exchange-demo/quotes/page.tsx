"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { normalizeSymbol } from "@/lib/htx-market";
import { DemoShell } from "../components/DemoLayout";

type QuoteRow = {
  pair: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fallback?: boolean;
};

const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "LTC/USDT"];
const tabs = ["hot", "USDT", "meme", "layer1", "ai", "defi"] as const;

const fallbackQuotes: QuoteRow[] = [
  { pair: "BTC/USDT", lastPrice: 68421.2, change24h: 2.84, high24h: 69180, low24h: 66120.4, volume24h: 42000 },
  { pair: "ETH/USDT", lastPrice: 3724.88, change24h: 1.46, high24h: 3812.6, low24h: 3610.2, volume24h: 316000 },
  { pair: "SOL/USDT", lastPrice: 184.32, change24h: 5.19, high24h: 189.8, low24h: 171.9, volume24h: 2100000 },
  { pair: "BNB/USDT", lastPrice: 612.45, change24h: 0.74, high24h: 620, low24h: 598.5, volume24h: 870000 },
  { pair: "XRP/USDT", lastPrice: 0.6421, change24h: -0.72, high24h: 0.661, low24h: 0.6312, volume24h: 110000000 },
  { pair: "DOGE/USDT", lastPrice: 0.1648, change24h: 3.08, high24h: 0.1712, low24h: 0.154, volume24h: 180000000 },
  { pair: "LTC/USDT", lastPrice: 86.42, change24h: -0.32, high24h: 88.1, low24h: 83.8, volume24h: 1200000 },
];

function fmt(value: string | number, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function QuotesPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("hot");
  const [quotes, setQuotes] = useState<QuoteRow[]>(fallbackQuotes);

  useEffect(() => {
    async function loadQuotes() {
      const rows = await Promise.all(
        pairs.map(async (pair) => {
          try {
            const response = await fetch(`/api/htx/ticker?symbol=${normalizeSymbol(pair)}`, { cache: "no-store" });
            const data = await response.json();
            return {
              pair,
              lastPrice: Number(data.lastPrice ?? 0),
              change24h: Number(data.change24h ?? 0),
              high24h: Number(data.high24h ?? 0),
              low24h: Number(data.low24h ?? 0),
              volume24h: Number(data.volume24h ?? 0),
              fallback: Boolean(data.fallback),
            };
          } catch {
            return fallbackQuotes.find((item) => item.pair === pair) ?? fallbackQuotes[0];
          }
        }),
      );
      setQuotes(rows);
    }

    void loadQuotes();
  }, []);

  const filtered = useMemo(() => quotes.filter((item) => item.pair.toLowerCase().includes(query.toLowerCase())), [quotes, query]);

  return (
    <DemoShell titleKey="quotes" active="quotes">
      <section className="px-5 py-5">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCoin")} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300" />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950" : "rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-300"}>{tab === "USDT" ? "USDT" : t(tab)}</button>)}
        </div>
      </section>
      <section className="px-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  <th className="px-4 py-3">{t("name")}</th>
                  <th className="px-4 py-3">Last Price</th>
                  <th className="px-4 py-3">24H Change</th>
                  <th className="px-4 py-3">24H High</th>
                  <th className="px-4 py-3">24H Low</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.pair} className="border-t border-white/5">
                    <td className="px-4 py-4 font-black"><Link href={`/exchange-demo/trading?pair=${item.pair.replace("/", "-")}`} className="hover:text-cyan-300">{item.pair}</Link></td>
                    <td className="px-4 py-4 text-slate-300">{fmt(item.lastPrice, 8)}</td>
                    <td className={item.change24h >= 0 ? "px-4 py-4 font-bold text-emerald-300" : "px-4 py-4 font-bold text-rose-300"}>{item.change24h >= 0 ? "+" : ""}{fmt(item.change24h, 2)}%</td>
                    <td className="px-4 py-4 text-slate-300">{fmt(item.high24h, 8)}</td>
                    <td className="px-4 py-4 text-slate-300">{fmt(item.low24h, 8)}</td>
                    <td className="px-4 py-4 text-right text-slate-400">{fmt(item.volume24h, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DemoShell>
  );
}
