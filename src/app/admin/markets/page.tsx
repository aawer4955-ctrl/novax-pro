"use client";

import { useEffect, useState } from "react";

type MarketRow = { id?: string; symbol: string; latestPrice: string; change24h: string; high24h: string; low24h: string; volume24h: string; isActive: boolean; sortOrder?: number };
const emptyMarket: MarketRow = { symbol: "", latestPrice: "0", change24h: "0", high24h: "0", low24h: "0", volume24h: "0", isActive: true, sortOrder: 0 };

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [newMarket, setNewMarket] = useState<MarketRow>(emptyMarket);
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/markets", { cache: "no-store" });
    const data = await response.json();
    setMarkets(data.markets ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async (market: MarketRow) => {
    if (!market.id) return;
    const response = await fetch("/api/admin/markets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(market) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Save failed");
    setMessage("Saved.");
    await load();
  };

  const create = async () => {
    const response = await fetch("/api/admin/markets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMarket) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Create failed");
    setMessage("Created.");
    setNewMarket(emptyMarket);
    await load();
  };

  const updateLocal = (id: string | undefined, key: keyof MarketRow, value: string | boolean) => {
    setMarkets((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p><h1 className="mt-3 text-4xl font-black">Market Management</h1><p className="mt-3 text-slate-400">Edit prices, 24H change, volume, high and low shown on the trading page.</p></div></header>
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {message && <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <h2 className="text-xl font-black">Add Market Pair</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-7">
            {(['symbol','latestPrice','change24h','high24h','low24h','volume24h'] as const).map((key) => <input key={key} value={String(newMarket[key])} onChange={(e) => setNewMarket({ ...newMarket, [key]: e.target.value })} placeholder={key} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />)}
            <button onClick={create} className="rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950">Add</button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr>{['Symbol','Price','24H %','High','Low','Volume','Active','Action'].map((h) => <th key={h} className="px-5 py-4 font-bold">{h}</th>)}</tr></thead><tbody>{markets.map((market) => <tr key={market.id ?? market.symbol} className="border-t border-white/5">{(['symbol','latestPrice','change24h','high24h','low24h','volume24h'] as const).map((key) => <td key={key} className="px-5 py-4"><input value={String(market[key] ?? '')} onChange={(e) => updateLocal(market.id, key, e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none" /></td>)}<td className="px-5 py-4"><input type="checkbox" checked={market.isActive} onChange={(e) => updateLocal(market.id, 'isActive', e.target.checked)} /></td><td className="px-5 py-4"><button onClick={() => save(market)} className="rounded-xl bg-cyan-300 px-4 py-2 font-black text-slate-950">Save</button></td></tr>)}</tbody></table></div></div>
      </section>
    </main>
  );
}
