"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGates";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";
import { DemoUser } from "@/lib/auth-types";
import { getCurrentUser, logoutUser } from "@/lib/mock-auth";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    refresh();
    window.addEventListener("novax-auth-change", refresh);
    return () => window.removeEventListener("novax-auth-change", refresh);
  }, []);

  const logout = () => {
    logoutUser();
    router.push("/login");
  };

  const rows = user ? [
    [t("uid"), user.uid], [t("email"), user.email], [t("countryRegion"), user.country], [t("preferredLanguage"), user.language], [t("kycStatus"), user.kycStatus], [t("accountStatus"), user.accountStatus], [t("role"), user.role], [t("createdAt"), new Date(user.createdAt).toLocaleString()],
  ] : [];

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <AuthGate message={t("loginToContinue")}>
        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">NovaX Pro</p><h1 className="mt-3 text-4xl font-black">{t("accountCenter")}</h1></div><LanguageSwitcher /></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
            <div className="grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="rounded-2xl bg-black/25 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 font-bold text-slate-100">{value}</p></div>)}</div>
            <button onClick={logout} className="mt-6 w-full rounded-2xl bg-rose-300 py-4 font-black text-slate-950 hover:bg-rose-200">{t("logout")}</button>
          </div>
        </section>
      </AuthGate>
    </main>
  );
}
