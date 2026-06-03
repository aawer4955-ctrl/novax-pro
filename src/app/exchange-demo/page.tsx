import Link from "next/link";

const markets = [
  { symbol: "BTC/USDT", price: "68,421.20", change: "+2.84%" },
  { symbol: "ETH/USDT", price: "3,248.10", change: "+1.62%" },
  { symbol: "SOL/USDT", price: "148.35", change: "+3.21%" },
  { symbol: "BNB/USDT", price: "612.80", change: "+0.94%" },
];

export default function ExchangeHomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="px-5 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">NovaX Pro</h1>
            <p className="text-xs tracking-[0.35em] text-cyan-300">
              DIGITAL ASSET PLATFORM
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"
          >
            Login
          </Link>
        </div>
        <Link href="/register" className="mb-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-slate-200">
          Register
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
          <p className="mb-2 text-sm text-cyan-300">Featured Market</p>
          <h2 className="text-3xl font-black">BTC/USDT Perpetual</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Trade digital assets with real-time market views, asset management,
            order records, and account controls.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-black/30 p-3">
              <p className="text-xs text-slate-400">Price</p>
              <p className="font-bold">68,421.20</p>
            </div>
            <div className="rounded-2xl bg-black/30 p-3">
              <p className="text-xs text-slate-400">24H Change</p>
              <p className="font-bold text-emerald-300">+2.84%</p>
            </div>
            <div className="rounded-2xl bg-black/30 p-3">
              <p className="text-xs text-slate-400">Volume</p>
              <p className="font-bold">1.28B</p>
            </div>
          </div>

          <Link
            href="/exchange-demo/trading"
            className="mt-6 block rounded-2xl bg-emerald-400 py-4 text-center font-black text-slate-950"
          >
            Open Trading Panel
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/exchange-demo/deposit"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold"
          >
            Deposit
          </Link>
          <Link
            href="/exchange-demo/withdraw"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold"
          >
            Withdraw
          </Link>
          <Link
            href="/exchange-demo/assets"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold"
          >
            Assets
          </Link>
          <Link
            href="/exchange-demo/quotes"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold"
          >
            Quotes
          </Link>
        </div>

        <section className="mt-8">
          <h3 className="mb-4 text-lg font-black">Markets</h3>
          <div className="space-y-3">
            {markets.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-bold">{item.symbol}</p>
                  <p className="text-xs text-slate-400">Spot</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.price}</p>
                  <p className="text-sm text-emerald-300">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
