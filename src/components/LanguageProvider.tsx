"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LanguageCode, TranslationKey, isLanguageCode, translate } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("novax-language");
    if (saved && isLanguageCode(saved)) setLanguageState(saved);
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("novax-language", nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translate(language, key),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

