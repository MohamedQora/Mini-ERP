import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, translate, type DictKey, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** Server-side translator. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: (key: DictKey, vars?: Record<string, string | number>) => translate(locale, key, vars) };
}
