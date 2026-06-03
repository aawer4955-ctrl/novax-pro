import Link from "next/link";

export default function DemoPlaceholderPage() {
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-7 text-center shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300"></p>
          <h1 className="mt-4 text-3xl font-black">This feature is currently a local .</h1>
          <p className="mt-5 leading-7 text-slate-300">Please return to the main platform.</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/exchange-demo" className="rounded-2xl bg-cyan-300 px-6 py-4 font-black text-slate-950 hover:bg-cyan-200">Back to Exchange</Link>
            <Link href="/mobile" className="rounded-2xl border border-white/15 px-6 py-4 font-bold hover:bg-white/10">Back to Mobile Page</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
