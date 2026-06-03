import Link from "next/link";

export function AdminComplianceStrip() {
  return (
    <div className="mx-auto mb-6 grid max-w-7xl gap-3 px-6 pt-6 md:grid-cols-5">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">Mode: Platform</div>
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">KYC: Required</div>
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">AML: Mock screening</div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-slate-200">Regions: Rule checked</div>
      <Link href="/api/ledger/list" className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-cyan-200 hover:bg-white/10">Ledger Entry</Link>
    </div>
  );
}
