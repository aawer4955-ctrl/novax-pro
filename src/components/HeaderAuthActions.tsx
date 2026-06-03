"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoUser } from "@/lib/auth-types";
import { getCurrentUser, logoutUser } from "@/lib/mock-auth";
import { useLanguage } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function HeaderAuthActions() {
  const { t } = useLanguage();
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    refresh();
    window.addEventListener("novax-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("novax-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <LanguageSwitcher />
      <Link href="/account" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
        {t("account")}
      </Link>
      {user ? (
        <>
          <span className="hidden max-w-40 truncate text-xs text-cyan-200 sm:inline">{user.email}</span>
          <button onClick={logoutUser} className="rounded-xl bg-rose-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-rose-200">
            {t("logout")}
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="rounded-xl border border-white/15 px-5 py-2 text-sm hover:bg-white/10">{t("login")}</Link>
          <Link href="/register" className="rounded-xl bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200">{t("register")}</Link>
        </>
      )}
    </div>
  );
}
