"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { DemoShell } from "../components/DemoLayout";

const menuKeys = ["securityCenter", "verification", "language", "helpCenter", "logout"] as const;

export default function MinePage() {
  const { t } = useLanguage();
  return (
    <DemoShell titleKey="mine" active="mine">
      <section className="px-5 py-5"><div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-300 text-2xl font-black text-slate-950">DU</div><h2 className="mt-4 text-2xl font-black">{t("demoUser")}</h2><p className="mt-1 text-sm text-slate-400">{t("uid")} 10024018</p><p className="mt-3 rounded-full bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200">NovaX Pro Account</p></div></section>
      <section className="space-y-3 px-5">{menuKeys.map((item) => <Link key={item} href="/demo-placeholder" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4 font-bold"><span>{t(item)}</span><span className="text-slate-500">›</span></Link>)}</section>
    </DemoShell>
  );
}
