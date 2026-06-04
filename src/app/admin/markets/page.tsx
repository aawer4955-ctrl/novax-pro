"use client";

import { useEffect, useState } from "react";

type MarketRow = {
  id?: string;
  symbol: string;
  latestPrice: string;
  basePrice?: string;
  fallbackPrice?: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  minOrderAmount: string;
  pricePrecision: number;
  amountPrecision: number;
  useHtxData: boolean;
  isActive: boolean;
  sortOrder: number;
};

const emptyMarket: MarketRow = { symbol: "", latestPrice: "0", basePrice: "0", fallbackPrice: "0", change24h: "0", high24h: "0", low24h: "0", volume24h: "0", minOrderAmount: "0", pricePrecision: 2, amountPrecision: 6, useHtxData: true, isActive: true, sortOrder: 0 };

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [newMarket, setNewMarket] = useState<MarketRow>(emptyMarket);
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/markets", { cache: "no-store" });
    const data = await response.json();
    setMarkets(data.markets ?? []);
  };

  useEffect(() => { void load(); }, []);

  const payload = (market: MarketRow) => ({ ...market, adminId, reason });

  const save = async (market: MarketRow) => {
    const response = await fetch("/api/admin/markets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(market)) });
    const data = await response.json();
    setMessage(response.ok ? "Market change audited." : data.error ?? "Save failed.");
    await load();
  };

  const create = async () => {
    const response = await fetch("/api/admin/markets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(newMarket)) });
    const data = await response.json();
    setMessage(response.ok ? "Market created and audited." : data.error ?? "Create failed.");
    if (response.ok) setNewMarket(emptyMarket);
    await load();
  };

  const updateLocal = (id: string | undefined, key: keyof MarketRow, value: string | boolean | number) => {
    setMarkets((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const fieldKeys = ["symbol", "latestPrice", "basePrice", "fallbackPrice", "change24h", "high24h", "low24h", "volume24h", "minOrderAmount"] as const;

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Market Control</p><h1 className="mt-3 text-4xl font-black">Markets</h1><p className="mt-3 text-slate-400">Manage trading pairs, pricing source, fallback price, order limits, precision, sorting, and active status.</p></div></header>
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-2">
          <input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
          <h2 className="text-xl font-black">Add Market Pair</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {fieldKeys.map((key) => <input key={key} value={String(newMarket[key] ?? "")} onChange={(e) => setNewMarket({ ...newMarket, [key]: key === "symbol" ? e.target.value.toUpperCase() : e.target.value })} placeholder={key} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />)}
            <input type="number" value={newMarket.pricePrecision} onChange={(e) => setNewMarket({ ...newMarket, pricePrecision: Number(e.target.value) })} placeholder="pricePrecision" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
            <input type="number" value={newMarket.amountPrecision} onChange={(e) => setNewMarket({ ...newMarket, amountPrecision: Number(e.target.value) })} placeholder="amountPrecision" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3"><input type="checkbox" checked={newMarket.useHtxData} onChange={(e) => setNewMarket({ ...newMarket, useHtxData: e.target.checked })} /> Use HTX</label>
            <button onClick={create} className="rounded-lg bg-cyan-300 px-4 py-3 font-black text-slate-950">Add</button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]"><div className="overflow-x-auto"><table className="w-full min-w-[1550px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr>{["Symbol", "Price", "Base", "Fallback", "24H %", "High", "Low", "Volume", "Min Order", "Price Precision", "Amount Precision", "Sort", "HTX", "Active", "Action"].map((h) => <th key={h} className="px-4 py-4">{h}</th>)}</tr></thead><tbody>{markets.map((market) => <tr key={market.id ?? market.symbol} className="border-t border-white/5">{fieldKeys.map((key) => <td key={key} className="px-4 py-4"><input value={String(market[key] ?? "")} onChange={(e) => updateLocal(market.id, key, key === "symbol" ? e.target.value.toUpperCase() : e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none" /></td>)}<td className="px-4 py-4"><input type="number" value={market.pricePrecision} onChange={(e) => updateLocal(market.id, "pricePrecision", Number(e.target.value))} className="w-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none" /></td><td className="px-4 py-4"><input type="number" value={market.amountPrecision} onChange={(e) => updateLocal(market.id, "amountPrecision", Number(e.target.value))} className="w-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none" /></td><td className="px-4 py-4"><input type="number" value={market.sortOrder} onChange={(e) => updateLocal(market.id, "sortOrder", Number(e.target.value))} className="w-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none" /></td><td className="px-4 py-4"><input type="checkbox" checked={market.useHtxData} onChange={(e) => updateLocal(market.id, "useHtxData", e.target.checked)} /></td><td className="px-4 py-4"><input type="checkbox" checked={market.isActive} onChange={(e) => updateLocal(market.id, "isActive", e.target.checked)} /></td><td className="px-4 py-4"><button onClick={() => save(market)} className="rounded-lg bg-cyan-300 px-4 py-2 font-black text-slate-950">Save</button></td></tr>)}</tbody></table></div></div>
      </section>
    </main>
  );
}
