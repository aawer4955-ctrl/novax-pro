"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageCode, languages } from "@/lib/i18n";
import { registerUser } from "@/lib/mock-auth";

const countries = ["United States", "China", "Hong Kong", "Japan", "Korea", "Germany", "France", "Spain", "Brazil", "UAE"];

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState(countries[0]);
  const [preferredLanguage, setPreferredLanguage] = useState(language);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!accepted) return setError("Please agree to Terms / Privacy / Risk Disclosure");
    try {
      registerUser({ email, password, country, language: preferredLanguage });
      router.push("/exchange-demo/assets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050814_0%,#07152b_50%,#031017_100%)]" />
        <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="flex items-center justify-between gap-3"><Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">Back to Home</Link><LanguageSwitcher /></div>
          <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">{t("platformMode")}</p><h1 className="mt-3 text-3xl font-black">{t("register")}</h1><p className="mt-3 text-slate-400">Create an account for platform access. New accounts require administrator activation.</p></div>
          <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="register-email">{t("email")}</label><input id="register-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-cyan-300" /></div>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="register-password">{t("password")}</label><input id="register-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-cyan-300" /></div>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="confirm-password">{t("confirmPassword")}</label><input id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-cyan-300" /></div>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="country">{t("countryRegion")}</label><select id="country" value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-cyan-300">{countries.map((item) => <option key={item} className="bg-[#07111f]">{item}</option>)}</select></div>
            <div><label className="text-sm font-bold text-slate-300" htmlFor="preferred-language">Preferred Language</label><select id="preferred-language" value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value as LanguageCode)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-cyan-300">{languages.map((item) => <option key={item.code} value={item.code} className="bg-[#07111f]">{item.label}</option>)}</select></div>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-400"><input checked={accepted} onChange={(event) => setAccepted(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 accent-cyan-300" /><span>I agree to Terms / Privacy / Risk Disclosure.</span></label>
            {error && <p className="text-sm font-bold text-rose-300">{error}</p>}
            <button type="submit" className="w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950 hover:bg-cyan-200">{t("register")}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
