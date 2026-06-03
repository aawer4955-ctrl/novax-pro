"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGates";
import { getCurrentUser } from "@/lib/mock-auth";
import { DemoShell } from "../components/DemoLayout";

const assets = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "LTC", "DOGE"];
const networks = ["TRC20", "ERC20", "BEP20", "BTC", "SOL", "XRP", "LTC", "DOGE"];

type AddressResult = {
  id: string;
  asset: string;
  network: string;
  address: string;
  memo?: string | null;
  label?: string | null;
  assignedAt?: string | null;
};

export default function DepositPage() {
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [result, setResult] = useState<AddressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadAddress() {
      const user = getCurrentUser();
      setLoading(true);
      setCopied(false);
      const response = await fetch("/api/deposit-address/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, email: user?.email, asset, network }),
      });
      const data = await response.json();
      setResult(data.address ? data : null);
      setLoading(false);
    }

    void loadAddress();
  }, [asset, network]);

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.address);
    setCopied(true);
  }

  return (
    <DemoShell titleKey="deposit" active="assets">
      <AuthGate>
        <section className="space-y-4 px-5 py-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <h1 className="text-2xl font-black">Deposit</h1>
            <label className="mt-5 block text-sm text-slate-400">Select Asset</label>
            <select value={asset} onChange={(event) => setAsset(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none">
              {assets.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
            </select>
            <label className="mt-4 block text-sm text-slate-400">Select Network</label>
            <select value={network} onChange={(event) => setNetwork(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none">
              {networks.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
            </select>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-cyan-100">Deposit Address</p>
                <p className="mt-1 text-xs text-slate-400">{asset} · {network}</p>
              </div>
              <Link href="/exchange-demo/assets" className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-white/10">Deposit History</Link>
            </div>

            {loading && <p className="mt-5 rounded-2xl bg-black/30 p-4 text-sm text-slate-400">Loading address...</p>}

            {!loading && result && (
              <>
                <p className="mt-5 break-all rounded-2xl bg-black/30 p-4 font-mono text-sm">{result.address}</p>
                {result.memo && (
                  <>
                    <p className="mt-4 text-sm text-cyan-100">Memo / Tag</p>
                    <p className="mt-2 rounded-2xl bg-black/30 p-4 font-mono text-sm">{result.memo}</p>
                  </>
                )}
                <button onClick={copy} className="mt-4 rounded-2xl bg-white px-5 py-3 font-black text-slate-950">{copied ? "Copied" : "Copy Address"}</button>
              </>
            )}

            {!loading && !result && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="font-black">Address not assigned yet</p>
                <p className="mt-2 text-sm text-slate-400">Awaiting address assignment. Contact support for assistance.</p>
              </div>
            )}
          </div>
        </section>
      </AuthGate>
    </DemoShell>
  );
}
