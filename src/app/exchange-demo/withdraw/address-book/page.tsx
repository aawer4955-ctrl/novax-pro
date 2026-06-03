"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGates";
import { getCurrentUser } from "@/lib/mock-auth";
import { DemoShell } from "../../components/DemoLayout";

const assets = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "LTC", "DOGE"];
const networks = ["TRC20", "ERC20", "BEP20", "BTC", "SOL", "XRP", "LTC", "DOGE"];
type Address = { id: string; asset: string; network: string; label: string; address: string; memo?: string };

function testAddress(network: string) {
  const seed = Math.random().toString(36).slice(2).padEnd(40, "x");
  if (["ERC20", "BEP20"].includes(network)) return `0x${seed.slice(0, 40)}`;
  if (network === "TRC20") return `T${seed.slice(0, 33)}`;
  if (network === "BTC") return `bc1q${seed.slice(0, 38)}`;
  if (network === "XRP") return `r${seed.slice(0, 33)}`;
  if (network === "LTC") return `ltc1q${seed.slice(0, 38)}`;
  if (network === "DOGE") return `D${seed.slice(0, 33)}`;
  return seed.slice(0, 44);
}

export default function AddressBookPage() {
  const user = typeof window === "undefined" ? null : getCurrentUser();
  const userId = user?.id ?? "guest-user";
  const [items, setItems] = useState<Address[]>([]);
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [label, setLabel] = useState("Main address");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  async function load() { const r = await fetch(`/api/withdrawal-addresses/list?userId=${userId}`); const d = await r.json(); setItems(d.addresses ?? []); }
  async function add() { await fetch("/api/withdrawal-addresses/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, asset, network, label, address, memo }) }); setAddress(""); await load(); }
  async function remove(id: string) { await fetch("/api/withdrawal-addresses/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, userId }) }); await load(); }
  useEffect(() => { load(); }, []);
  return <DemoShell titleKey="assets" active="assets"><AuthGate><section className="space-y-4 px-5 py-5"><div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><h1 className="text-2xl font-black">Address Book</h1><div className="mt-4 grid grid-cols-2 gap-3"><select value={asset} onChange={(e) => setAsset(e.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">{assets.map((item) => <option key={item}>{item}</option>)}</select><select value={network} onChange={(e) => setNetwork(e.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">{networks.map((item) => <option key={item}>{item}</option>)}</select></div><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Withdrawal Address" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" /><input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Memo / Tag" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" /><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setAddress(testAddress(network))} className="rounded-2xl border border-white/15 py-3 font-bold">Generate Test Address</button><button onClick={add} className="rounded-2xl bg-cyan-300 py-3 font-black text-slate-950">Add Address</button></div></div>{items.map((item) => <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"><div className="flex justify-between"><h3 className="font-black">{item.label}</h3><button onClick={() => remove(item.id)} className="text-sm font-bold text-rose-300">Delete</button></div><p className="mt-2 text-sm text-slate-400">{item.asset} · {item.network}</p><p className="mt-2 break-all font-mono text-xs text-cyan-100">{item.address}</p>{item.memo && <p className="mt-2 text-xs text-slate-400">Memo: {item.memo}</p>}</div>)}</section></AuthGate></DemoShell>;
}
