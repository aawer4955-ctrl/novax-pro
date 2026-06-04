"use client";

import { useEffect, useState } from "react";

type SettingsResponse = { settings?: Record<string, string>; appMode?: string; providerStatus?: Record<string, string> };

export default function AdminSettingsPage() {
  const [adminId, setAdminId] = useState("");
  const [reason, setReason] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState<SettingsResponse>({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const data = await response.json();
    setMeta(data);
    setSettings(data.settings ?? {});
  };

  useEffect(() => { void load(); }, []);

  async function save() {
    const response = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminId, reason, ...settings }) });
    const data = await response.json();
    setMessage(response.ok ? "Settings updated and audited." : data.error ?? "Save failed.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 px-6 py-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Platform Configuration</p><h1 className="mt-3 text-4xl font-black">Settings</h1><p className="mt-3 text-slate-400">Configure platform name, access guidance, announcement, and maintenance mode.</p></div></header>
      <section className="mx-auto max-w-4xl space-y-5 px-6 py-8">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-5 md:grid-cols-2">
          <input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
        </div>
        {[
          ["platformName", "Platform Name"],
          ["accessCodeHelpText", "Access Code Help Text"],
          ["frontAnnouncement", "Front Announcement"],
        ].map(([key, label]) => (
          <label key={key} className="block rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <span className="text-sm font-bold text-slate-300">{label}</span>
            <textarea value={settings[key] ?? ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="mt-3 min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none" />
          </label>
        ))}
        <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-5">
          <span className="font-bold">Maintenance Mode</span>
          <input type="checkbox" checked={settings.maintenanceMode === "true"} onChange={(e) => setSettings({ ...settings, maintenanceMode: String(e.target.checked) })} />
        </label>
        <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 text-sm text-slate-300">
          <p>APP_MODE: <span className="font-bold text-cyan-200">{meta.appMode}</span></p>
          <p className="mt-2">Provider Status: {JSON.stringify(meta.providerStatus ?? {})}</p>
        </div>
        {message && <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">{message}</div>}
        <button onClick={save} className="rounded-lg bg-cyan-300 px-6 py-3 font-black text-slate-950">Save Settings</button>
      </section>
    </main>
  );
}
