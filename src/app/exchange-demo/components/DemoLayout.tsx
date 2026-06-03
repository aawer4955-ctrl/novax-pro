"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TranslationKey } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const navItems = [
  { key: "home", href: "/exchange-demo" },
  { key: "quotes", href: "/exchange-demo/quotes" },
  { key: "coins", href: "/exchange-demo/coins" },
  { key: "trading", href: "/exchange-demo/trading" },
  { key: "derivatives", href: "/exchange-demo/derivatives" },
  { key: "assets", href: "/exchange-demo/assets" },
  { key: "mine", href: "/exchange-demo/mine" },
] as const;

export function DemoBottomNav({ active }: { active: string }) {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-7 border-t border-white/10 bg-[#050814]/95 px-2 py-3 text-center text-[10px] font-bold text-slate-500 backdrop-blur">
      {navItems.map((item) => (
        <Link key={item.key} href={item.href} className={active === item.key ? "text-cyan-300" : "hover:text-white"}>
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}

export function DemoShell({ titleKey, active, children }: { titleKey: TranslationKey; active: string; children: React.ReactNode }) {
  const { t } = useLanguage();

  async function logoutAccess() {
    await fetch("/api/access/logout", { method: "POST" });
    window.location.href = "/mobile";
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#050814] pb-24">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050814]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/exchange-demo">
              <h1 className="text-xl font-black">{t(titleKey)}</h1>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">Digital Asset Platform</p>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button onClick={logoutAccess} className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-white/10">
                Logout Access
              </button>
            </div>
          </div>
        </header>
        {children}
        <DemoBottomNav active={active} />
      </div>
    </main>
  );
}
