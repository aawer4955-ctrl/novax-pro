"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/lib/mock-auth";
import { validateAddressFormat } from "@/lib/address-validator";

const assets = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "LTC", "DOGE"];
const networks = ["TRC20", "ERC20", "BEP20", "BTC", "SOL", "XRP", "LTC", "DOGE"];

type AdminUser = {
  id: string;
  uid: string;
  email: string;
  kycStatus: string;
  accountStatus: string;
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
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

export default function AdminSendAddressPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [label, setLabel] = useState("");
  const [addresses, setAddresses] = useState<DepositAddressRecord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const activeAddress = useMemo(
    () => addresses.find((item) => item.asset === asset && item.network === network && item.status === "ACTIVE"),
    [addresses, asset, network],
  );

  async function searchUsers() {
    setError("");
    const response = await fetch(`/api/admin/users/search?query=${encodeURIComponent(query)}`, { cache: "no-store" });
    const data = await response.json();
    setUsers(data.users ?? []);
    if ((data.users ?? []).length === 0) setMessage("No matching users found.");
  }

  async function loadAddresses(userId = selectedUser?.id) {
    if (!userId) return;
    const response = await fetch(`/api/admin/deposit-addresses/list?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
    const data = await response.json();
    setAddresses(data.depositAddresses ?? []);
  }

  useEffect(() => {
    if (selectedUser) void loadAddresses(selectedUser.id);
  }, [selectedUser]);

  async function assignAddress() {
    setError("");
    setMessage("");
    if (!selectedUser) {
      setError("Select User");
      return;
    }
    if (!validateAddressFormat(asset, network, address)) {
      setError("Invalid address format");
      return;
    }

    setBusy(true);
    const admin = getCurrentUser();
    const response = await fetch("/api/admin/deposit-addresses/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        asset,
        network,
        address,
        memo,
        label,
        adminId: admin?.id ?? "default-admin",
      }),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Invalid address format");
      return;
    }

    setAddress("");
    setMemo("");
    setLabel("");
    setMessage("Address assigned successfully.");
    await loadAddresses(selectedUser.id);
  }

  async function disableAddress(addressId?: string) {
    if (!addressId) return;
    setBusy(true);
    const admin = getCurrentUser();
    const response = await fetch("/api/admin/deposit-addresses/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId, adminId: admin?.id ?? "default-admin" }),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to disable address.");
      return;
    }

    setMessage("Address disabled.");
    if (selectedUser) await loadAddresses(selectedUser.id);
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/admin">
            <h1 className="text-2xl font-black">NovaX Pro</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Send Deposit Address</p>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/admin/addresses" className="hover:text-white">Address Management</Link>
            <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/10">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Admin Console</p>
          <h2 className="mt-3 text-4xl font-black">Send Deposit Address</h2>
          <p className="mt-3 text-slate-400">Assign deposit addresses to verified platform users by asset and network.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <h3 className="text-xl font-black">Select User</h3>
            <div className="mt-5 flex gap-3">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email / UID" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300" />
              <button onClick={searchUsers} className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200">Search User</button>
            </div>

            <div className="mt-5 space-y-3">
              {users.map((user) => (
                <button key={user.id} onClick={() => setSelectedUser(user)} className={selectedUser?.id === user.id ? "w-full rounded-2xl border border-cyan-300/50 bg-cyan-300/10 p-4 text-left" : "w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left hover:border-cyan-300/40"}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black">{user.email}</p>
                      <p className="mt-1 text-sm text-slate-400">UID: {user.uid}</p>
                    </div>
                    <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300">{user.accountStatus}</span>
                  </div>
                  <div className="mt-3 flex gap-3 text-xs text-slate-400">
                    <span>KYC: {user.kycStatus}</span>
                    <span>Account: {user.accountStatus}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-sm text-cyan-100">Selected User</p>
                <p className="mt-2 font-black">{selectedUser.email}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <span>UID: {selectedUser.uid}</span>
                  <span>KYC: {selectedUser.kycStatus}</span>
                  <span>Account: {selectedUser.accountStatus}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <h3 className="text-xl font-black">Assign Address</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Asset</label>
                <select value={asset} onChange={(event) => setAsset(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none">{assets.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Network</label>
                <select value={network} onChange={(event) => setNetwork(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none">{networks.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select>
              </div>
            </div>
            <label className="mt-4 block text-sm text-slate-400">Address</label>
            <input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none focus:border-cyan-300" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Memo / Tag</label>
                <input value={memo} onChange={(event) => setMemo(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Label</label>
                <input value={label} onChange={(event) => setLabel(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300" />
              </div>
            </div>
            {error && <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-bold text-rose-200">{error}</p>}
            {message && <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200">{message}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button disabled={busy} onClick={assignAddress} className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-50">Send Address to User</button>
              <button disabled={busy} onClick={assignAddress} className="rounded-2xl border border-cyan-300/40 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-50">Save Address</button>
              <button disabled={busy || !activeAddress} onClick={() => disableAddress(activeAddress?.id)} className="rounded-2xl border border-rose-300/40 px-5 py-3 font-black text-rose-200 hover:bg-rose-400/10 disabled:opacity-40">Disable Address</button>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="text-xl font-black">Assigned Addresses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-black/25 text-slate-400"><tr><th className="px-5 py-4">Asset</th><th className="px-5 py-4">Network</th><th className="px-5 py-4">Address</th><th className="px-5 py-4">Memo / Tag</th><th className="px-5 py-4">Label</th><th className="px-5 py-4">Source</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Assigned At</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
              <tbody>
                {addresses.map((item) => (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="px-5 py-4 font-bold">{item.asset}</td>
                    <td className="px-5 py-4">{item.network}</td>
                    <td className="max-w-[320px] break-all px-5 py-4 font-mono text-xs text-cyan-100">{item.address}</td>
                    <td className="px-5 py-4 text-slate-300">{item.memo || "-"}</td>
                    <td className="px-5 py-4 text-slate-300">{item.label || "-"}</td>
                    <td className="px-5 py-4">{item.sourceType}</td>
                    <td className="px-5 py-4"><span className={item.status === "ACTIVE" ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300" : "rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300"}>{item.status}</span></td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(item.assignedAt)}</td>
                    <td className="px-5 py-4 text-right"><button disabled={item.status !== "ACTIVE" || busy} onClick={() => disableAddress(item.id)} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10 disabled:opacity-40">Disable</button></td>
                  </tr>
                ))}
                {addresses.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No addresses assigned.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
