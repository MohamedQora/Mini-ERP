import type { Locale } from "./i18n";

/** Latin digits in both languages keep numbers consistent with Montserrat and with exports/invoices. */
const intl = (l: Locale) => (l === "ar" ? "ar-EG-u-nu-latn" : "en-EG");

export function formatMoney(amount: number | string | null | undefined, currency = "EGP", locale: Locale = "en") {
  const n = Number(amount);
  if (amount === null || amount === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(intl(locale), { style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function formatNumber(n: number | string | null | undefined, locale: Locale = "en", digits = 0) {
  const v = Number(n);
  if (n === null || n === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat(intl(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

export function formatDate(value: string | Date | null | undefined, locale: Locale = "en", timeZone = "Africa/Cairo", withTime = false) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(intl(locale), { timeZone, year: "numeric", month: "short", day: "2-digit", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(d);
}
