"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";
import { loginUser } from "@/lib/mock-auth";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    try {
      loginUser(email, password);
      setError("");
      router.push("/exchange-demo/assets");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050814_0%,#07152b_50%,#031017_100%)]" />
        <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="flex items-center justify-between gap-3"><Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">Back to Home</Link><LanguageSwitcher /></div>
          <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">{t("platformMode")}</p><h1 className="mt-3 text-3xl font-black">{t("login")}</h1><p className="mt-3 text-slate-400">Secure account access for NovaX Pro users.</p></div>
          <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="email">{t("email")}</label><input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-cyan-300" /></div>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="password">{t("password")}</label><input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Admin123456" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-cyan-300" /></div>
            {error && <p className="text-sm font-bold text-rose-300">{error}</p>}
            <button type="submit" className="w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950 hover:bg-cyan-200">{t("login")}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">Administrator access is restricted to approved operator accounts.</p>
          <p className="mt-3 text-center text-sm text-slate-400">Don&apos;t have an account? <Link href="/register" className="font-bold text-cyan-300">{t("register")}</Link></p>
        </div>
      </section>
    </main>
  );
}
