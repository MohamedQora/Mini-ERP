/**
 * Egyptian phone normalization. Accepts 01012345678, +201012345678, 00201012345678, 201012345678,
 * with spaces/dashes. Returns E.164 (+20XXXXXXXXXX) for mobile numbers (010/011/012/015) or null.
 * Landlines are not normalized here on purpose (area codes vary); handle them when a screen needs them.
 */
export function normalizeEgyptMobile(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  // Arabic-Indic digits -> Latin
  d = d.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0020")) d = d.slice(2);
  if (d.startsWith("20") && d.length === 12) d = "0" + d.slice(2);
  if (!/^01[0125]\d{8}$/.test(d)) return null;
  return "+20" + d.slice(1);
}

export const GOVERNORATES: { en: string; ar: string }[] = [
  { en: "Cairo", ar: "القاهرة" }, { en: "Giza", ar: "الجيزة" }, { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Qalyubia", ar: "القليوبية" }, { en: "Port Said", ar: "بورسعيد" }, { en: "Suez", ar: "السويس" },
  { en: "Damietta", ar: "دمياط" }, { en: "Dakahlia", ar: "الدقهلية" }, { en: "Sharqia", ar: "الشرقية" },
  { en: "Gharbia", ar: "الغربية" }, { en: "Monufia", ar: "المنوفية" }, { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { en: "Beheira", ar: "البحيرة" }, { en: "Ismailia", ar: "الإسماعيلية" }, { en: "Faiyum", ar: "الفيوم" },
  { en: "Beni Suef", ar: "بني سويف" }, { en: "Minya", ar: "المنيا" }, { en: "Asyut", ar: "أسيوط" },
  { en: "Sohag", ar: "سوهاج" }, { en: "Qena", ar: "قنا" }, { en: "Luxor", ar: "الأقصر" },
  { en: "Aswan", ar: "أسوان" }, { en: "Red Sea", ar: "البحر الأحمر" }, { en: "New Valley", ar: "الوادي الجديد" },
  { en: "Matrouh", ar: "مطروح" }, { en: "North Sinai", ar: "شمال سيناء" }, { en: "South Sinai", ar: "جنوب سيناء" },
];
