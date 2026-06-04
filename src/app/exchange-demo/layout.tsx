import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExchangeLayout({ children }: { children: React.ReactNode }) {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "maintenanceMode" } });
  if (setting?.value === "true") {
    return (
      <main className="min-h-screen bg-[#050814] px-6 py-16 text-white">
        <section className="mx-auto max-w-md rounded-lg border border-white/10 bg-white/[0.05] p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Maintenance</p>
          <h1 className="mt-4 text-3xl font-black">Maintenance</h1>
          <p className="mt-3 text-slate-300">The trading area is temporarily unavailable while platform maintenance is in progress.</p>
        </section>
      </main>
    );
  }
  return <>{children}</>;
}
