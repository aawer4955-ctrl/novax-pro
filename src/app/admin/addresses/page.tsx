"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/lib/mock-auth";

type UserSummary = {
  id: string;
  uid: string;
  email: string;
};

type DepositAddressRecord = {
  id: string;
  asset: string;
  network: string;
  address: string;
  memo?: string | null;
  label?: string | null;
  sourceType: string;
  status: string;
  assignedAt?: string | null;
  createdAt: string;
  user?: UserSummary;
  assignedByAdmin?: UserSummary | null;
};

type WithdrawalAddressRecord = {
  id: string;
  asset: string;
  network: string;
  address: string;
  memo?: string | null;
  label?: string | null;
  isWhitelisted: boolean;
  createdAt: string;
  user?: UserSummary;
};

type TableRecord = {
  id: string;
  type: "Deposit" | "Withdrawal";
  userEmail: string;
  uid: string;
  asset: string;
  network: string;
  address: string;
  memo: string;
  label: string;
  source: string;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  assignedAt?: string | null;
  assignedBy: string;
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

export default function AdminAddressesPage() {
  const [deposits, setDeposits] = useState<DepositAddressRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalAddressRecord[]>([]);
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState("All");
  const [network, setNetwork] = useState("All");
  const [status, setStatus] = useState("All");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/addresses/status", { cache: "no-store" });
    const data = await response.json();
    setDeposits(data.depositAddresses ?? []);
    setWithdrawals(data.withdrawalAddresses ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const records = useMemo<TableRecord[]>(() => {
    const depositRecords = deposits.map((item) => ({
      id: item.id,
      type: "Deposit" as const,
      userEmail: item.user?.email ?? "-",
      uid: item.user?.uid ?? "-",
      asset: item.asset,
      network: item.network,
      address: item.address,
      memo: item.memo ?? "-",
      label: item.label ?? "-",
      source: item.sourceType,
      status: item.status === "ACTIVE" ? "ACTIVE" as const : "DISABLED" as const,
      createdAt: item.createdAt,
      assignedAt: item.assignedAt,
      assignedBy: item.assignedByAdmin?.uid ?? "-",
    }));

    const withdrawalRecords = withdrawals.map((item) => ({
      id: item.id,
      type: "Withdrawal" as const,
      userEmail: item.user?.email ?? "-",
      uid: item.user?.uid ?? "-",
      asset: item.asset,
      network: item.network,
      address: item.address,
      memo: item.memo ?? "-",
      label: item.label ?? "-",
      source: "USER_SAVED",
      status: item.isWhitelisted ? "ACTIVE" as const : "DISABLED" as const,
      createdAt: item.createdAt,
      assignedAt: null,
      assignedBy: "-",
    }));

    return [...depositRecords, ...withdrawalRecords].filter((item) => {
      const text = `${item.userEmail} ${item.uid} ${item.address} ${item.label}`.toLowerCase();
      return (
        (!query || text.includes(query.toLowerCase())) &&
        (asset === "All" || item.asset === asset) &&
        (network === "All" || item.network === network) &&
        (status === "All" || item.status === status)
      );
    });
  }, [deposits, withdrawals, query, asset, network, status]);

  const assetOptions = ["All", ...Array.from(new Set([...deposits, ...withdrawals].map((item) => item.asset)))];
  const networkOptions = ["All", ...Array.from(new Set([...deposits, ...withdrawals].map((item) => item.network)))];

  async function toggle(item: TableRecord) {
    setBusyId(item.id);
    const admin = getCurrentUser();
    await fetch("/api/admin/addresses/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        type: item.type,
        enabled: item.status !== "ACTIVE",
        adminId: admin?.id ?? "default-admin",
      }),
    });
    setBusyId("");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/admin">
            <h1 className="text-2xl font-black">NovaX Pro</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Address Management</p>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/admin/send-address" className="hover:text-white">Send Deposit Address</Link>
            <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/10">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p>
            <h2 className="mt-3 text-4xl font-black">Address Management</h2>
            <p className="mt-3 text-slate-400">Review user deposit and withdrawal addresses across assets and networks.</p>
          </div>
          <Link href="/admin/send-address" className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200">Send Deposit Address</Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_160px_160px_160px]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email, UID, address" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 outline-none focus:border-cyan-300" />
          <select value={asset} onChange={(event) => setAsset(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 outline-none">{assetOptions.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select>
          <select value={network} onChange={(event) => setNetwork(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 outline-none">{networkOptions.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 outline-none">{["All", "ACTIVE", "DISABLED"].map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400">
                <tr>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Asset</th>
                  <th className="px-5 py-4">Network</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Memo / Tag</th>
                  <th className="px-5 py-4">Label</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created At</th>
                  <th className="px-5 py-4">Assigned At</th>
                  <th className="px-5 py-4">Assigned By</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-t border-white/5">
                    <td className="px-5 py-4 font-bold">{item.type}</td>
                    <td className="px-5 py-4"><p className="font-bold">{item.userEmail}</p><p className="mt-1 text-xs text-slate-500">UID: {item.uid}</p></td>
                    <td className="px-5 py-4">{item.asset}</td>
                    <td className="px-5 py-4">{item.network}</td>
                    <td className="max-w-[300px] break-all px-5 py-4 font-mono text-xs text-cyan-100">{item.address}</td>
                    <td className="px-5 py-4 text-slate-300">{item.memo}</td>
                    <td className="px-5 py-4 text-slate-300">{item.label}</td>
                    <td className="px-5 py-4">{item.source}</td>
                    <td className="px-5 py-4"><span className={item.status === "ACTIVE" ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300" : "rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300"}>{item.status}</span></td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(item.assignedAt)}</td>
                    <td className="px-5 py-4 text-slate-300">{item.assignedBy}</td>
                    <td className="px-5 py-4 text-right"><button disabled={busyId === item.id} onClick={() => toggle(item)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-40">{item.status === "ACTIVE" ? "Disable" : "Enable"}</button></td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={13} className="px-5 py-8 text-center text-slate-400">No addresses found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
