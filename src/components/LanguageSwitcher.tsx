"use client";

import { languages } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(event) => setLanguage(event.target.value as typeof language)}
      className="rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-xs font-bold text-cyan-100 outline-none hover:bg-white/10"
      aria-label="Language"
    >
      {languages.map((item) => (
        <option key={item.code} value={item.code} className="bg-[#07111f] text-white">
          {item.label}
        </option>
      ))}
    </select>
  );
}
