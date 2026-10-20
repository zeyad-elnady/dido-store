"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  localize: (item: any, fieldPrefix: string) => string;
  formatPriceLocal: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Arabic ('ar') for Egypt locale
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("dido_lang") as Language | null;
      if (savedLang === "ar" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch (e) {
      // localStorage may not be available
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("dido_lang", lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || entry?.en || key;
  };

  const localize = (item: any, fieldPrefix: string): string => {
    if (!item) return "";
    const arVal = item[`${fieldPrefix}_ar`];
    const enVal = item[`${fieldPrefix}_en`];

    if (language === "ar") {
      return arVal || enVal || "";
    }
    return enVal || arVal || "";
  };

  const formatPriceLocal = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString();
    if (language === "ar") {
      return `${formatted} ج.م`;
    }
    return `${formatted} EGP`;
  };

  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        isRTL,
        setLanguage,
        toggleLanguage,
        t,
        localize,
        formatPriceLocal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
