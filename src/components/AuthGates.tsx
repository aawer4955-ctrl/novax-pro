"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoUser } from "@/lib/auth-types";
import { getCurrentUser } from "@/lib/mock-auth";
import { useLanguage } from "./LanguageProvider";

type GateProps = { children: React.ReactNode; message?: string };

export function AuthGate({ children, message = "Please log in to continue." }: GateProps) {
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const refresh = () => {
      setUser(getCurrentUser());
      setReady(true);
    };
    refresh();
    window.addEventListener("novax-auth-change", refresh);
    return () => window.removeEventListener("novax-auth-change", refresh);
  }, []);

  if (!ready) return <div className="p-6 text-sm text-slate-400">Loading...</div>;
  if (!user) {
    return (
      <section className="mx-auto max-w-md px-6 py-12 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">{t("platformMode")}</p>
          <h1 className="mt-4 text-2xl font-black">Authentication required</h1>
          <p className="mt-3 text-slate-400">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950">{t("login")}</Link>
            <Link href="/register" className="inline-flex rounded-2xl border border-white/15 px-6 py-3 font-black text-white hover:bg-white/10">{t("register")}</Link>
          </div>
        </div>
      </section>
    );
  }
  if (user.role !== "admin" && user.accountStatus !== "active") {
    return (
      <section className="mx-auto max-w-md px-6 py-12 text-center">
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200">Account Review</p>
          <h1 className="mt-4 text-2xl font-black">Account pending activation</h1>
          <p className="mt-3 text-slate-300">Your account has been created and is waiting for administrator approval.</p>
          <Link href="/mobile" className="mt-6 inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950">Back to News</Link>
        </div>
      </section>
    );
  }
  return <>{children}</>;
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const refresh = () => {
      setUser(getCurrentUser());
      setReady(true);
    };
    refresh();
    window.addEventListener("novax-auth-change", refresh);
    return () => window.removeEventListener("novax-auth-change", refresh);
  }, []);

  if (!ready) return <div className="p-6 text-sm text-slate-400">Loading...</div>;
  if (user?.role !== "admin") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12 text-center">
        <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-200">{t("platformAdminConsole")}</p>
          <h1 className="mt-4 text-3xl font-black">{t("adminAccessRequired")}</h1>
          <p className="mt-3 text-slate-300">Please sign in with an administrator account.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950">{t("login")}</Link>
        </div>
      </section>
    );
  }
  return <>{children}</>;
}

export function PlatformAdminBadge() {
  const { t } = useLanguage();
  return <div className="border-b border-cyan-300/10 bg-cyan-300/10 px-6 py-2 text-center text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">{t("platformAdminConsole")}</div>;
}


