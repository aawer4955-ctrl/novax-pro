"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGates";
import { KlineChart, type KlinePoint } from "@/components/market/KlineChart";
import { getCurrentUser } from "@/lib/mock-auth";
import { normalizeSymbol } from "@/lib/htx-market";
import { DemoShell } from "../components/DemoLayout";

type Balance = { asset: string; available: string; frozen: string };
type OrderRow = { id: string; pair: string; side: string; type: string; amount: string; price: string; total?: string; fee: string; filledAmount?: string; status: string; createdAt: string };
type Ticker = { lastPrice: number; change24h: number; high24h: number; low24h: number; volume24h: number; quoteVolume24h: number; fallback?: boolean };
type DepthRow = { price: number; amount: number; total: number };
type TradeRow = { id: number; price: number; amount: number; side: "buy" | "sell"; time: number };

const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "LTC/USDT"];
const periods = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "15m", value: "15min" },
  { label: "1h", value: "60min" },
  { label: "4h", value: "4hour" },
  { label: "1d", value: "1day" },
];

const fallbackTicker: Ticker = {
  lastPrice: 68421.2,
  change24h: 0,
  high24h: 69180,
  low24h: 66120.4,
  volume24h: 42000,
  quoteVolume24h: 2410000000,
};

function pairFromQuery(value: string | null) {
  if (!value) return "BTC/USDT";
  const normalized = value.replace("-", "/").toUpperCase();
  return pairs.includes(normalized) ? normalized : "BTC/USDT";
}

function fmt(value: string | number, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function clock(value: number) {
  const date = new Date(value > 10_000_000_000 ? value : value * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TradingClient() {
  const searchParams = useSearchParams();
  const [pair, setPair] = useState(pairFromQuery(searchParams.get("pair")));
  const [period, setPeriod] = useState("1min");
  const [ticker, setTicker] = useState<Ticker>(fallbackTicker);
  const [klines, setKlines] = useState<KlinePoint[]>([]);
  const [bids, setBids] = useState<DepthRow[]>([]);
  const [asks, setAsks] = useState<DepthRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [priceInput, setPriceInput] = useState("");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(false);

  const latestPrice = Number(ticker.lastPrice || 0);
  const activePrice = orderType === "MARKET" ? latestPrice : Number(priceInput || latestPrice);
  const activeAmount = Number(amount || 0);
  const total = activePrice * activeAmount;
  const fee = total * 0.001;
  const [baseAsset, quoteAsset] = pair.split("/");
  const baseBalance = balances.find((item) => item.asset === baseAsset)?.available ?? "0";
  const quoteBalance = balances.find((item) => item.asset === quoteAsset)?.available ?? "0";
  const openOrders = orders.filter((item) => item.status === "OPEN");
  const historyOrders = orders.filter((item) => item.status !== "OPEN");
  const selectedPeriodLabel = useMemo(() => periods.find((item) => item.value === period)?.label ?? "1m", [period]);

  async function loadMarketData(selectedPair = pair, selectedPeriod = period) {
    const symbol = normalizeSymbol(selectedPair);
    const [klineResponse, tickerResponse, depthResponse, tradesResponse] = await Promise.all([
      fetch(`/api/htx/kline?symbol=${symbol}&period=${selectedPeriod}&size=200`, { cache: "no-store" }),
      fetch(`/api/htx/ticker?symbol=${symbol}`, { cache: "no-store" }),
      fetch(`/api/htx/depth?symbol=${symbol}`, { cache: "no-store" }),
      fetch(`/api/htx/trades?symbol=${symbol}`, { cache: "no-store" }),
    ]);

    const [klineData, tickerData, depthData, tradesData] = await Promise.all([
      klineResponse.json(),
      tickerResponse.json(),
      depthResponse.json(),
      tradesResponse.json(),
    ]);

    setKlines(klineData.data ?? []);
    setTicker(tickerData ?? fallbackTicker);
    setBids(depthData.bids ?? []);
    setAsks(depthData.asks ?? []);
    setTrades(tradesData.data ?? []);
    setPriceInput(String(tickerData?.lastPrice ?? fallbackTicker.lastPrice));
  }

  async function loadBalancesAndOrders() {
    const user = getCurrentUser();
    const params = new URLSearchParams();
    if (user?.id) params.set("userId", user.id);
    if (user?.email) params.set("email", user.email);
    try {
      const [balanceResponse, ordersResponse] = await Promise.all([
        fetch(`/api/assets/balances?${params.toString()}`, { cache: "no-store" }),
        fetch(`/api/orders/list?${params.toString()}`, { cache: "no-store" }),
      ]);
      const balanceData = await balanceResponse.json();
      const orderData = await ordersResponse.json();
      setBalances(balanceData.balances ?? []);
      setOrders(orderData.orders ?? []);
    } catch {
      setBalances([
        { asset: "USDT", available: "10000", frozen: "0" },
        { asset: "BTC", available: "0.1", frozen: "0" },
        { asset: "ETH", available: "2", frozen: "0" },
      ]);
    }
  }

  useEffect(() => {
    void loadMarketData(pair, period);
  }, [pair, period]);

  useEffect(() => {
    void loadBalancesAndOrders();
  }, []);

  async function placeOrder() {
    const user = getCurrentUser();
    if (!user) return setMessage("Please log in first.");
    if (!activeAmount || activeAmount <= 0) return setMessage("Enter a valid amount.");
    setLoadingOrder(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email, pair, side, type: orderType, amount: activeAmount, price: activePrice }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Order failed");
      setMessage("Order submitted.");
      setAmount("");
      await loadBalancesAndOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed");
    } finally {
      setLoadingOrder(false);
    }
  }

  async function cancelOrder(orderId: string) {
    const user = getCurrentUser();
    const response = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, userId: user?.id }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Cancel failed");
    await loadBalancesAndOrders();
  }

  return (
    <DemoShell titleKey="demoTrading" active="trading">
      <AuthGate message="Please log in to continue.">
        <section className="space-y-4 px-5 py-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-slate-300">Trading Pair</label>
                <select value={pair} onChange={(event) => setPair(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none">
                  {pairs.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
                </select>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Latest Price</p>
                <p className="text-2xl font-black text-cyan-200">{fmt(ticker.lastPrice, 8)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">24H Change</p>
                <p className={Number(ticker.change24h) >= 0 ? "text-2xl font-black text-emerald-300" : "text-2xl font-black text-rose-300"}>{Number(ticker.change24h) >= 0 ? "+" : ""}{fmt(ticker.change24h, 2)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Period</p>
                <p className="text-2xl font-black">{selectedPeriodLabel}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">24H High</p><p className="mt-1 font-bold">{fmt(ticker.high24h, 8)}</p></div>
              <div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">24H Low</p><p className="mt-1 font-bold">{fmt(ticker.low24h, 8)}</p></div>
              <div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">Volume</p><p className="mt-1 font-bold">{fmt(ticker.volume24h, 2)}</p></div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto text-xs font-bold text-slate-400">
              {periods.map((item) => (
                <button key={item.value} onClick={() => setPeriod(item.value)} className={period === item.value ? "rounded-full bg-cyan-300 px-3 py-1 text-slate-950" : "rounded-full border border-white/10 px-3 py-1 hover:text-white"}>{item.label}</button>
              ))}
            </div>
            <KlineChart data={klines} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <h2 className="font-black">Order Book</h2>
              <div className="mt-3 grid grid-cols-3 text-xs font-bold text-slate-500"><span>Price</span><span className="text-right">Amount</span><span className="text-right">Total</span></div>
              <div className="mt-2 space-y-1">
                {asks.slice(0, 8).reverse().map((row, index) => <div key={`s${index}`} className="grid grid-cols-3 text-xs text-rose-300"><span>{fmt(row.price, 8)}</span><span className="text-right">{fmt(row.amount, 6)}</span><span className="text-right">{fmt(row.total, 2)}</span></div>)}
                <div className="py-2 text-center text-lg font-black text-cyan-200">{fmt(latestPrice, 8)}</div>
                {bids.slice(0, 8).map((row, index) => <div key={`b${index}`} className="grid grid-cols-3 text-xs text-emerald-300"><span>{fmt(row.price, 8)}</span><span className="text-right">{fmt(row.amount, 6)}</span><span className="text-right">{fmt(row.total, 2)}</span></div>)}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <h2 className="font-black">Recent Trades</h2>
              <div className="mt-3 grid grid-cols-4 text-xs font-bold text-slate-500"><span>Price</span><span className="text-right">Amount</span><span className="text-right">Side</span><span className="text-right">Time</span></div>
              <div className="mt-2 space-y-2">
                {trades.slice(0, 12).map((trade) => <div key={trade.id} className="grid grid-cols-4 text-xs"><span className={trade.side === "buy" ? "text-emerald-300" : "text-rose-300"}>{fmt(trade.price, 8)}</span><span className="text-right text-slate-300">{fmt(trade.amount, 6)}</span><span className="text-right text-slate-400">{trade.side === "buy" ? "Buy" : "Sell"}</span><span className="text-right text-slate-500">{clock(trade.time)}</span></div>)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="grid grid-cols-2 gap-3"><button onClick={() => setSide("BUY")} className={side === "BUY" ? "rounded-2xl bg-emerald-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Buy</button><button onClick={() => setSide("SELL")} className={side === "SELL" ? "rounded-2xl bg-rose-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Sell</button></div>
            <div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => setOrderType("LIMIT")} className={orderType === "LIMIT" ? "rounded-2xl bg-cyan-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Limit</button><button onClick={() => setOrderType("MARKET")} className={orderType === "MARKET" ? "rounded-2xl bg-cyan-300 py-3 font-black text-slate-950" : "rounded-2xl border border-white/10 py-3 font-bold"}>Market</button></div>
            <input value={priceInput} disabled={orderType === "MARKET"} onChange={(event) => setPriceInput(event.target.value)} placeholder="Price" className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none disabled:opacity-50" />
            <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`Amount (${baseAsset})`} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none" />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">Available {quoteAsset}</p><p className="font-black">{fmt(quoteBalance, 6)}</p></div><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">Available {baseAsset}</p><p className="font-black">{fmt(baseBalance, 8)}</p></div><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">Total</p><p className="font-black">{fmt(total, 6)} {quoteAsset}</p></div><div className="rounded-2xl bg-black/25 p-3"><p className="text-slate-500">Fee 0.1%</p><p className="font-black">{fmt(fee, 6)} {quoteAsset}</p></div></div>
            {message && <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-100">{message}</p>}
            <button disabled={loadingOrder} onClick={placeOrder} className={side === "BUY" ? "mt-4 w-full rounded-2xl bg-emerald-300 py-4 font-black text-slate-950 disabled:opacity-50" : "mt-4 w-full rounded-2xl bg-rose-300 py-4 font-black text-slate-950 disabled:opacity-50"}>{loadingOrder ? "Submitting..." : side === "BUY" ? "Place Buy Order" : "Place Sell Order"}</button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"><h2 className="text-xl font-black">Open Orders</h2><div className="mt-4 space-y-3">{openOrders.length === 0 ? <p className="text-sm text-slate-500">No open orders.</p> : openOrders.map((order) => <div key={order.id} className="rounded-2xl bg-black/25 p-4 text-sm"><div className="flex justify-between"><span className="font-bold">{order.pair}</span><span>{order.side} · {order.status}</span></div><p className="mt-2 text-slate-400">{order.type} · {order.amount} @ {order.price}</p><button onClick={() => cancelOrder(order.id)} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold">Cancel</button></div>)}</div></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"><h2 className="text-xl font-black">Order History / Trade History</h2><div className="mt-4 space-y-3">{historyOrders.length === 0 ? <p className="text-sm text-slate-500">No history yet.</p> : historyOrders.map((order) => <div key={order.id} className="rounded-2xl bg-black/25 p-4 text-sm"><div className="flex justify-between"><span className="font-bold">{order.pair}</span><span className={order.side === "BUY" ? "text-emerald-300" : "text-rose-300"}>{order.side}</span></div><p className="mt-2 text-slate-400">{order.status} · Price {order.price} · Amount {order.amount} · Fee {order.fee}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p></div>)}</div></div>
        </section>
      </AuthGate>
    </DemoShell>
  );
}
