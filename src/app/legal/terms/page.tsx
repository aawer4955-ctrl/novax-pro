import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm font-bold text-cyan-300">NovaX Pro</Link>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Platform Mode</p>
          <h1 className="mt-4 text-4xl font-black">Terms of Service</h1>
          <div className="mt-6 space-y-4 leading-8 text-slate-300">
            <p>The current NovaX Pro system is a local platform and production architecture preparation environment.</p>
            <p>Before any real service goes live, licensed compliance, payment, custody, KYC, and AML providers must be configured and approved.</p>
            <p>Trading, deposits, and withdrawals are only available in permitted regions and only after required KYC/AML checks are completed.</p>
            <p>Digital assets involve market, liquidity, technology, custody, regulatory, and operational risks. Users must understand these risks before using any production service.</p>
            <p>Deposits, withdrawals, wallets, and trading services are subject to account eligibility and regional availability.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

