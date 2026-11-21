import en, { type DictKey } from "./en";
import ar from "./ar";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";
export const dir = (l: Locale): "ltr" | "rtl" => (l === "ar" ? "rtl" : "ltr");
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "ar";

export const dictionaries: Record<Locale, Record<DictKey, string>> = { en, ar };
export type { DictKey };

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>) {
  let s: string = dictionaries[locale][key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
