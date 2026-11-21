"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { dir, translate, type DictKey, type Locale } from "./index";

type Ctx = { locale: Locale; dir: "ltr" | "rtl"; t: (key: DictKey, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = useCallback((key: DictKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
  const value = useMemo(() => ({ locale, dir: dir(locale), t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
}
