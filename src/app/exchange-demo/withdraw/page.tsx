"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGates";
import { useLanguage } from "@/components/LanguageProvider";
import { getCurrentUser } from "@/lib/mock-auth";
import { DemoShell } from "../components/DemoLayout";

type SavedAddress = { id: string; asset: string; network: string; label: string; address: string; memo: string; isActive?: boolean; isWhitelisted?: boolean };

const assets = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "LTC", "DOGE"];
const networkOptions: Record<string, string[]> = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  BTC: ["BTC"],
  ETH: ["ERC20"],
  SOL: ["SOL"],
  BNB: ["BEP20"],
  XRP: ["XRP"],
  LTC: ["LTC"],
  DOGE: ["DOGE"],
};

function calculateFee(asset: string, amount: string) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (asset === "USDT") return Math.max(value * 0.001, 1).toFixed(2);
  if (["BTC", "ETH"].includes(asset)) return (value * 0.0005).toFixed(8);
  return (value * 0.001).toFixed(6);
}

export default function DemoWithdrawPage() {
  const { t } = useLanguage();
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextNetworks = networkOptions[asset] ?? ["TRC20"];
    setNetwork(nextNetworks[0]);
    setSelectedAddressId("");
  }, [asset]);

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      if (!user) return;
      const response = await fetch(`/api/withdrawal-addresses/list?userId=${encodeURIComponent(user.id)}`, { cache: "no-store" });
      const data = await response.json();
      setAddresses(data.addresses ?? []);
    };
    void load();
  }, []);

  const matchingAddresses = useMemo(() => addresses.filter((item) => item.asset === asset && item.network === network && item.isActive !== false), [addresses, asset, network]);
  const selectedAddress = matchingAddresses.find((item) => item.id === selectedAddressId);
  const fee = calculateFee(asset, amount);

  const submit = async () => {
    const user = getCurrentUser();
    if (!user) return setMessage("Please log in first.");
    const destinationAddress = selectedAddress?.address || manualAddress.trim();
    if (!destinationAddress) return setMessage("Please enter a withdrawal address.");
    if (!amount || Number(amount) <= 0) return setMessage("Please enter a valid amount.");

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, asset, network, amount, fee, destinationAddress }),
      });
      const data = await response.json();
      setMessage(response.ok ? "Withdrawal request submitted for review." : data.error ?? "Failed to submit withdrawal.");
    } catch {
      setMessage("Withdrawal request could not be submitted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoShell titleKey="withdraw" active="assets">
      <AuthGate message={t("loginToContinue")}>
        <section className="space-y-4 px-5 py-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">{t("withdraw")}</h1>
                <p className="mt-2 text-sm text-slate-400">Select an asset, network, and approved withdrawal address.</p>
              </div>
              <Link href="/exchange-demo/withdraw/address-book" className="rounded-2xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-200">{t("addressBook")}</Link>
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("asset")}</label>
            <select value={asset} onChange={(e) => setAsset(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none">
              {assets.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
            </select>

            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("network")}</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none">
              {(networkOptions[asset] ?? []).map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}
            </select>

            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("withdrawalAddress")}</label>
            <select value={selectedAddressId} onChange={(e) => { setSelectedAddressId(e.target.value); setManualAddress(""); }} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none">
              <option className="bg-[#07111f]" value="">Manual input</option>
              {matchingAddresses.map((item) => <option key={item.id} value={item.id} className="bg-[#07111f]">{item.label || item.address}</option>)}
            </select>
            {!selectedAddress && <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Withdrawal Address" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none" />}
            {selectedAddress && <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-100 break-all">{selectedAddress.address}{selectedAddress.memo ? <p className="mt-2">{t("memo")}: {selectedAddress.memo}</p> : null}</div>}

            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("amount")}</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" inputMode="decimal" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none" />
            <div className="mt-3 rounded-2xl bg-black/25 p-4 text-sm text-slate-300"><span className="text-slate-500">{t("fee")}: </span>{fee} {asset}</div>
            <button onClick={submit} disabled={loading} className="mt-4 w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950 disabled:opacity-60">{loading ? "Submitting..." : t("submitWithdrawal")}</button>
            {message && <p className="mt-4 text-sm font-bold text-cyan-200">{message}</p>}
          </div>
          <Link href="/exchange-demo/transactions" className="block rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm font-black text-cyan-200">{t("withdrawalHistory")}</Link>
        </section>
      </AuthGate>
    </DemoShell>
  );
}
