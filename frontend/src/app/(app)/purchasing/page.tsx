import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { getLocale } from "@/lib/i18n/server";
import { PLANNED } from "@/features/modules/planned";

export const metadata = { title: "purchasing" };

export default async function Page() {
  const locale = await getLocale();
  const m = PLANNED.purchasing;
  return <ModulePlaceholder titleKey={m.titleKey} phase={m.phase[locale]} pages={m.pages[locale]} backend={m.backend?.[locale]} />;
}
